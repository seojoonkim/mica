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
            "schemaVersion": "mica.catalog-annotation/v3",
            "jobId": "core20-test-001",
            "batchId": source["batchId"],
            "candidateId": source["candidateId"],
            "sourceFrozenRowSha256": source["sourceFrozenRowSha256"],
            "categoryId": "email-calendar",
            "slotDisposition": "assigned",
            "proposedSlotId": slot,
            "categoryProvisional": False,
            "categoryRationale": "",
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
            "schemaVersion": "mica.catalog-annotation-review/v3",
            "jobId": "core20-test-001",
            "candidateId": annotation["candidateId"],
            "annotationRowSha256": annotation_sha,
            "candidateBinding": True,
            "categoryBinding": True,
            "slotDisposition": True,
            "terminationClass": True,
            "declaredComplexity": True,
            "targetSurfaceProvisional": True,
            "confidence": "high",
            "uncertaintyNote": "",
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
            "forbiddenInputReads": 0,
            "inputBoundaryStatus": "clean",
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
        self.assertEqual(status["remainingAnnotationTargets"], len(portfolio.all_candidate_rows()) - 2)
        self.assertEqual(status["reviewConfidence"]["high"], 2)
        output = self.root / "public-export" / "portfolio.json"
        exported = portfolio.export_public(self.portfolio_root, output)
        self.assertEqual(exported["occupied"], 2)
        payload = json.loads(output.read_text())
        self.assertEqual(payload["namespace"], "kiheon-ideation-research-portfolio")
        self.assertEqual(payload["canonicalAdoptionStatus"], "not-adopted")
        self.assertFalse(payload["holdoutIncluded"])

    def test_completed_clean_room_freeze_enters_inventory(self) -> None:
        inventory = portfolio.all_candidate_rows()
        candidate = next(row for row in inventory if row["candidateId"] == "ki-b13-02")
        self.assertEqual(candidate["sourceKind"], "clean-room-frozen-row")
        self.assertEqual(candidate["batchId"], "kh-b13")
        self.assertEqual(candidate["sourceFrozenRowSha256"], "db708a9c9b23c1d19a44af96d2019653dca8c7ece8c5c340fc39d095dec5ea87")

    def test_exchange_index_ignores_non_annotation_jobs(self) -> None:
        clean_room_job = self.exchange_root / "clean-room-test"
        clean_room_job.mkdir()
        write_json(
            clean_room_job / "READY.json",
            {
                "jobId": "clean-room-test",
                "jobType": "clean-room-production",
                "stage": "candidate-freeze",
            },
        )
        selected, active = portfolio.exchange_job_index(self.exchange_root, self.portfolio_root)
        self.assertEqual(len(selected), 2)
        self.assertEqual(active, ["core20-test-001"])

    def test_ready_defines_primary_path_termination_rule(self) -> None:
        ready = json.loads((self.job / "READY.json").read_text(encoding="utf-8"))
        guidance = ready["guidanceKo"]["terminationClass"]
        self.assertIn("주 성공 경로", guidance["completed-final-state"])
        self.assertIn("실패 복구 분기", guidance["completed-final-state"])
        self.assertIn("목표 종착점 자체", guidance["approval-handoff"])
        self.assertIn("최종 상태", guidance["escalation"])

    def test_ready_expands_rental_category_without_auto_assignment(self) -> None:
        ready = json.loads((self.job / "READY.json").read_text(encoding="utf-8"))
        telecom = next(
            row
            for row in ready["annotationEnums"]["categoryId"]
            if row["value"] == "telecom-subscriptions"
        )
        self.assertEqual(telecom["labelKo"], "통신·구독·렌털")
        self.assertIn("월 단위 요금", telecom["guidanceKo"])
        self.assertIn("구매·배송", telecom["guidanceKo"])
        self.assertEqual(ready["controllerApprovedProvisionalCandidateIds"], [])
        self.assertEqual(
            ready["roles"]["catalogAnnotator"]["schemaVersion"],
            "mica.catalog-annotation/v3",
        )

    def test_ready_separates_category_from_slot_placement(self) -> None:
        ready = json.loads((self.job / "READY.json").read_text(encoding="utf-8"))
        self.assertEqual(ready["annotationEnums"]["slotDisposition"], ["assigned", "category-overflow"])
        self.assertIn("완료 조건", ready["guidanceKo"]["category"])
        self.assertIn("카테고리 판정을 바꾸지 않는다", ready["guidanceKo"]["slot"])

    def test_provisional_category_requires_controller_approval(self) -> None:
        annotation = self.annotation(self.packet[0], "telecom-subscriptions-01")
        annotation["categoryId"] = "telecom-subscriptions"
        annotation["categoryProvisional"] = True
        annotation["categoryRationale"] = portfolio.RENTAL_PROVISIONAL_RATIONALE
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-provisional-not-approved"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_controller_approved_provisional_category_is_reviewable(self) -> None:
        ready_path = self.job / "READY.json"
        ready = json.loads(ready_path.read_text(encoding="utf-8"))
        candidate_id = str(self.packet[0]["candidateId"])
        ready["controllerApprovedProvisionalCandidateIds"] = [candidate_id]
        write_json(ready_path, ready)
        annotation = self.annotation(self.packet[0], "telecom-subscriptions-01")
        annotation["categoryId"] = "telecom-subscriptions"
        annotation["categoryProvisional"] = True
        annotation["categoryRationale"] = portfolio.RENTAL_PROVISIONAL_RATIONALE
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        row, row_sha = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")[0]
        portfolio.write_jsonl(
            self.job / "review-output.staging.jsonl",
            [self.review(row, row_sha)],
        )
        result = portfolio.validate_job("core20-test-001", self.exchange_root)
        self.assertEqual(result["accepted"], 1)

    def test_controller_approved_rental_category_requires_provisional_marker(self) -> None:
        ready_path = self.job / "READY.json"
        ready = json.loads(ready_path.read_text(encoding="utf-8"))
        candidate_id = str(self.packet[0]["candidateId"])
        ready["controllerApprovedProvisionalCandidateIds"] = [candidate_id]
        write_json(ready_path, ready)
        annotation = self.annotation(self.packet[0], "telecom-subscriptions-01")
        annotation["categoryId"] = "telecom-subscriptions"
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-provisional-required"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_overflow_requires_full_category(self) -> None:
        annotation = self.annotation(self.packet[0], "email-calendar-01")
        annotation["slotDisposition"] = "category-overflow"
        annotation["proposedSlotId"] = None
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        with self.assertRaisesRegex(portfolio.PortfolioError, "annotation-overflow-with-available-slot"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_full_category_annotation_is_accepted_without_occupying_slot(self) -> None:
        ready_path = self.job / "READY.json"
        ready = json.loads(ready_path.read_text(encoding="utf-8"))
        ready["availableSlotIdsByCategory"]["email-calendar"] = []
        write_json(ready_path, ready)
        annotation = self.annotation(self.packet[0], "email-calendar-01")
        annotation["slotDisposition"] = "category-overflow"
        annotation["proposedSlotId"] = None
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        row, row_sha = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")[0]
        review = self.review(row, row_sha)
        portfolio.write_jsonl(self.job / "review-output.staging.jsonl", [review])
        write_json(
            self.job / "CLOSURE.json",
            {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.exchange-closure/v1",
                "jobId": "core20-test-001",
                "status": "COMPLETED",
                "SlackCalls": 0,
                "NotionCalls": 0,
                "forbiddenInputReads": 0,
                "inputBoundaryStatus": "clean",
                "authorContextId": "annotator-001",
                "reviewerContextId": "reviewer-001",
                "writtenRows": 1,
                "acceptedRows": 1,
                "rejectedRows": 0,
                "heldRows": 0,
                "authorOutputSha256": portfolio.sha_file(self.job / "author-output.staging.jsonl"),
                "reviewOutputSha256": portfolio.sha_file(self.job / "review-output.staging.jsonl"),
                "closedAt": "2026-08-14T01:10:00Z",
                "nextStageAutoStarted": False,
            },
        )

        applied = portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )

        self.assertEqual(applied["applied"], 1)
        self.assertEqual(applied["placed"], 0)
        self.assertEqual(applied["unplaced"], 1)
        status = portfolio.portfolio_status(self.portfolio_root)
        self.assertEqual(status["occupiedSlots"], 0)
        self.assertEqual(status["annotatedCandidates"], 1)
        self.assertEqual(status["unplacedAnnotatedCandidates"], 1)

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

    def test_applied_retry_packets_do_not_block_a_new_job(self) -> None:
        receipts = self.portfolio_root / "receipts"
        write_json(receipts / "apply-core20-test-001.json", {})
        retry = self.exchange_root / "core20-test-002"
        retry.mkdir()
        packet_path = retry / "packet.jsonl"
        portfolio.write_jsonl(packet_path, [self.packet[0]])
        write_json(
            retry / "READY.json",
            {
                "jobId": "core20-test-002",
                "jobType": "catalog-annotation",
                "packetSha256": portfolio.sha_file(packet_path),
            },
        )
        write_json(receipts / "apply-core20-test-002.json", {})

        selected, active = portfolio.exchange_job_index(self.exchange_root, self.portfolio_root)

        self.assertEqual(selected, set())
        self.assertEqual(active, [])

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

    def test_prepare_job_can_target_controller_approved_candidates(self) -> None:
        self.complete_job()
        portfolio.apply_job(
            "core20-test-001",
            "codex-controller-001",
            "2026-08-14T01:20:00Z",
            self.exchange_root,
            self.portfolio_root,
        )
        applied_ids = {str(row["candidateId"]) for row in self.packet}
        target_id = next(
            str(row["candidateId"])
            for row in portfolio.all_candidate_rows()
            if str(row["candidateId"]) not in applied_ids
        )
        portfolio.prepare_job(
            "core20-test-002",
            2,
            self.exchange_root,
            self.portfolio_root,
            candidate_ids=(target_id,),
            provisional_candidate_ids=(target_id,),
        )
        job = self.exchange_root / "core20-test-002"
        ready = json.loads((job / "READY.json").read_text(encoding="utf-8"))
        packet = portfolio.parse_jsonl_with_hash(job / "packet.jsonl")
        self.assertEqual([row["candidateId"] for row, _ in packet], [target_id])
        self.assertEqual(ready["controllerApprovedProvisionalCandidateIds"], [target_id])

    def test_targeted_job_can_retry_a_previously_rejected_candidate(self) -> None:
        annotations = [
            self.annotation(self.packet[0], "email-calendar-01"),
            self.annotation(self.packet[1], "email-calendar-02"),
        ]
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", annotations)
        annotation_rows = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")
        reviews = [self.review(row, row_sha) for row, row_sha in annotation_rows]
        reviews[1]["categoryBinding"] = False
        reviews[1]["verdict"] = "reject"
        reviews[1]["reviewNote"] = "후보 본문이 제안된 카테고리를 지지하지 않는다."
        portfolio.write_jsonl(self.job / "review-output.staging.jsonl", reviews)
        closure = {
            "origin": "kiheon-ideation",
            "schemaVersion": "mica.exchange-closure/v1",
            "jobId": "core20-test-001",
            "status": "COMPLETED",
            "SlackCalls": 0,
            "NotionCalls": 0,
            "forbiddenInputReads": 0,
            "inputBoundaryStatus": "clean",
            "authorContextId": "annotator-001",
            "reviewerContextId": "reviewer-001",
            "writtenRows": 2,
            "acceptedRows": 1,
            "rejectedRows": 1,
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
        rejected_id = str(self.packet[1]["candidateId"])
        portfolio.prepare_job(
            "core20-test-002",
            1,
            self.exchange_root,
            self.portfolio_root,
            candidate_ids=(rejected_id,),
            provisional_candidate_ids=(rejected_id,),
        )
        packet = portfolio.parse_jsonl_with_hash(
            self.exchange_root / "core20-test-002" / "packet.jsonl"
        )
        self.assertEqual([row["candidateId"] for row, _ in packet], [rejected_id])

    def test_status_counts_new_closed_batch_candidates_dynamically(self) -> None:
        inventory = portfolio.all_candidate_rows()
        future = dict(inventory[-1])
        future["candidateId"] = "future-candidate-001"
        with mock.patch.object(portfolio, "all_candidate_rows", return_value=[*inventory, future]):
            status = portfolio.portfolio_status(self.portfolio_root)
        self.assertEqual(status["annotationTargets"], len(inventory) + 1)
        self.assertEqual(status["remainingAnnotationTargets"], len(inventory) + 1)

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
            "forbiddenInputReads": 0,
            "inputBoundaryStatus": "clean",
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

    def test_low_confidence_v2_review_cannot_accept(self) -> None:
        annotation = self.annotation(self.packet[0], "email-calendar-01")
        portfolio.write_jsonl(self.job / "author-output.staging.jsonl", [annotation])
        row, row_sha = portfolio.parse_jsonl_with_hash(self.job / "author-output.staging.jsonl")[0]
        review = self.review(row, row_sha)
        review["confidence"] = "low"
        review["uncertaintyNote"] = "종료 유형 근거가 충분하지 않다."
        portfolio.write_jsonl(self.job / "review-output.staging.jsonl", [review])
        with self.assertRaisesRegex(portfolio.PortfolioError, "review-verdict-mismatch"):
            portfolio.validate_job("core20-test-001", self.exchange_root)

    def test_apply_rejects_forbidden_input_read(self) -> None:
        self.complete_job()
        closure_path = self.job / "CLOSURE.json"
        closure = json.loads(closure_path.read_text(encoding="utf-8"))
        closure["forbiddenInputReads"] = 1
        closure["inputBoundaryStatus"] = "breach"
        write_json(closure_path, closure)
        with self.assertRaisesRegex(portfolio.PortfolioError, "job-forbidden-input-read"):
            portfolio.apply_job(
                "core20-test-001",
                "codex-controller-001",
                "2026-08-14T01:20:00Z",
                self.exchange_root,
                self.portfolio_root,
            )


if __name__ == "__main__":
    unittest.main()
