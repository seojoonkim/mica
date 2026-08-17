#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "scripts" / "mica-cleanroom.py"
EXCHANGE = ROOT / "work" / "mica-scenario-exchange"
OBSERVATION_FREEZE = EXCHANGE / "kh-b13-observation-freeze"
CANDIDATE_FREEZE = EXCHANGE / "kh-b13-candidate-freeze"


def run_cli(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ("python3", str(CLI), *args),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )


def first_row(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                return json.loads(line)
    raise AssertionError(f"빈 파일: {path}")


class VerifyTest(unittest.TestCase):
    def test_every_closed_kh_b13_job_passes(self) -> None:
        """실제로 닫힌 job은 전부 통과해야 한다. 거짓 양성이 없어야 한다."""
        jobs = sorted(
            path
            for path in EXCHANGE.glob("kh-b13-*")
            if (path / "READY.json").is_file()
        )
        self.assertGreaterEqual(len(jobs), 8)
        for job in jobs:
            with self.subTest(job=job.name):
                result = run_cli("verify", str(job))
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_truncated_receipt_digest_is_rejected(self) -> None:
        """kh-b13-observation-freeze attempt 1의 실제 결함을 잡는다.

        controller가 64자리 closureSha256을 62자리로 옮겨 적어 custodian 역할을
        통째로 다시 실행했다. 그 packet이 verify를 통과하면 안 된다.
        """
        with tempfile.TemporaryDirectory(prefix="mica-cleanroom-") as temp_dir:
            job = Path(temp_dir) / OBSERVATION_FREEZE.name
            shutil.copytree(OBSERVATION_FREEZE, job)
            ready_path = job / "READY.json"
            ready = json.loads(ready_path.read_text(encoding="utf-8"))
            digest = ready["observationReviewReceipt"]["closureSha256"]
            ready["observationReviewReceipt"]["closureSha256"] = digest[:62]
            ready_path.write_text(
                json.dumps(ready, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            result = run_cli("verify", str(job))
            self.assertEqual(result.returncode, 1)
            self.assertIn("digest-shape", result.stdout)

    def test_mutated_input_row_is_rejected(self) -> None:
        """입력 JSONL이 한 바이트라도 바뀌면 포인터 SHA 대조에서 걸린다."""
        with tempfile.TemporaryDirectory(prefix="mica-cleanroom-") as temp_dir:
            job = Path(temp_dir) / OBSERVATION_FREEZE.name
            shutil.copytree(OBSERVATION_FREEZE, job)
            target = job / "need-observations.staging.jsonl"
            target.write_text(
                target.read_text(encoding="utf-8") + "\n", encoding="utf-8"
            )
            result = run_cli("verify", str(job))
            self.assertEqual(result.returncode, 1)
            self.assertIn("pointer-", result.stdout)

    def test_git_commit_sha_is_not_flagged(self) -> None:
        """sourceCommitSha는 git SHA-1 40자리다. SHA-256 규칙 대상이 아니다."""
        ready = json.loads(
            (OBSERVATION_FREEZE / "READY.json").read_text(encoding="utf-8")
        )
        self.assertEqual(len(ready["sourceCommitSha"]), 40)
        result = run_cli("verify", str(OBSERVATION_FREEZE))
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertNotIn("sourceCommitSha", result.stdout)


class FreezeReproductionTest(unittest.TestCase):
    """사람과 모델이 만든 기존 동결 산출물을 바이트 단위로 재현한다."""

    def test_observation_freeze_reproduces_exactly(self) -> None:
        output = OBSERVATION_FREEZE / "frozen-observations.staging.jsonl"
        context_id = first_row(output)["frozenBy"]
        result = run_cli(
            "freeze", str(OBSERVATION_FREEZE), "--context-id", context_id, "--check"
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("재현 일치", result.stdout)

    def test_candidate_freeze_reproduces_exactly(self) -> None:
        output = CANDIDATE_FREEZE / "frozen-candidates.staging.jsonl"
        row = first_row(output)
        result = run_cli(
            "freeze",
            str(CANDIDATE_FREEZE),
            "--context-id",
            row["custodianContextId"],
            "--at",
            row["frozenAt"],
            "--check",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("재현 일치", result.stdout)

    def test_accepted_only_selection_matches_closure(self) -> None:
        """동결 행수와 ID가 당시 CLOSURE 기록과 같아야 한다."""
        closure = json.loads(
            (OBSERVATION_FREEZE / "CLOSURE.json").read_text(encoding="utf-8")
        )
        context_id = first_row(
            OBSERVATION_FREEZE / "frozen-observations.staging.jsonl"
        )["frozenBy"]
        result = run_cli(
            "freeze", str(OBSERVATION_FREEZE), "--context-id", context_id, "--check"
        )
        self.assertEqual(result.returncode, 0, result.stdout)
        self.assertIn(
            f"수락 {closure['frozenRows']}행", result.stdout
        )
        for observation_id in closure["frozenObservationIds"]:
            self.assertIn(observation_id, result.stdout)


class FreezeGuardTest(unittest.TestCase):
    def test_forbidden_prior_context_is_rejected(self) -> None:
        """앞 단계 컨텍스트로는 동결할 수 없다. 역할 독립성 불변식이다."""
        ready = json.loads(
            (OBSERVATION_FREEZE / "READY.json").read_text(encoding="utf-8")
        )
        prior = ready["forbiddenPriorContextIds"][0]
        result = run_cli(
            "freeze", str(OBSERVATION_FREEZE), "--context-id", prior, "--check"
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("context-forbidden", result.stdout)

    def test_existing_output_is_never_overwritten(self) -> None:
        with tempfile.TemporaryDirectory(prefix="mica-cleanroom-") as temp_dir:
            job = Path(temp_dir) / OBSERVATION_FREEZE.name
            shutil.copytree(OBSERVATION_FREEZE, job)
            result = run_cli(
                "freeze", str(job), "--context-id", "fresh-custodian-context"
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("FAIL exists", result.stdout)

    def test_freeze_aborts_when_package_verification_fails(self) -> None:
        """검증 실패한 packet에서는 동결하지 않는다. 추측하지 않는다."""
        with tempfile.TemporaryDirectory(prefix="mica-cleanroom-") as temp_dir:
            job = Path(temp_dir) / OBSERVATION_FREEZE.name
            shutil.copytree(OBSERVATION_FREEZE, job)
            (job / "frozen-observations.staging.jsonl").unlink()
            reviews = job / "observation-reviews.staging.jsonl"
            reviews.write_text(
                reviews.read_text(encoding="utf-8").replace(
                    '"verdict": "reject"', '"verdict": "accept"', 1
                ),
                encoding="utf-8",
            )
            result = run_cli(
                "freeze", str(job), "--context-id", "fresh-custodian-context"
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("freeze 중단", result.stdout)
            self.assertFalse((job / "frozen-observations.staging.jsonl").exists())


if __name__ == "__main__":
    unittest.main()
