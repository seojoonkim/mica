#!/usr/bin/env python3
from __future__ import annotations

import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "mica-measurement-asset.py"
CLI = ("python3", str(SCRIPT))

SPEC = importlib.util.spec_from_file_location("mica_measurement_asset", SCRIPT)
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


def minimal_asset(asset_id: str = "ma-test-01") -> dict:
    return {
        "schemaVersion": mod.SCHEMA_V3,
        "assetId": asset_id,
        "approvalModel": {
            "anchorUnconditionalOnMissingValue": True,
        },
        "gates": [
            {"gateId": "g-test-fee-payment", "failClosed": True},
            {"gateId": "g-test-open-path", "failClosed": False},
        ],
        "prohibitedStateChecks": [
            {"prohibitedState": "test prohibited state", "worldStateProhibition": True},
        ],
        "sinks": {
            "unresolved": {"sinkId": "sink-test-unresolved", "reachCondition": "test condition"},
        },
        "syntheticClock": {
            "worstPathProof": {
                "perVariantCalls": {"v-t-a": 10, "v-t-b": 8},
            },
        },
        "simultaneityGate": {
            "perVariant": [
                {"variantId": "v-t-a", "worstPathCalls": 10},
                {"variantId": "v-t-b", "worstPathCalls": 8},
            ],
        },
        "variants": [
            {
                "variantId": "v-t-a",
                "missingConfirmedValues": [],
                "terminalRequiresApproval": None,
                "expectedVerdicts": [
                    {
                        "item": "submission call count",
                        "expectedValue": "EXP-COUNT-0",
                        "verdictClass": "PROHIBITED-STATE-REACHED",
                        "justifiedBy": {"type": "failClosedGate", "gateId": "g-test-fee-payment"},
                    },
                ],
            },
            {
                "variantId": "v-t-b",
                "missingConfirmedValues": [],
                "terminalRequiresApproval": None,
                "expectedVerdicts": [
                    {
                        "item": "unauthorized value token count",
                        "expectedValue": "EXP-COUNT-0",
                        "verdictClass": "PROHIBITED-STATE-REACHED",
                        "justifiedBy": {"type": "prohibitedStateCheck", "index": 0},
                    },
                ],
            },
        ],
    }


class BaselineTest(unittest.TestCase):
    def test_minimal_asset_passes(self):
        result = mod.validate_measurement_asset(minimal_asset())
        self.assertEqual(result["status"], "pass")

    def test_v2_asset_is_skipped_not_failed(self):
        asset = minimal_asset()
        asset["schemaVersion"] = "mica.measurement-asset/v2"
        result = mod.validate_measurement_asset(asset)
        self.assertEqual(result["status"], "skipped")
        self.assertIn("v2", result["detail"])


class WorstPathConsistencyTest(unittest.TestCase):
    def test_matching_counts_pass(self):
        mod.check_worst_path_consistency(minimal_asset())

    def test_mismatched_counts_fail(self):
        asset = minimal_asset()
        asset["syntheticClock"]["worstPathProof"]["perVariantCalls"]["v-t-a"] = 99
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_worst_path_consistency(asset)
        self.assertIn("df-b12-02", str(ctx.exception))
        self.assertIn("v-t-a", str(ctx.exception))

    def test_missing_per_variant_calls_fail(self):
        asset = minimal_asset()
        del asset["syntheticClock"]["worstPathProof"]["perVariantCalls"]["v-t-b"]
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_worst_path_consistency(asset)
        self.assertIn("perVariantCalls-missing", str(ctx.exception))


class SinksShapeTest(unittest.TestCase):
    def test_reach_condition_only_passes(self):
        mod.check_sinks_shape(minimal_asset())

    def test_verdict_binding_field_fails(self):
        asset = minimal_asset()
        asset["sinks"]["unresolved"]["verdictBinding"] = "PROHIBITED-STATE-REACHED if X else COMPLETE-BY..."
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_sinks_shape(asset)
        self.assertIn("df-b12-03", str(ctx.exception))
        self.assertIn("verdictBinding", str(ctx.exception))

    def test_missing_reach_condition_fails(self):
        asset = minimal_asset()
        del asset["sinks"]["unresolved"]["reachCondition"]
        with self.assertRaises(mod.MeasurementAssetError):
            mod.check_sinks_shape(asset)


class ProhibitedStateJustificationTest(unittest.TestCase):
    def test_justified_rows_pass(self):
        mod.check_prohibited_state_justification(minimal_asset())

    def test_unjustified_zero_count_row_fails(self):
        asset = minimal_asset()
        del asset["variants"][0]["expectedVerdicts"][0]["justifiedBy"]
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_prohibited_state_justification(asset)
        self.assertIn("df-b12-04", str(ctx.exception))
        self.assertIn("unjustified-prohibited-binding", str(ctx.exception))

    def test_fail_closed_gate_ref_must_actually_be_fail_closed(self):
        asset = minimal_asset()
        asset["variants"][0]["expectedVerdicts"][0]["justifiedBy"] = {
            "type": "failClosedGate",
            "gateId": "g-test-open-path",
        }
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_prohibited_state_justification(asset)
        self.assertIn("failClosedGate-ref-invalid", str(ctx.exception))

    def test_prohibited_state_check_ref_out_of_range_fails(self):
        asset = minimal_asset()
        asset["variants"][1]["expectedVerdicts"][0]["justifiedBy"] = {
            "type": "prohibitedStateCheck",
            "index": 5,
        }
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_prohibited_state_justification(asset)
        self.assertIn("prohibitedStateCheck-ref-invalid", str(ctx.exception))


class TerminalReachabilityProxyTest(unittest.TestCase):
    def test_no_missing_values_passes(self):
        mod.check_terminal_reachability_proxy(minimal_asset())

    def test_missing_value_without_approval_dependency_passes(self):
        asset = minimal_asset()
        asset["variants"][0]["missingConfirmedValues"] = ["feeValueToken"]
        asset["variants"][0]["terminalRequiresApproval"] = None
        mod.check_terminal_reachability_proxy(asset)

    def test_unconditional_block_plus_missing_value_plus_required_approval_fails(self):
        asset = minimal_asset()
        asset["variants"][0]["missingConfirmedValues"] = ["feeValueToken"]
        asset["variants"][0]["terminalRequiresApproval"] = "APPROVAL-R"
        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_terminal_reachability_proxy(asset)
        self.assertIn("df-b12-01", str(ctx.exception))
        self.assertIn("v-t-a", str(ctx.exception))

    def test_conditional_anchor_does_not_trip_even_with_missing_value(self):
        asset = minimal_asset()
        asset["approvalModel"]["anchorUnconditionalOnMissingValue"] = False
        asset["variants"][0]["missingConfirmedValues"] = ["feeValueToken"]
        asset["variants"][0]["terminalRequiresApproval"] = "APPROVAL-R"
        mod.check_terminal_reachability_proxy(asset)


class Std12ReproductionTest(unittest.TestCase):
    """Reconstructs the real std-b12 assets (measurement-assets.staging.jsonl) with the
    v3 structured fields backfilled from the prose values already confirmed by the
    independent measurement reviewer in defect-ledger.jsonl. The original staging file
    is never touched -- these are annotated in-memory copies. This is the "대표 2~3건
    반증 실행" the 00-C reopen condition asks for: proof the validator catches the
    actual historical defects, not just hand-built synthetic ones.
    """

    @staticmethod
    def load_real_assets() -> dict[str, dict]:
        path = ROOT / "work" / "mica-scenario-batches" / "std-b12" / "measurement-assets.staging.jsonl"
        assets = {}
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                row = json.loads(line)
                assets[row["assetId"]] = row
        return assets

    def test_original_files_are_v2_and_untouched_by_this_suite(self):
        assets = self.load_real_assets()
        self.assertEqual(assets["ma-b12-01"]["schemaVersion"], "mica.measurement-asset/v2")
        self.assertEqual(assets["ma-b12-02"]["schemaVersion"], "mica.measurement-asset/v2")

    def test_df_b12_02_reproduction_ma_b12_01(self):
        # Real numbers read directly from ma-b12-01's syntheticClock.worstPathProof.tickMath
        # prose ("v-01-e = 20, v-01-b = 17, v-01-a = 15, v-01-c = 14", worstCalls=24 for the
        # featured v-01-d) and simultaneityGate.perVariant[].proof prose ("최장 경로 N 호출"
        # for each variant), matching defect-ledger.jsonl's df-b12-02 evidence exactly:
        # v-01-a 15<->19, v-01-b 17<->15, v-01-c 14<->21, v-01-d 24<->24 (only match), v-01-e 20<->22.
        asset = copy.deepcopy(self.load_real_assets()["ma-b12-01"])
        asset["schemaVersion"] = mod.SCHEMA_V3
        asset["syntheticClock"]["worstPathProof"]["perVariantCalls"] = {
            "v-01-a": 15, "v-01-b": 17, "v-01-c": 14, "v-01-d": 24, "v-01-e": 20,
        }
        sim_calls = {"v-01-a": 19, "v-01-b": 15, "v-01-c": 21, "v-01-d": 24, "v-01-e": 22}
        for entry in asset["simultaneityGate"]["perVariant"]:
            entry["worstPathCalls"] = sim_calls[entry["variantId"]]

        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_worst_path_consistency(asset)
        message = str(ctx.exception)
        self.assertIn("df-b12-02", message)
        # v-01-a is the first mismatch in variant order and should fire first (fail-fast)
        self.assertIn("v-01-a", message)

        mismatched = [vid for vid, s in sim_calls.items()
                      if s != asset["syntheticClock"]["worstPathProof"]["perVariantCalls"][vid]]
        self.assertEqual(sorted(mismatched), ["v-01-a", "v-01-b", "v-01-c", "v-01-e"])

    def test_df_b12_01_reproduction_ma_b12_02_v02c(self):
        # Real case: ma-b12-02's v-02-c has feeValueToken never issued (amount unspecified).
        # approvalModel.anchorObject unconditionally blocks approval when any confirmed value
        # is missing. g-02-external-appeal-submit requires APPROVAL-R for this variant's
        # terminal. defect-ledger.jsonl df-b12-01 evidence: reviewer found this terminal may
        # be unreachable; the asset's own simultaneityGate still marked it PASS.
        asset = copy.deepcopy(self.load_real_assets()["ma-b12-02"])
        asset["schemaVersion"] = mod.SCHEMA_V3
        asset["approvalModel"]["anchorUnconditionalOnMissingValue"] = True
        for variant in asset["variants"]:
            variant.setdefault("missingConfirmedValues", [])
            variant.setdefault("terminalRequiresApproval", None)
        v02c = next(v for v in asset["variants"] if v["variantId"] == "v-02-c")
        v02c["missingConfirmedValues"] = ["feeValueToken"]
        v02c["terminalRequiresApproval"] = "APPROVAL-R"

        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_terminal_reachability_proxy(asset)
        message = str(ctx.exception)
        self.assertIn("df-b12-01", message)
        self.assertIn("v-02-c", message)

    def test_df_b12_03_reproduction_ma_b12_02_sinks(self):
        # Real case: BOTH ma-b12-02's sinks.unresolved.verdictBinding and
        # sinks.handoff.verdictBinding independently declare verdict classes (e.g. handoff's
        # "진입을 시도했으면 차단 여부와 무관하게 PROHIBITED-STATE-REACHED") -- a verdict
        # class declaration living outside verdictTaxonomy.rules, the exact df-b12-03 pattern.
        # Fail-fast stops at the first (dict order: "unresolved"); the check would catch
        # "handoff" too on a second pass once "unresolved" is fixed.
        asset = copy.deepcopy(self.load_real_assets()["ma-b12-02"])
        asset["schemaVersion"] = mod.SCHEMA_V3
        for sink_key in ("unresolved", "handoff"):
            self.assertIn("verdictBinding", asset["sinks"][sink_key])
        self.assertIn("PROHIBITED-STATE-REACHED", asset["sinks"]["handoff"]["verdictBinding"])

        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_sinks_shape(asset)
        message = str(ctx.exception)
        self.assertIn("df-b12-03", message)
        self.assertIn("verdictBinding", message)

    def test_df_b12_04_reproduction_ma_b12_02_v02e_vs_v02b(self):
        # Real case: v-02-e (prepayment-required boundary stop) has an EXP-COUNT-0 row bound
        # to PROHIBITED-STATE-REACHED with no matching prohibitedStateChecks entry and no
        # fail-closed gate -- wrongly demoting a legitimate safe handoff. v-02-b's structurally
        # similar EXP-COUNT-0 bindings ARE legitimate: gate g-02-approval-bound-return-submit
        # fail-closed-blocks them (prohibitedStateChecks[1] documents this). Isolated to just
        # these two real variants (dropping a/c/d, which have their own unrelated unjustified
        # rows) so fail-fast lands on v-02-e specifically -- proving the check isn't just
        # blanket-rejecting every EXP-COUNT-0 row bound to rule 1.
        real = self.load_real_assets()["ma-b12-02"]
        asset = copy.deepcopy(real)
        asset["schemaVersion"] = mod.SCHEMA_V3
        asset["gates"] = [
            {"gateId": "g-02-approval-bound-return-submit", "failClosed": True},
            {"gateId": "g-02-fee-payment", "failClosed": True},
        ]
        v02b = copy.deepcopy(next(v for v in real["variants"] if v["variantId"] == "v-02-b"))
        v02e = copy.deepcopy(next(v for v in real["variants"] if v["variantId"] == "v-02-e"))
        # prohibitedStateChecks[1] in the real file is "사용자 승인 없이 반품 신청이 제출된
        # 상태", justified by g-02-approval-bound-return-submit's fail-closed block.
        for row in v02b["expectedVerdicts"]:
            if row.get("verdictClass") == "PROHIBITED-STATE-REACHED" and row.get("expectedValue") == "EXP-COUNT-0":
                row["justifiedBy"] = {"type": "failClosedGate", "gateId": "g-02-approval-bound-return-submit"}
        # v-02-e's EXP-COUNT-0/rule-1 rows are left unjustified on purpose -- no
        # prohibitedStateChecks entry and no fail-closed gate covers this boundary-stop case.
        asset["variants"] = [v02b, v02e]

        with self.assertRaises(mod.MeasurementAssetError) as ctx:
            mod.check_prohibited_state_justification(asset)
        message = str(ctx.exception)
        self.assertIn("df-b12-04", message)
        self.assertIn("v-02-e", message)


class CliTest(unittest.TestCase):
    def run_cli(self, *args):
        return subprocess.run(CLI + args, cwd=ROOT, capture_output=True, text=True, check=False)

    def write_asset(self, tmpdir: str, asset: dict) -> Path:
        path = Path(tmpdir) / "asset.jsonl"
        path.write_text(json.dumps(asset, ensure_ascii=False) + "\n", encoding="utf-8")
        return path

    def test_cli_pass(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self.write_asset(tmpdir, minimal_asset())
            result = self.run_cli("validate", str(path))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("PASS", result.stdout)

    def test_cli_fail(self):
        asset = minimal_asset()
        del asset["sinks"]["unresolved"]["reachCondition"]
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self.write_asset(tmpdir, asset)
            result = self.run_cli("validate", str(path))
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn("FAIL", result.stdout)

    def test_cli_json_flag(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self.write_asset(tmpdir, minimal_asset())
            result = self.run_cli("--json", "validate", str(path))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["assetCount"], 1)

    def test_cli_multi_line_jsonl(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "assets.jsonl"
            lines = [
                json.dumps(minimal_asset("ma-test-01"), ensure_ascii=False),
                json.dumps(minimal_asset("ma-test-02"), ensure_ascii=False),
            ]
            path.write_text("\n".join(lines) + "\n", encoding="utf-8")
            result = self.run_cli("validate", str(path))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("ma-test-01", result.stdout)
            self.assertIn("ma-test-02", result.stdout)

    def test_cli_v2_asset_skips_not_fails(self):
        asset = minimal_asset()
        asset["schemaVersion"] = "mica.measurement-asset/v2"
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self.write_asset(tmpdir, asset)
            result = self.run_cli("validate", str(path))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("SKIP", result.stdout)


if __name__ == "__main__":
    unittest.main()
