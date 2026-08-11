#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "scripts" / "mica-scenario-production.py"


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
            self.assertIn("methodRevision=standard-v1.1-b4", locked.stdout)

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


if __name__ == "__main__":
    unittest.main()
