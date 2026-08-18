#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SCHEMA_V3 = "mica.measurement-asset/v3"
SINK_ALLOWED_KEYS = {"sinkId", "reachCondition"}
PROHIBITED_CLASS = "PROHIBITED-STATE-REACHED"
ZERO_COUNT_VALUE = "EXP-COUNT-0"


class MeasurementAssetError(RuntimeError):
    pass


def require(condition: bool, detail: str) -> None:
    if not condition:
        raise MeasurementAssetError(detail)


def display_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path.resolve())


def check_worst_path_consistency(asset: dict) -> None:
    sim_by_variant: dict[str, int] = {}
    for entry in asset.get("simultaneityGate", {}).get("perVariant", []):
        variant_id = entry.get("variantId")
        calls = entry.get("worstPathCalls")
        require(isinstance(variant_id, str) and variant_id, "simultaneityGate-perVariant-missing-variantId")
        require(isinstance(calls, int), f"missing-simultaneityGate-worstPathCalls:{variant_id}")
        sim_by_variant[variant_id] = calls

    per_variant_calls = asset.get("syntheticClock", {}).get("worstPathProof", {}).get("perVariantCalls")
    require(isinstance(per_variant_calls, dict), "missing-worstPathProof.perVariantCalls")

    for variant_id, sim_calls in sim_by_variant.items():
        require(variant_id in per_variant_calls, f"worstPathProof.perVariantCalls-missing:{variant_id}")
        proof_calls = per_variant_calls[variant_id]
        require(
            proof_calls == sim_calls,
            f"df-b12-02:worst-path-call-count-mismatch:{variant_id}:"
            f"worstPathProof.perVariantCalls={proof_calls}:simultaneityGate.worstPathCalls={sim_calls}",
        )


def check_sinks_shape(asset: dict) -> None:
    sinks = asset.get("sinks", {})
    require(isinstance(sinks, dict), "missing-sinks")
    for sink_key, entry in sinks.items():
        require(isinstance(entry, dict), f"sink-not-object:{sink_key}")
        extra = set(entry) - SINK_ALLOWED_KEYS
        require(not extra, f"df-b12-03:sink-declares-verdict-class:{sink_key}:forbidden-fields={sorted(extra)}")
        missing = SINK_ALLOWED_KEYS - set(entry)
        require(not missing, f"sink-missing-fields:{sink_key}:{sorted(missing)}")


def check_prohibited_state_justification(asset: dict) -> None:
    gates = asset.get("gates")
    require(isinstance(gates, list), "missing-gates")
    fail_closed_gates: set[str] = set()
    for gate in gates:
        gate_id = gate.get("gateId") if isinstance(gate, dict) else None
        require(isinstance(gate_id, str) and gate_id, "gate-missing-gateId")
        if gate.get("failClosed"):
            fail_closed_gates.add(gate_id)

    prohibited_state_count = len(asset.get("prohibitedStateChecks", []))

    for variant in asset.get("variants", []):
        variant_id = variant.get("variantId")
        for row in variant.get("expectedVerdicts", []):
            if row.get("verdictClass") != PROHIBITED_CLASS or row.get("expectedValue") != ZERO_COUNT_VALUE:
                continue
            item = row.get("item")
            justified_by = row.get("justifiedBy")
            require(
                isinstance(justified_by, dict),
                f"df-b12-04:unjustified-prohibited-binding:{variant_id}:{item}",
            )
            justification_type = justified_by.get("type")
            if justification_type == "prohibitedStateCheck":
                index = justified_by.get("index")
                require(
                    isinstance(index, int) and 0 <= index < prohibited_state_count,
                    f"df-b12-04:prohibitedStateCheck-ref-invalid:{variant_id}:{item}:index={index}",
                )
            elif justification_type == "failClosedGate":
                gate_id = justified_by.get("gateId")
                require(
                    gate_id in fail_closed_gates,
                    f"df-b12-04:failClosedGate-ref-invalid:{variant_id}:{item}:gateId={gate_id}",
                )
            else:
                require(False, f"df-b12-04:justifiedBy-unknown-type:{variant_id}:{item}:{justification_type}")


def check_terminal_reachability_proxy(asset: dict) -> None:
    approval_model = asset.get("approvalModel", {})
    unconditional = approval_model.get("anchorUnconditionalOnMissingValue")
    require(isinstance(unconditional, bool), "missing-approvalModel.anchorUnconditionalOnMissingValue")

    for variant in asset.get("variants", []):
        variant_id = variant.get("variantId")
        missing_values = variant.get("missingConfirmedValues")
        require(isinstance(missing_values, list), f"missing-variant-missingConfirmedValues:{variant_id}")
        require(
            "terminalRequiresApproval" in variant,
            f"missing-variant-terminalRequiresApproval:{variant_id}",
        )
        requires_approval = variant.get("terminalRequiresApproval")
        if unconditional and missing_values and requires_approval:
            require(
                False,
                f"df-b12-01:terminal-reachability-risk:{variant_id}:"
                f"anchorUnconditionalOnMissingValue=true missingConfirmedValues={missing_values} "
                f"terminalRequiresApproval={requires_approval} "
                "-- this approval may never bind for this variant's snapshot; confirm the declared "
                "terminal is actually reachable before submitting",
            )


def validate_measurement_asset(asset: dict) -> dict:
    asset_id = asset.get("assetId", "?")
    schema_version = asset.get("schemaVersion")
    if schema_version != SCHEMA_V3:
        return {
            "assetId": asset_id,
            "schemaVersion": schema_version,
            "status": "skipped",
            "detail": f"schemaVersion {schema_version!r} predates {SCHEMA_V3} -- upgrade to use this validator",
        }
    check_worst_path_consistency(asset)
    check_sinks_shape(asset)
    check_prohibited_state_justification(asset)
    check_terminal_reachability_proxy(asset)
    return {"assetId": asset_id, "schemaVersion": schema_version, "status": "pass"}


def load_assets(path: Path) -> list[dict]:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise MeasurementAssetError(f"unreadable-path:{path}") from exc

    stripped = text.strip()
    if not stripped:
        return []

    try:
        whole = json.loads(stripped)
    except json.JSONDecodeError:
        whole = None

    if isinstance(whole, dict):
        return [whole]
    if isinstance(whole, list):
        return whole

    assets = []
    for line_no, line in enumerate(stripped.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            assets.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise MeasurementAssetError(f"invalid-json-line:{path}:{line_no}") from exc
    return assets


def validate_path(path: Path) -> dict:
    assets = load_assets(path)
    require(assets, f"no-assets-found:{path}")
    results = [validate_measurement_asset(asset) for asset in assets]
    return {"path": display_path(path), "assetCount": len(results), "results": results}


def print_result(result: dict, as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    print(f"PASS path={result['path']} assetCount={result['assetCount']}")
    for entry in result["results"]:
        if entry["status"] == "skipped":
            print(f"  SKIP {entry['assetId']} ({entry['detail']})")
        else:
            print(f"  PASS {entry['assetId']}")


def main() -> int:
    parser = argparse.ArgumentParser(description="MICA measurement asset preflight validator (df-b12-01~04)")
    parser.add_argument("--json", action="store_true")
    commands = parser.add_subparsers(dest="command", required=True)
    validate = commands.add_parser("validate")
    validate.add_argument("path", type=Path)
    args = parser.parse_args()

    try:
        result = validate_path(args.path)
    except MeasurementAssetError as exc:
        if args.json:
            print(json.dumps({"status": "fail", "detail": str(exc)}, ensure_ascii=False))
        else:
            print(f"FAIL {exc}")
        return 1

    print_result(result, args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
