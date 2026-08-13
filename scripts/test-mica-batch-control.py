# /// script
# requires-python = ">=3.9"
# ///
from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = ROOT / "scripts" / "mica-scenario-production.py"
CONTROL = ROOT / "scripts" / "mica-batch-control.py"
OWNER = (
    "--controller-context-id",
    "controller-001",
    "--session-id",
    "session-001",
)


def run(script: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ("python3", str(script), *args),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


def create_locked_batch(parent: str, batch_id: str) -> Path:
    batch = Path(parent) / batch_id
    created = run(
        PRODUCTION,
        "new-batch",
        "--profile",
        "standard",
        "--batch-id",
        batch_id,
        "--count",
        "1",
        "--output",
        str(batch),
    )
    if created.returncode != 0:
        raise RuntimeError(created.stdout + created.stderr)
    locked = run(PRODUCTION, "lock-method", str(batch))
    if locked.returncode != 0:
        raise RuntimeError(locked.stdout + locked.stderr)
    return batch


class BatchControlCliTest(unittest.TestCase):
    def test_claim_role_record_park_and_resume(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="mica-controller-"
        ) as temporary_directory:
            batch = create_locked_batch(temporary_directory, "test-control-batch")

            claimed = run(
                CONTROL,
                "claim",
                str(batch),
                *OWNER,
            )
            self.assertEqual(claimed.returncode, 0, claimed.stdout + claimed.stderr)
            renewed = run(
                CONTROL,
                "renew",
                str(batch),
                *OWNER,
            )
            self.assertEqual(renewed.returncode, 0, renewed.stdout + renewed.stderr)
            duplicate_controller = run(
                CONTROL,
                "claim",
                str(batch),
                "--controller-context-id",
                "controller-002",
                "--session-id",
                "session-002",
            )
            self.assertEqual(duplicate_controller.returncode, 1)
            self.assertIn(
                "controller-state-already-exists", duplicate_controller.stdout
            )

            assigned = run(
                CONTROL,
                "assign-role",
                str(batch),
                *OWNER,
                "--role",
                "sourceResearcher",
                "--role-context-id",
                "source-researcher-001",
            )
            self.assertEqual(assigned.returncode, 0, assigned.stdout + assigned.stderr)
            duplicate_role = run(
                CONTROL,
                "assign-role",
                str(batch),
                *OWNER,
                "--role",
                "sourceResearcher",
                "--role-context-id",
                "source-researcher-002",
            )
            self.assertEqual(duplicate_role.returncode, 1)
            self.assertIn(
                "role-already-claimed:sourceResearcher", duplicate_role.stdout
            )

            evidence = batch / "source-evidence.jsonl"
            evidence.write_text('{"origin":"kiheon-ideation"}\n', encoding="utf-8")
            completed = run(
                CONTROL,
                "complete-role",
                str(batch),
                *OWNER,
                "--role",
                "sourceResearcher",
                "--role-context-id",
                "source-researcher-001",
                "--model",
                "test-model",
                "--effort-class",
                "medium",
                "--tools-summary",
                "local-read-write",
                "--artifact",
                "source-evidence.jsonl",
            )
            self.assertEqual(
                completed.returncode, 0, completed.stdout + completed.stderr
            )
            manifest = json.loads(
                (batch / "batch-manifest.json").read_text(encoding="utf-8")
            )
            ledger = manifest["artifactShaLedger"][0]
            self.assertEqual(
                ledger["timeSource"], "filesystem-mtime-observed-by-controller-tool"
            )
            self.assertEqual(manifest["modelRecord"][0]["executedAt"], ledger["at"])

            parked = run(
                CONTROL,
                "park",
                str(batch),
                *OWNER,
                "--reason",
                "planned handoff",
            )
            self.assertEqual(parked.returncode, 0, parked.stdout + parked.stderr)
            resumed = run(
                CONTROL,
                "resume",
                str(batch),
                "--controller-context-id",
                "controller-002",
                "--session-id",
                "session-002",
                "--authorization-ref",
                "user-message:test-handoff",
            )
            self.assertEqual(resumed.returncode, 0, resumed.stdout + resumed.stderr)
            state = json.loads(
                (batch / "controller-state.json").read_text(encoding="utf-8")
            )
            manifest = json.loads(
                (batch / "batch-manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(state["generation"], 2)
            self.assertEqual(state["controllerContextId"], "controller-002")
            self.assertEqual(
                state["roleClaims"]["controller"]["contextId"], "controller-002"
            )
            self.assertEqual(manifest["roles"]["controller"], "controller-002")

    def test_parked_checkpoint_rejects_unrecorded_change(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="mica-controller-stale-"
        ) as temporary_directory:
            batch = create_locked_batch(temporary_directory, "test-stale-batch")
            self.assertEqual(run(CONTROL, "claim", str(batch), *OWNER).returncode, 0)
            self.assertEqual(
                run(
                    CONTROL, "park", str(batch), *OWNER, "--reason", "handoff"
                ).returncode,
                0,
            )
            (batch / "source-evidence.jsonl").write_text("{}\n", encoding="utf-8")
            rejected = run(
                CONTROL,
                "resume",
                str(batch),
                "--controller-context-id",
                "controller-002",
                "--session-id",
                "session-002",
                "--authorization-ref",
                "user-message:resume",
            )
            self.assertEqual(rejected.returncode, 1)
            self.assertIn("parked-checkpoint-mismatch", rejected.stdout)

    def test_expired_takeover_rejects_unrecorded_artifact(self) -> None:
        with tempfile.TemporaryDirectory(
            prefix="mica-controller-expired-"
        ) as temporary_directory:
            batch = create_locked_batch(temporary_directory, "test-expired-batch")
            self.assertEqual(run(CONTROL, "claim", str(batch), *OWNER).returncode, 0)
            state_path = batch / "controller-state.json"
            state = json.loads(state_path.read_text(encoding="utf-8"))
            state["leaseExpiresAt"] = "2000-01-01T00:00:00Z"
            state_path.write_text(
                json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            (batch / "source-evidence.jsonl").write_text("{}\n", encoding="utf-8")
            rejected = run(
                CONTROL,
                "resume",
                str(batch),
                "--controller-context-id",
                "controller-002",
                "--session-id",
                "session-002",
                "--authorization-ref",
                "operator-approval:test-takeover",
            )
            self.assertEqual(rejected.returncode, 1)
            self.assertIn(
                "resume-artifact-unrecorded:source-evidence.jsonl", rejected.stdout
            )


if __name__ == "__main__":
    unittest.main()
