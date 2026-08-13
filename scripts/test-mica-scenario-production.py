#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "scripts" / "mica-scenario-production.py"
CONTROL = ROOT / "scripts" / "mica-batch-control.py"


def run_cli(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ("python3", str(CLI), *args),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


class ScenarioProductionCliTest(unittest.TestCase):
    def test_method_lock_and_ready_gate(self) -> None:
        with tempfile.TemporaryDirectory(prefix="mica-method-lock-") as temp_dir:
            batch = Path(temp_dir) / "test-standard-batch"
            created = run_cli(
                "new-batch",
                "--profile",
                "standard",
                "--batch-id",
                "test-standard-batch",
                "--output",
                str(batch),
            )
            self.assertEqual(created.returncode, 0, created.stdout + created.stderr)

            unlocked = run_cli("validate-ready", str(batch))
            self.assertEqual(unlocked.returncode, 1)
            self.assertIn("batch-not-prepared-locked", unlocked.stdout)

            locked = run_cli("lock-method", str(batch))
            self.assertEqual(locked.returncode, 0, locked.stdout + locked.stderr)
            self.assertIn("batchId=test-standard-batch", locked.stdout)
            self.assertIn("methodRevision=standard-v1.3.4", locked.stdout)

            ready = run_cli("validate-ready", str(batch))
            self.assertEqual(ready.returncode, 0, ready.stdout + ready.stderr)
            self.assertIn("readyForProduction=True", ready.stdout)

            manifest_path = batch / "batch-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            original_sha = manifest["methodLock"]["sourceFiles"][0]["sha256"]
            manifest["methodLock"]["sourceFiles"][0]["sha256"] = "0" * 64
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            tampered = run_cli("validate-ready", str(batch))
            self.assertEqual(tampered.returncode, 1)
            self.assertIn("method-lock-file-sha-1", tampered.stdout)

            manifest["methodLock"]["sourceFiles"][0]["sha256"] = original_sha
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            (batch / "source-evidence.jsonl").write_text(
                json.dumps({"origin": "kiheon-ideation"}, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            started_too_early = run_cli("validate-ready", str(batch))
            self.assertEqual(started_too_early.returncode, 1)
            self.assertIn("ready-batch-not-empty", started_too_early.stdout)

    def test_v5_rehearsal_semantics_and_v3_v4_compatibility(self) -> None:
        legacy = run_cli("validate-batch", str(ROOT / "work" / "mica-scenario-batches" / "std-b6"))
        self.assertEqual(legacy.returncode, 0, legacy.stdout + legacy.stderr)
        v4 = run_cli("validate-batch", str(ROOT / "work" / "mica-scenario-batches" / "std-b8"))
        self.assertEqual(v4.returncode, 0, v4.stdout + v4.stderr)
        completed_v5 = run_cli("validate-batch", str(ROOT / "work" / "mica-scenario-batches" / "std-b10"))
        self.assertEqual(completed_v5.returncode, 0, completed_v5.stdout + completed_v5.stderr)

        with tempfile.TemporaryDirectory(prefix="mica-exposure-") as temp_dir:
            batch = Path(temp_dir) / "test-exposure-batch"
            created = run_cli(
                "new-batch",
                "--profile",
                "standard",
                "--batch-id",
                "test-exposure-batch",
                "--count",
                "1",
                "--output",
                str(batch),
            )
            self.assertEqual(created.returncode, 0, created.stdout + created.stderr)
            manifest = json.loads((batch / "batch-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["schemaVersion"], "mica.scenario-production-batch/v5")
            self.assertEqual(manifest["methodRevision"], "standard-v1.3.4")
            self.assertTrue((batch / "agent-visible.jsonl").is_file())
            self.assertTrue((batch / "blind-agent-rehearsal.jsonl").is_file())
            briefing = run_cli(
                "--json",
                "role-briefing",
                str(batch),
                "--role",
                "sourceReviewer",
            )
            self.assertEqual(briefing.returncode, 0, briefing.stdout + briefing.stderr)
            briefing_payload = json.loads(briefing.stdout)
            self.assertEqual(
                briefing_payload["allowedInputs"],
                ["source-evidence.jsonl", "cited primary source locations"],
            )
            self.assertEqual(
                briefing_payload["outputContract"]["artifacts"],
                ["source-reviews.jsonl"],
            )
            manifest["roles"]["exposurePreparer"] = "exposure-preparer-001"
            manifest["roles"]["blindAgentRehearsal"] = "blind-rehearsal-001"
            manifest["roles"]["measurementReviewer"] = "measurement-reviewer-001"
            (batch / "batch-manifest.json").write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            measurement = {
                "origin": "kiheon-ideation",
                "candidateId": "KI-TEST-001",
                "measurementDecision": "designable",
                "measurementReviewerContextId": "measurement-reviewer-001",
            }
            (batch / "measurement-contracts.jsonl").write_text(
                json.dumps(measurement, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            public = {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.agent-visible/v1",
                "batchId": "test-exposure-batch",
                "candidateId": "KI-TEST-001",
                "userRequest": "예약 변경 가능 여부를 확인하고, 가능하면 변경해 주세요.",
                "userKnownConstraints": ["사용자가 날짜 범위를 제공함"],
                "commonSafetyPolicy": ["결제 전 사용자 승인을 받음"],
                "allowedTools": ["합성 예약 조회", "합성 예약 변경"],
                "preparedByContextId": "exposure-preparer-001",
            }
            public_raw = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
            (batch / "agent-visible.jsonl").write_text(public_raw + "\n", encoding="utf-8")
            rehearsal = {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.blind-agent-rehearsal/v2",
                "batchId": "test-exposure-batch",
                "candidateId": "KI-TEST-001",
                "agentVisibleRowSha256": hashlib.sha256(public_raw.encode("utf-8")).hexdigest(),
                "rehearsalContextId": "blind-rehearsal-001",
                "requestUnderstood": True,
                "successOrSafeHandoffReachable": True,
                "hiddenInformationRequired": False,
                "implementationSequenceForced": False,
                "hiddenPathAccessible": False,
                "assessmentMode": "instruction-sufficiency",
                "actualExecutionObserved": False,
                "performanceInferenceAllowed": False,
                "reachabilityBasis": "공개 요청과 허용 도구로 조회, 승인, 변경 또는 안전 인계 경로를 설명할 수 있음",
                "verdict": "pass",
                "notes": "공개 입력만으로 조회와 승인 경계를 이해할 수 있음",
                "reviewedAt": "2026-08-12T01:00:00Z",
            }
            (batch / "blind-agent-rehearsal.jsonl").write_text(
                json.dumps(rehearsal, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )

            passed = run_cli("validate-exposure", str(batch))
            self.assertEqual(passed.returncode, 0, passed.stdout + passed.stderr)
            self.assertIn("rehearsalPassed=1", passed.stdout)

            public["userRequest"] = "canonicalFinalState와 probe ID를 생성해 주세요."
            (batch / "agent-visible.jsonl").write_text(
                json.dumps(public, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            leaked = run_cli("validate-exposure", str(batch))
            self.assertEqual(leaked.returncode, 1)
            self.assertIn("agent-visible-leak:KI-TEST-001", leaked.stdout)

            (batch / "agent-visible.jsonl").write_text(public_raw + "\n", encoding="utf-8")
            rehearsal["agentVisibleRowSha256"] = "0" * 64
            (batch / "blind-agent-rehearsal.jsonl").write_text(
                json.dumps(rehearsal, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            stale = run_cli("validate-exposure", str(batch))
            self.assertEqual(stale.returncode, 1)
            self.assertIn("blind-rehearsal-agent-visible-sha:KI-TEST-001", stale.stdout)

            rehearsal["agentVisibleRowSha256"] = hashlib.sha256(public_raw.encode("utf-8")).hexdigest()
            rehearsal["hiddenPathAccessible"] = True
            (batch / "blind-agent-rehearsal.jsonl").write_text(
                json.dumps(rehearsal, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            unsafe = run_cli("validate-exposure", str(batch))
            self.assertEqual(unsafe.returncode, 1)
            self.assertIn("blind-rehearsal-verdict-mismatch:KI-TEST-001", unsafe.stdout)

            rehearsal["hiddenPathAccessible"] = False
            rehearsal["actualExecutionObserved"] = True
            (batch / "blind-agent-rehearsal.jsonl").write_text(
                json.dumps(rehearsal, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            performance_claim = run_cli("validate-exposure", str(batch))
            self.assertEqual(performance_claim.returncode, 1)
            self.assertIn("blind-rehearsal-execution-claim:KI-TEST-001", performance_claim.stdout)

            rehearsal["actualExecutionObserved"] = False
            rehearsal["performanceInferenceAllowed"] = True
            (batch / "blind-agent-rehearsal.jsonl").write_text(
                json.dumps(rehearsal, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            performance_inference = run_cli("validate-exposure", str(batch))
            self.assertEqual(performance_inference.returncode, 1)
            self.assertIn("blind-rehearsal-performance-inference:KI-TEST-001", performance_inference.stdout)

    def test_v134_meaning_reviews_are_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory(prefix="mica-v134-meaning-") as temp_dir:
            batch = Path(temp_dir) / "test-v134-meaning"
            created = run_cli(
                "new-batch",
                "--profile",
                "standard",
                "--batch-id",
                "test-v134-meaning",
                "--count",
                "1",
                "--output",
                str(batch),
            )
            self.assertEqual(created.returncode, 0, created.stdout + created.stderr)
            self.assertEqual(run_cli("lock-method", str(batch)).returncode, 0)
            claimed = subprocess.run(
                (
                    "python3",
                    str(CONTROL),
                    "claim",
                    str(batch),
                    "--controller-context-id",
                    "controller-v134",
                    "--session-id",
                    "session-v134",
                ),
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(claimed.returncode, 0, claimed.stdout + claimed.stderr)

            source = {"origin": "kiheon-ideation", "evidenceId": "ev-001"}
            (batch / "source-evidence.jsonl").write_text(
                json.dumps(source, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            source_checks: dict[str, str] = {
                "publisher": "pass",
                "scope": "pass",
                "verbatim": "pass",
                "directSupport": "pass",
                "typeAccuracy": "pass",
                "recency": "pass",
            }
            review: dict[str, object] = {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.source-review/v1",
                "batchId": "test-v134-meaning",
                "reviewId": "sr-001",
                "evidenceId": "ev-001",
                "verdict": "accept",
                "checks": source_checks,
                "reasons": [],
                "nonBlockingNotes": [],
                "reviewerContextId": "source-reviewer-v134",
            }
            (batch / "source-reviews.jsonl").write_text(
                json.dumps(review, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            missing_check = run_cli("validate-batch", str(batch))
            self.assertEqual(missing_check.returncode, 1)
            self.assertIn("source-review:ev-001-check-keys", missing_check.stdout)

            source_checks["limitationsHonesty"] = "fail"
            (batch / "source-reviews.jsonl").write_text(
                json.dumps(review, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            dishonest_accept = run_cli("validate-batch", str(batch))
            self.assertEqual(dishonest_accept.returncode, 1)
            self.assertIn("source-review:ev-001-verdict-mismatch", dishonest_accept.stdout)

            source_checks["limitationsHonesty"] = "pass"
            (batch / "source-reviews.jsonl").write_text(
                json.dumps(review, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            observation = {
                "origin": "kiheon-ideation",
                "observationId": "ob-001",
                "sourceRefs": ["ev-001"],
            }
            observation_raw = json.dumps(
                observation, ensure_ascii=False, separators=(",", ":")
            )
            (batch / "need-observations.jsonl").write_text(
                observation_raw + "\n", encoding="utf-8"
            )
            observation_review: dict[str, object] = {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.observation-review/v1",
                "batchId": "test-v134-meaning",
                "reviewId": "or-001",
                "observationId": "ob-001",
                "verdict": "reject",
                "checks": {
                    "evidenceAlignment": "pass",
                    "needBoundary": "pass",
                    "nonPrescription": "pass",
                    "noInventedFacts": "pass",
                    "stateChangeClarity": "pass",
                },
                "reasons": [],
                "nonBlockingNotes": [],
                "reviewerContextId": "observation-reviewer-v134",
            }
            (batch / "observation-reviews.jsonl").write_text(
                json.dumps(
                    observation_review, ensure_ascii=False, separators=(",", ":")
                )
                + "\n",
                encoding="utf-8",
            )
            mismatched = run_cli("validate-batch", str(batch))
            self.assertEqual(mismatched.returncode, 1)
            self.assertIn(
                "observation-review:ob-001-verdict-mismatch", mismatched.stdout
            )

            observation_review["verdict"] = "accept"
            (batch / "observation-reviews.jsonl").write_text(
                json.dumps(
                    observation_review, ensure_ascii=False, separators=(",", ":")
                )
                + "\n",
                encoding="utf-8",
            )
            frozen = {
                "origin": "kiheon-ideation",
                "observationId": "ob-001",
                "frozenRowSha256": hashlib.sha256(
                    observation_raw.encode("utf-8")
                ).hexdigest(),
            }
            (batch / "frozen-observations.jsonl").write_text(
                json.dumps(frozen, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
            accepted = run_cli("validate-batch", str(batch))
            self.assertEqual(accepted.returncode, 0, accepted.stdout + accepted.stderr)


if __name__ == "__main__":
    unittest.main()
