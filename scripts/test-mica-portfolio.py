#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).with_name("mica-portfolio.py")
SPEC = importlib.util.spec_from_file_location("mica_portfolio", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
portfolio = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(portfolio)


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


class PortfolioTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.portfolio_root = self.root / "portfolio"
        self.exchange_root = self.root / "exchange"
        portfolio.init_portfolio(self.portfolio_root)
        portfolio.prepare_job("core20-test-001", 2, self.exchange_root, self.portfolio_root)
        self.job = self.exchange_root / "core20-test-001"
        self.packet = [row for row, _ in portfolio.parse_jsonl_with_hash(self.job / "packet.jsonl")]

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def annotation(self, source: dict[str, object], slot: str, context: str = "annotator-001") -> dict[str, object]:
        return {
            "origin": "kiheon-ideation",
            "schemaVersion": "mica.catalog-annotation/v1",
            "jobId": "core20-test-001",
            "batchId": source["batchId"],
            "candidateId": source["candidateId"],
            "sourceFrozenRowSha256": source["sourceFrozenRowSha256"],
            "categoryId": "email-calendar",
            "proposedSlotId": slot,
            "terminationClass": "completed-final-state",
            "declaredComplexity": "multi-step",
            "targetSurface": "web",
            "surfaceStatus": "target-only",
            "measurementIntent": "권위 있는 최종 상태 readback이 존재하는지 이분 판정한다.",
            "annotatorContextId": context,
            "annotatedAt": "2026-08-14T01:00:00Z",
        }

    def review(self, annotation: dict[str, object], annotation_sha: str, context: str = "reviewer-001") -> dict[str, object]:
        return {
            "origin": "kiheon-ideation",
            "schemaVersion": "mica.catalog-annotation-review/v1",
            "jobId": "core20-test-001",
            "candidateId": annotation["candidateId"],
            "annotationRowSha256": annotation_sha,
            "candidateBinding": True,
            "categorySlot": True,
            "terminationClass": True,
            "declaredComplexity": True,
            "targetSurfaceProvisional": True,
            "reviewerContextId": context,
            "verdict": "accept",
            "reviewNote": "원문 후보와 제안된 annotation이 일치한다.",
            "reviewedAt": "2026-08-14T01:05:00Z",
        }

    def complete_job(self) -> None:
        annotations = [
            self.annotation(self.packet[0], "email-calendar-01"),
            self.annotation(self.packet[1], "email-calendar-02"),
        ]
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", annotations)
        annotation_rows = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")
        reviews = [self.review(row, row_sha) for row, row_sha in annotation_rows]
        portfolio.write_jsonl(self.job / "review-output.staging.jsonl", reviews)
        closure = {
            "origin": "kiheon-ideation",
            "schemaVersion": "mica.exchange-closure/v1",
            "jobId": "core20-test-001",
            "status": "COMPLETED",
            "SlackCalls": 0,
            "NotionCalls": 0,
            "authorContextId": "annotator-001",
            "reviewerContextId": "reviewer-001",
            "writtenRows": 2,
            "acceptedRows": 2,
            "rejectedRows": 0,
            "heldRows": 0,
            "authorOutputSha256": portfolio.sha_file(self.job / "author-output.staging.jsonl"),
            "reviewOutputSha256": portfolio.sha_file(self.job / "review-output.staging.jsonl"),
            "closedAt": "2026-08-14T01:10:00Z",
            "nextStageAutoStarted": False,
        }
        write_json(self.job / "CLOSURE.json", closure)

    def test_prepare_validate_and_apply(self) -> None:
        self.complete_job()
        result = portfolio.validate_job("core20-test-001", self.exchange_root)
        self.assertEqual(result["accepted"], 2)
        applied = portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        self.assertEqual(applied["applied"], 2)
        state = portfolio.validate_portfolio(self.portfolio_root)
        self.assertEqual(state, {"status": "pass", "occupied": 2, "blocked": 0, "empty": 98})
        status = portfolio.portfolio_status(self.portfolio_root)
        self.assertEqual(status["occupiedSlots"], 2)
        self.assertEqual(status["remainingAnnotationTargets"], 54)
        output = self.root / "public-export" / "portfolio.json"
        exported = portfolio.export_public(self.portfolio_root, output)
        self.assertEqual(exported["occupied"], 2)
        payload = json.loads(output.read_text())
        self.assertEqual(payload["namespace"], "kiheon-ideation-research-portfolio")
        self.assertEqual(payload["canonicalAdoptionStatus"], "not-adopted")
        self.assertFalse(payload["holdoutIncluded"])

    def test_reapply_is_idempotent_without_mutating_ledgers(self) -> None:
        self.complete_job()
        portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        tracked = (
            "portfolio-100.json",
            "catalog-annotations.jsonl",
            "catalog-annotation-reviews.jsonl",
            "portfolio-artifact-ledger.jsonl",
        )
        before = {name: (self.portfolio_root / name).read_bytes() for name in tracked}
        replay = portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:21:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        self.assertTrue(replay["replayed"])
        self.assertEqual(replay["applied"], 2)
        after = {name: (self.portfolio_root / name).read_bytes() for name in tracked}
        self.assertEqual(after, before)

    def test_review_context_collision_rejected(self) -> None:
        annotation = self.annotation(self.packet[0], "email-calendar-01")
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        row, row_sha = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")[0]
        portfolio.write_jsonl(
            self.job / "review-output.staging.jsonl",
            [self.review(row, row_sha, context="annotator-001")],
        )
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-review-context-collision"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_confirmed_surface_rejected(self) -> None:
        annotation = self.annotation(self.packet[0], "email-calendar-01")
        annotation["confirmedSurface"] = "web"
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-key-order"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_blocked_slot_requires_attempt_history(self) -> None:
        path = self.portfolio_root / "portfolio-100.json"
        ledger = json.loads(path.read_text())
        ledger["categories"][0]["slots"][0]["status"] = "blocked"
        write_json(path, ledger)
        with self.assertRaisesRegex(portfolio.PortfolioError, "blocked-slot-history"):
            portfolio.validate_portfolio(self.portfolio_root)

    def test_public_ledger_rejects_holdout_annotation(self) -> None:
        row = self.annotation(self.packet[0], "email-calendar-01")
        row["taskSet"] = "holdout"
        portfolio.write_jsonl(self.portfolio_root / "catalog-annotations.jsonl", [row])
        with self.assertRaisesRegex(portfolio.PortfolioError, "portfolio-annotation-shape"):
            portfolio.validate_portfolio(self.portfolio_root)

    def test_second_job_requires_first_job_to_be_applied(self) -> None:
        with self.assertRaisesRegex(portfolio.PortfolioError, "active-job-exists:core20-test-001"):
            portfolio.prepare_job("core20-test-002", 2, self.exchange_root, self.portfolio_root)

    def test_applied_job_candidates_are_not_reselected(self) -> None:
        first_ids = {str(row["candidateId"]) for row in self.packet}
        self.complete_job()
        portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        portfolio.prepare_job("core20-test-002", 2, self.exchange_root, self.portfolio_root)
        second_ready = json.loads(
            (self.exchange_root / "core20-test-002" / "READY.json").read_text(encoding="utf-8")
        )
        self.assertNotIn(
            "email-calendar-01",
            second_ready["availableSlotIdsByCategory"]["email-calendar"],
        )
        self.assertNotIn(
            "email-calendar-02",
            second_ready["availableSlotIdsByCategory"]["email-calendar"],
        )
        second_packet = portfolio.parse_jsonl_with_hash(
            self.exchange_root / "core20-test-002" / "packet.jsonl"
        )
        second_ids = {str(row["candidateId"]) for row, _ in second_packet}
        self.assertTrue(second_ids)
        self.assertTrue(first_ids.isdisjoint(second_ids))

    def test_status_counts_new_closed_batch_candidates_dynamically(self) -> None:
        inventory = portfolio.all_candidate_rows()
        future = dict(inventory[-1])
        future["candidateId"] = "future-candidate-001"
        with mock.patch.object(portfolio, "all_candidate_rows", return_value=[*inventory, future]):
            status = portfolio.portfolio_status(self.portfolio_root)
        self.assertEqual(status["annotationTargets"], 57)
        self.assertEqual(status["remainingAnnotationTargets"], 57)

    def test_apply_preserves_original_jsonl_row_bytes(self) -> None:
        annotations = [
            self.annotation(self.packet[0], "email-calendar-01"),
            self.annotation(self.packet[1], "email-calendar-02"),
        ]
        author_payload = "".join(
            json.dumps(row, ensure_ascii=False, separators=(", ", ": ")) + "\n"
            for row in annotations
        )
        (self.job / "author-output.staging.jsonl").write_text(author_payload, encoding="utf-8")
        annotation_rows = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")
        reviews = [self.review(row, row_sha) for row, row_sha in annotation_rows]
        review_payload = "".join(
            json.dumps(row, ensure_ascii=False, separators=(", ", ": ")) + "\n"
            for row in reviews
        )
        (self.job / "review-output.staging.jsonl").write_text(review_payload, encoding="utf-8")
        closure = {
            "origin": "kiheon-ideation",
            "schemaVersion": "mica.exchange-closure/v1",
            "jobId": "core20-test-001",
            "status": "COMPLETED",
            "SlackCalls": 0,
            "NotionCalls": 0,
            "authorContextId": "annotator-001",
            "reviewerContextId": "reviewer-001",
            "writtenRows": 2,
            "acceptedRows": 2,
            "rejectedRows": 0,
            "heldRows": 0,
            "authorOutputSha256": portfolio.sha_file(self.job / "author-output.staging.jsonl"),
            "reviewOutputSha256": portfolio.sha_file(self.job / "review-output.staging.jsonl"),
            "closedAt": "2026-08-14T01:10:00Z",
            "nextStageAutoStarted": False,
        }
        write_json(self.job / "CLOSURE.json", closure)
        portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        self.assertEqual(
            (self.portfolio_root / "catalog-annotations.jsonl").read_bytes(),
            author_payload.encode(),
        )
        self.assertEqual(
            (self.portfolio_root / "catalog-annotation-reviews.jsonl").read_bytes(),
            review_payload.encode(),
        )
        self.assertEqual(portfolio.validate_portfolio(self.portfolio_root)["occupied"], 2)

    def test_failed_post_write_validation_rolls_back_transaction(self) -> None:
        self.complete_job()
        tracked = (
            "portfolio-100.json",
            "catalog-annotations.jsonl",
            "catalog-annotation-reviews.jsonl",
            "portfolio-artifact-ledger.jsonl",
        )
        before = {name: (self.portfolio_root / name).read_bytes() for name in tracked}
        with mock.patch.object(
            portfolio,
            "validate_portfolio",
            side_effect=portfolio.PortfolioError("forced-post-write-failure"),
        ):
            with self.assertRaisesRegex(portfolio.PortfolioError, "portfolio-transaction-failed"):
                portfolio.apply_job(
                    "core20-test-001",
                    "codex-controller-001",
                    "2026-08-14T01:20:00Z",
                    self.exchange_root,
                    self.portfolio_root,
                )
        after = {name: (self.portfolio_root / name).read_bytes() for name in tracked}
        self.assertEqual(after, before)
        self.assertFalse((self.portfolio_root / "receipts" / "apply-core20-test-001.json").exists())

    def test_job_rejects_duplicate_proposed_slot(self) -> None:
        annotations = [
            self.annotation(self.packet[0], "email-calendar-01"),
            self.annotation(self.packet[1], "email-calendar-01"),
        ]
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", annotations)
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-slot-duplicate:email-calendar-01"):
            portfolio.validate_job("core20-test-001", self.exchange_root)


if __name__ == "__main__":
    unittest.main()
