#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections.abc import Callable
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PORTFOLIO_ROOT = ROOT / "work" / "mica-scenario-portfolio"
DEFAULT_EXCHANGE_ROOT = ROOT / "work" / "mica-scenario-exchange"
BATCH_ROOT = ROOT / "work" / "mica-scenario-batches"
PILOT_PATH = ROOT / "docs" / "kiheon-ideation-pilot-15" / "candidate-specs.json"

CATEGORIES = (
    "email-calendar",
    "shopping-delivery",
    "travel-accommodation",
    "restaurants-local",
    "money-banking-investing",
    "mobility-transit",
    "healthcare-administration",
    "government-civic",
    "home-utilities",
    "telecom-subscriptions",
)
CATEGORY_LABELS_KO = {
    "email-calendar": "이메일·캘린더",
    "shopping-delivery": "쇼핑·배송",
    "travel-accommodation": "여행 계획·숙박",
    "restaurants-local": "외식·예약",
    "money-banking-investing": "금융·은행·투자",
    "mobility-transit": "이동·대중교통",
    "healthcare-administration": "의료 행정",
    "government-civic": "행정·공공 서비스",
    "home-utilities": "주거·공과금",
    "telecom-subscriptions": "통신·구독·렌털",
}
RENTAL_CATEGORY_ID = "telecom-subscriptions"
RENTAL_PROVISIONAL_RATIONALE = "정기계약 기제 공유. 분류 체계 개정 시 재배치 대상"
TERMINATION_CLASSES = (
    "completed-final-state",
    "approval-handoff",
    "refusal",
    "escalation",
)
COMPLEXITIES = ("single-step", "multi-step", "cross-session")
TARGET_SURFACES = ("web", "app-only", "identity-gated", "phone-or-in-person", "mixed-surface")
SLOT_DISPOSITIONS = ("assigned", "category-overflow", "retracted-defect")
TIER_VALUES = ("verified", "draft-r1")
DEFAULT_TIER = "verified"
ANNOTATION_FIELDS_V1 = (
    "origin",
    "schemaVersion",
    "jobId",
    "batchId",
    "candidateId",
    "sourceFrozenRowSha256",
    "categoryId",
    "proposedSlotId",
    "terminationClass",
    "declaredComplexity",
    "targetSurface",
    "surfaceStatus",
    "measurementIntent",
    "annotatorContextId",
    "annotatedAt",
)
ANNOTATION_FIELDS_V2 = (
    "origin",
    "schemaVersion",
    "jobId",
    "batchId",
    "candidateId",
    "sourceFrozenRowSha256",
    "categoryId",
    "proposedSlotId",
    "categoryProvisional",
    "categoryRationale",
    "terminationClass",
    "declaredComplexity",
    "targetSurface",
    "surfaceStatus",
    "measurementIntent",
    "annotatorContextId",
    "annotatedAt",
)
ANNOTATION_FIELDS_V3 = (
    "origin",
    "schemaVersion",
    "jobId",
    "batchId",
    "candidateId",
    "sourceFrozenRowSha256",
    "categoryId",
    "slotDisposition",
    "proposedSlotId",
    "categoryProvisional",
    "categoryRationale",
    "terminationClass",
    "declaredComplexity",
    "targetSurface",
    "surfaceStatus",
    "measurementIntent",
    "annotatorContextId",
    "annotatedAt",
)
ANNOTATION_FIELDS_V4 = ANNOTATION_FIELDS_V3 + ("tier",)
REVIEW_FIELDS_V1 = (
    "origin",
    "schemaVersion",
    "jobId",
    "candidateId",
    "annotationRowSha256",
    "candidateBinding",
    "categorySlot",
    "terminationClass",
    "declaredComplexity",
    "targetSurfaceProvisional",
    "reviewerContextId",
    "verdict",
    "reviewNote",
    "reviewedAt",
)
REVIEW_FIELDS_V2 = (
    "origin",
    "schemaVersion",
    "jobId",
    "candidateId",
    "annotationRowSha256",
    "candidateBinding",
    "categorySlot",
    "terminationClass",
    "declaredComplexity",
    "targetSurfaceProvisional",
    "confidence",
    "uncertaintyNote",
    "reviewerContextId",
    "verdict",
    "reviewNote",
    "reviewedAt",
)
REVIEW_FIELDS_V3 = (
    "origin",
    "schemaVersion",
    "jobId",
    "candidateId",
    "annotationRowSha256",
    "candidateBinding",
    "categoryBinding",
    "slotDisposition",
    "terminationClass",
    "declaredComplexity",
    "targetSurfaceProvisional",
    "confidence",
    "uncertaintyNote",
    "reviewerContextId",
    "verdict",
    "reviewNote",
    "reviewedAt",
)
REVIEW_FIELDS_V4 = REVIEW_FIELDS_V3 + ("tier",)
REVIEW_CONFIDENCES = ("high", "medium", "low")


def annotation_fields(schema_version: object) -> tuple[str, ...]:
    if schema_version == "mica.catalog-annotation/v1":
        return ANNOTATION_FIELDS_V1
    if schema_version == "mica.catalog-annotation/v2":
        return ANNOTATION_FIELDS_V2
    if schema_version == "mica.catalog-annotation/v3":
        return ANNOTATION_FIELDS_V3
    if schema_version == "mica.catalog-annotation/v4":
        return ANNOTATION_FIELDS_V4
    raise PortfolioError(f"annotation-schema:{schema_version}")


def review_fields(schema_version: object) -> tuple[str, ...]:
    if schema_version == "mica.catalog-annotation-review/v1":
        return REVIEW_FIELDS_V1
    if schema_version == "mica.catalog-annotation-review/v2":
        return REVIEW_FIELDS_V2
    if schema_version == "mica.catalog-annotation-review/v3":
        return REVIEW_FIELDS_V3
    if schema_version == "mica.catalog-annotation-review/v4":
        return REVIEW_FIELDS_V4
    raise PortfolioError(f"review-schema:{schema_version}")


def annotation_slot_disposition(annotation: dict[str, object]) -> str:
    if annotation.get("schemaVersion") in {"mica.catalog-annotation/v3", "mica.catalog-annotation/v4"}:
        return str(annotation.get("slotDisposition"))
    return "assigned"


def annotation_tier(annotation: dict[str, object]) -> str:
    if annotation.get("schemaVersion") == "mica.catalog-annotation/v4":
        return str(annotation.get("tier"))
    return DEFAULT_TIER


def review_check_fields(schema_version: object) -> tuple[str, ...]:
    if schema_version in {"mica.catalog-annotation-review/v3", "mica.catalog-annotation-review/v4"}:
        return (
            "candidateBinding",
            "categoryBinding",
            "slotDisposition",
            "terminationClass",
            "declaredComplexity",
            "targetSurfaceProvisional",
        )
    return (
        "candidateBinding",
        "categorySlot",
        "terminationClass",
        "declaredComplexity",
        "targetSurfaceProvisional",
    )


class PortfolioError(RuntimeError):
    pass


def require(condition: bool, detail: str) -> None:
    if not condition:
        raise PortfolioError(detail)


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def display_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path.resolve())


def canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()


def pretty_json_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def load_json(path: Path) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise PortfolioError(f"invalid-json:{path}") from exc


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(pretty_json_bytes(value))


def transactional_write(
    payloads: dict[Path, bytes],
    transaction_id: str,
    validator: Callable[[], None] | None = None,
) -> None:
    originals = {path: path.read_bytes() if path.exists() else None for path in payloads}
    temporary: dict[Path, Path] = {}
    try:
        for path, data in payloads.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            temp = path.with_name(f".{path.name}.{transaction_id}.tmp")
            require(not temp.exists(), f"transaction-temp-exists:{temp.name}")
            temp.write_bytes(data)
            temporary[path] = temp
        for path, temp in temporary.items():
            temp.replace(path)
        if validator is not None:
            validator()
    except (OSError, PortfolioError) as exc:
        for path, original in originals.items():
            try:
                if original is None:
                    path.unlink(missing_ok=True)
                else:
                    path.write_bytes(original)
            except OSError:
                pass
        raise PortfolioError(f"portfolio-transaction-failed:{transaction_id}") from exc
    finally:
        for temp in temporary.values():
            temp.unlink(missing_ok=True)


def parse_jsonl_with_hash(path: Path) -> list[tuple[dict[str, object], str]]:
    rows: list[tuple[dict[str, object], str]] = []
    try:
        lines = path.read_bytes().splitlines()
    except OSError as exc:
        raise PortfolioError(f"missing:{path}") from exc
    for index, raw in enumerate(lines, start=1):
        if not raw.strip():
            continue
        try:
            row = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise PortfolioError(f"invalid-jsonl:{path}:{index}") from exc
        require(isinstance(row, dict), f"jsonl-row-not-object:{path}:{index}")
        rows.append((row, sha_bytes(raw)))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = b"".join(canonical_bytes(row) for row in rows)
    path.write_bytes(payload)


def raw_jsonl_rows_by_candidate(path: Path) -> dict[str, bytes]:
    rows: dict[str, bytes] = {}
    try:
        lines = path.read_bytes().splitlines()
    except OSError as exc:
        raise PortfolioError(f"missing:{path}") from exc
    for index, raw in enumerate(lines, start=1):
        if not raw.strip():
            continue
        try:
            row = json.loads(raw)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise PortfolioError(f"invalid-jsonl:{path}:{index}") from exc
        require(isinstance(row, dict), f"jsonl-row-not-object:{path}:{index}")
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id, f"jsonl-candidate:{path}:{index}")
        require(candidate_id not in rows, f"jsonl-candidate-duplicate:{path}:{candidate_id}")
        rows[candidate_id] = raw + b"\n"
    return rows


def timestamp(value: object, detail: str) -> None:
    require(isinstance(value, str) and value.strip(), detail)
    try:
        normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
        parsed = datetime.fromisoformat(normalized)
    except ValueError as exc:
        raise PortfolioError(detail) from exc
    require(parsed.tzinfo is not None, detail)


def git_head() -> str:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"), cwd=ROOT, check=True, capture_output=True, text=True
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise PortfolioError("git-head") from exc
    head = result.stdout.strip()
    require(re.fullmatch(r"[0-9a-f]{40}", head) is not None, "git-head-shape")
    return head


def empty_portfolio() -> dict[str, object]:
    categories = []
    for category in CATEGORIES:
        categories.append(
            {
                "categoryId": category,
                "labelKo": CATEGORY_LABELS_KO[category],
                "slots": [
                    {
                        "slotId": f"{category}-{index:02d}",
                        "status": "empty",
                        "candidateId": None,
                        "annotationRowSha256": None,
                        "reviewRowSha256": None,
                        "sourceBatchId": None,
                        "tier": None,
                        "attemptHistory": [],
                    }
                    for index in range(1, 11)
                ],
            }
        )
    return {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.research-portfolio/v1",
        "portfolioId": "kiheon-ideation-100-slot",
        "displayNameKo": "신기헌 아이데이션 100-slot 연구 포트폴리오",
        "displayNameEn": "Kiheon Ideation 100-slot Research Portfolio",
        "relationToCanonical": "parallel-research-portfolio",
        "canonicalAdoptionStatus": "not-adopted",
        "targetSlotCount": 100,
        "categories": categories,
    }


def init_portfolio(portfolio_root: Path) -> dict[str, object]:
    portfolio_root = portfolio_root.resolve()
    require(not portfolio_root.exists(), f"portfolio-exists:{portfolio_root}")
    portfolio_root.mkdir(parents=True)
    write_json(portfolio_root / "portfolio-100.json", empty_portfolio())
    for name in (
        "catalog-annotations.jsonl",
        "catalog-annotation-reviews.jsonl",
        "portfolio-artifact-ledger.jsonl",
    ):
        (portfolio_root / name).write_text("", encoding="utf-8")
    (portfolio_root / "receipts").mkdir()
    return validate_portfolio(portfolio_root)


def validate_slot(slot: object, category: str, seen_candidates: set[str]) -> None:
    require(isinstance(slot, dict), f"slot-object:{category}")
    expected = {
        "slotId",
        "status",
        "candidateId",
        "annotationRowSha256",
        "reviewRowSha256",
        "sourceBatchId",
        "tier",
        "attemptHistory",
    }
    require(set(slot) == expected, f"slot-shape:{category}")
    slot_id = slot.get("slotId")
    require(isinstance(slot_id, str) and slot_id.startswith(category + "-"), f"slot-id:{slot_id}")
    status = slot.get("status")
    require(status in {"empty", "occupied", "blocked"}, f"slot-status:{slot_id}")
    history = slot.get("attemptHistory")
    require(isinstance(history, list), f"slot-history:{slot_id}")
    if status == "empty":
        require(
            all(
                slot.get(field) is None
                for field in ("candidateId", "annotationRowSha256", "reviewRowSha256", "sourceBatchId", "tier")
            ),
            f"empty-slot-binding:{slot_id}",
        )
    elif status == "blocked":
        require(len(history) > 0, f"blocked-slot-history:{slot_id}")
        require(slot.get("candidateId") is None, f"blocked-slot-candidate:{slot_id}")
        require(slot.get("tier") is None, f"blocked-slot-tier:{slot_id}")
        seen_briefs: set[str] = set()
        for attempt in history:
            require(isinstance(attempt, dict), f"blocked-attempt:{slot_id}")
            brief = attempt.get("targetBriefSha256")
            require(isinstance(brief, str) and re.fullmatch(r"[0-9a-f]{64}", brief), f"blocked-brief:{slot_id}")
            require(brief not in seen_briefs, f"blocked-brief-reuse:{slot_id}")
            seen_briefs.add(brief)
    else:
        candidate_id = slot.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id.strip(), f"occupied-candidate:{slot_id}")
        require(candidate_id not in seen_candidates, f"candidate-multiple-slots:{candidate_id}")
        seen_candidates.add(candidate_id)
        for field in ("annotationRowSha256", "reviewRowSha256"):
            value = slot.get(field)
            require(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value), f"occupied-{field}:{slot_id}")
        require(isinstance(slot.get("sourceBatchId"), str), f"occupied-source-batch:{slot_id}")
        require(slot.get("tier") in TIER_VALUES, f"occupied-tier:{slot_id}")


def validate_portfolio(portfolio_root: Path) -> dict[str, object]:
    portfolio_root = portfolio_root.resolve()
    ledger = load_json(portfolio_root / "portfolio-100.json")
    require(isinstance(ledger, dict), "portfolio-object")
    require(ledger.get("origin") == "kiheon-ideation", "portfolio-origin")
    require(ledger.get("schemaVersion") == "mica.research-portfolio/v1", "portfolio-schema")
    require(ledger.get("targetSlotCount") == 100, "portfolio-target-count")
    require(ledger.get("relationToCanonical") == "parallel-research-portfolio", "portfolio-relation")
    require(ledger.get("canonicalAdoptionStatus") == "not-adopted", "portfolio-adoption")
    categories = ledger.get("categories")
    require(isinstance(categories, list) and len(categories) == 10, "portfolio-categories")
    require([row.get("categoryId") for row in categories if isinstance(row, dict)] == list(CATEGORIES), "portfolio-category-order")
    occupied = blocked = 0
    seen_candidates: set[str] = set()
    seen_slots: set[str] = set()
    for row in categories:
        require(isinstance(row, dict), "portfolio-category-object")
        category = row.get("categoryId")
        require(isinstance(category, str), "portfolio-category-id")
        require(row.get("labelKo") == CATEGORY_LABELS_KO[category], f"portfolio-category-label:{category}")
        slots = row.get("slots")
        require(isinstance(slots, list) and len(slots) == 10, f"portfolio-category-slots:{category}")
        for slot in slots:
            validate_slot(slot, category, seen_candidates)
            slot_id = slot["slotId"]
            require(slot_id not in seen_slots, f"duplicate-slot:{slot_id}")
            seen_slots.add(slot_id)
            occupied += slot["status"] == "occupied"
            blocked += slot["status"] == "blocked"
    require(len(seen_slots) == 100, "portfolio-slot-count")
    annotation_rows = parse_jsonl_with_hash(portfolio_root / "catalog-annotations.jsonl")
    review_rows = parse_jsonl_with_hash(portfolio_root / "catalog-annotation-reviews.jsonl")
    annotation_by_id: dict[str, tuple[dict[str, object], str]] = {}
    for annotation, row_sha in annotation_rows:
        candidate_id = annotation.get("candidateId")
        schema_version = annotation.get("schemaVersion")
        require(
            tuple(annotation) == annotation_fields(schema_version),
            f"portfolio-annotation-shape:{candidate_id}",
        )
        require(annotation.get("origin") == "kiheon-ideation", f"portfolio-annotation-origin:{candidate_id}")
        require(isinstance(candidate_id, str) and candidate_id, "portfolio-annotation-candidate")
        require(candidate_id not in annotation_by_id, f"portfolio-annotation-duplicate:{candidate_id}")
        category = annotation.get("categoryId")
        require(category in CATEGORIES, f"portfolio-annotation-category:{candidate_id}")
        slot_disposition = annotation_slot_disposition(annotation)
        require(slot_disposition in SLOT_DISPOSITIONS, f"portfolio-annotation-slot-disposition:{candidate_id}")
        if slot_disposition == "assigned":
            require(
                annotation.get("proposedSlotId")
                in {f"{category}-{index:02d}" for index in range(1, 11)},
                f"portfolio-annotation-slot:{candidate_id}",
            )
        else:
            require(annotation.get("proposedSlotId") is None, f"portfolio-annotation-overflow-slot:{candidate_id}")
        if schema_version in {
            "mica.catalog-annotation/v2",
            "mica.catalog-annotation/v3",
            "mica.catalog-annotation/v4",
        }:
            provisional = annotation.get("categoryProvisional")
            rationale = annotation.get("categoryRationale")
            require(type(provisional) is bool, f"portfolio-annotation-provisional:{candidate_id}")
            require(isinstance(rationale, str), f"portfolio-annotation-rationale:{candidate_id}")
            require(
                (not provisional and not rationale)
                or (
                    provisional
                    and category == RENTAL_CATEGORY_ID
                    and rationale == RENTAL_PROVISIONAL_RATIONALE
                ),
                f"portfolio-annotation-provisional-binding:{candidate_id}",
            )
        if schema_version == "mica.catalog-annotation/v4":
            require(annotation.get("tier") in TIER_VALUES, f"portfolio-annotation-tier:{candidate_id}")
        require(annotation.get("terminationClass") in TERMINATION_CLASSES, f"portfolio-annotation-termination:{candidate_id}")
        require(annotation.get("declaredComplexity") in COMPLEXITIES, f"portfolio-annotation-complexity:{candidate_id}")
        require(annotation.get("targetSurface") in TARGET_SURFACES, f"portfolio-annotation-surface:{candidate_id}")
        require(annotation.get("surfaceStatus") == "target-only", f"portfolio-annotation-surface-status:{candidate_id}")
        timestamp(annotation.get("annotatedAt"), f"portfolio-annotation-time:{candidate_id}")
        annotation_by_id[candidate_id] = (annotation, row_sha)
    review_by_id: dict[str, tuple[dict[str, object], str]] = {}
    for review, row_sha in review_rows:
        candidate_id = review.get("candidateId")
        schema_version = review.get("schemaVersion")
        require(tuple(review) == review_fields(schema_version), f"portfolio-review-shape:{candidate_id}")
        require(review.get("origin") == "kiheon-ideation", f"portfolio-review-origin:{candidate_id}")
        if schema_version in {
            "mica.catalog-annotation-review/v2",
            "mica.catalog-annotation-review/v3",
            "mica.catalog-annotation-review/v4",
        }:
            confidence = review.get("confidence")
            require(confidence in REVIEW_CONFIDENCES, f"portfolio-review-confidence:{candidate_id}")
            uncertainty_note = review.get("uncertaintyNote")
            require(isinstance(uncertainty_note, str), f"portfolio-review-uncertainty:{candidate_id}")
            require(confidence == "high" or uncertainty_note.strip(), f"portfolio-review-uncertainty-empty:{candidate_id}")
            require(confidence != "low", f"portfolio-review-low-confidence:{candidate_id}")
        require(isinstance(candidate_id, str) and candidate_id in annotation_by_id, f"portfolio-review-candidate:{candidate_id}")
        require(candidate_id not in review_by_id, f"portfolio-review-duplicate:{candidate_id}")
        require(
            review.get("annotationRowSha256") == annotation_by_id[candidate_id][1],
            f"portfolio-review-annotation-sha:{candidate_id}",
        )
        require(review.get("verdict") == "accept", f"portfolio-review-not-accepted:{candidate_id}")
        require(
            all(review.get(field) is True for field in review_check_fields(schema_version)),
            f"portfolio-review-check:{candidate_id}",
        )
        if schema_version == "mica.catalog-annotation-review/v4":
            require(
                review.get("tier") == annotation_tier(annotation_by_id[candidate_id][0]),
                f"portfolio-review-tier:{candidate_id}",
            )
        require(
            review.get("reviewerContextId") != annotation_by_id[candidate_id][0].get("annotatorContextId"),
            f"portfolio-role-context-collision:{candidate_id}",
        )
        timestamp(review.get("reviewedAt"), f"portfolio-review-time:{candidate_id}")
        review_by_id[candidate_id] = (review, row_sha)
    require(set(annotation_by_id) == set(review_by_id), "portfolio-annotation-review-set")
    assigned_candidates = {
        candidate_id
        for candidate_id, (annotation, _) in annotation_by_id.items()
        if annotation_slot_disposition(annotation) == "assigned"
    }
    require(seen_candidates == assigned_candidates, "portfolio-slot-annotation-set")
    slot_by_candidate = {
        slot["candidateId"]: slot
        for category in categories
        for slot in category["slots"]
        if slot["status"] == "occupied"
    }
    for candidate_id, (annotation, annotation_sha) in annotation_by_id.items():
        if annotation_slot_disposition(annotation) != "assigned":
            require(candidate_id not in slot_by_candidate, f"portfolio-overflow-occupied:{candidate_id}")
            continue
        slot = slot_by_candidate[candidate_id]
        require(slot["slotId"] == annotation["proposedSlotId"], f"portfolio-slot-id-binding:{candidate_id}")
        require(slot["annotationRowSha256"] == annotation_sha, f"portfolio-slot-annotation-sha:{candidate_id}")
        require(slot["reviewRowSha256"] == review_by_id[candidate_id][1], f"portfolio-slot-review-sha:{candidate_id}")
        require(slot["sourceBatchId"] == annotation["batchId"], f"portfolio-slot-batch:{candidate_id}")
        require(slot["tier"] == annotation_tier(annotation), f"portfolio-slot-tier:{candidate_id}")
    parse_jsonl_with_hash(portfolio_root / "portfolio-artifact-ledger.jsonl")
    receipts = portfolio_root / "receipts"
    require(receipts.is_dir(), "portfolio-receipts")
    return {"status": "pass", "occupied": occupied, "blocked": blocked, "empty": 100 - occupied - blocked}


def portfolio_status(portfolio_root: Path) -> dict[str, object]:
    state = validate_portfolio(portfolio_root)
    ledger = load_json(portfolio_root.resolve() / "portfolio-100.json")
    require(isinstance(ledger, dict), "portfolio-object")
    categories = ledger.get("categories")
    require(isinstance(categories, list), "portfolio-categories")
    category_counts = []
    for category in categories:
        require(isinstance(category, dict), "portfolio-category-object")
        slots = category.get("slots")
        require(isinstance(slots, list), "portfolio-category-slots")
        category_counts.append(
            {
                "categoryId": category.get("categoryId"),
                "labelKo": CATEGORY_LABELS_KO[str(category.get("categoryId"))],
                "occupied": sum(slot.get("status") == "occupied" for slot in slots if isinstance(slot, dict)),
                "blocked": sum(slot.get("status") == "blocked" for slot in slots if isinstance(slot, dict)),
                "target": 10,
            }
        )
    inventory_ids = {str(row["candidateId"]) for row in all_candidate_rows()}
    annotated_ids = {
        str(row.get("candidateId"))
        for row, _ in parse_jsonl_with_hash(portfolio_root.resolve() / "catalog-annotations.jsonl")
    }
    unplaced_annotations = sum(
        annotation_slot_disposition(row) == "category-overflow"
        for row, _ in parse_jsonl_with_hash(portfolio_root.resolve() / "catalog-annotations.jsonl")
    )
    require(annotated_ids <= inventory_ids, "portfolio-annotation-outside-inventory")
    confidence_counts = {"high": 0, "medium": 0, "low": 0, "legacy-unknown": 0}
    for review, _ in parse_jsonl_with_hash(portfolio_root.resolve() / "catalog-annotation-reviews.jsonl"):
        if review.get("schemaVersion") in {
            "mica.catalog-annotation-review/v2",
            "mica.catalog-annotation-review/v3",
        }:
            confidence_counts[str(review.get("confidence"))] += 1
        else:
            confidence_counts["legacy-unknown"] += 1
    return {
        "status": "pass",
        "portfolioId": ledger.get("portfolioId"),
        "displayNameKo": ledger.get("displayNameKo"),
        "relationToCanonical": ledger.get("relationToCanonical"),
        "canonicalAdoptionStatus": ledger.get("canonicalAdoptionStatus"),
        "targetSlots": 100,
        "occupiedSlots": state["occupied"],
        "blockedSlots": state["blocked"],
        "emptySlots": state["empty"],
        "annotationTargets": len(inventory_ids),
        "annotatedCandidates": len(annotated_ids),
        "remainingAnnotationTargets": len(inventory_ids - annotated_ids),
        "unplacedAnnotatedCandidates": unplaced_annotations,
        "reviewConfidence": confidence_counts,
        "categories": category_counts,
    }


def export_public(portfolio_root: Path, output: Path) -> dict[str, object]:
    status = portfolio_status(portfolio_root)
    output = output.resolve()
    try:
        relative = output.relative_to(ROOT)
    except ValueError:
        relative = output
    relative_text = str(relative)
    require("public/data/demo" not in relative_text, "portfolio-export-canonical-namespace")
    require(output.name != "project-state.json", "portfolio-export-canonical-name")
    ledger_path = portfolio_root.resolve() / "portfolio-100.json"
    ledger = load_json(ledger_path)
    require(isinstance(ledger, dict), "portfolio-object")
    categories = ledger.get("categories")
    require(isinstance(categories, list), "portfolio-categories")
    payload = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.research-portfolio-public-export/v1",
        "namespace": "kiheon-ideation-research-portfolio",
        "portfolioId": ledger.get("portfolioId"),
        "displayNameKo": ledger.get("displayNameKo"),
        "displayNameEn": ledger.get("displayNameEn"),
        "relationToCanonical": "parallel-research-portfolio",
        "relationNoteKo": "공식 MICA canonical catalogue와 병존하는 비정본 연구 포트폴리오",
        "canonicalAdoptionStatus": "not-adopted",
        "taskSet": "public",
        "holdoutIncluded": False,
        "targetSlotCount": 100,
        "occupiedSlotCount": status["occupiedSlots"],
        "blockedSlotCount": status["blockedSlots"],
        "categories": categories,
        "sourcePortfolioLedgerSha256": sha_file(ledger_path),
    }
    write_json(output, payload)
    return {
        "status": "pass",
        "output": display_path(output),
        "occupied": status["occupiedSlots"],
        "blocked": status["blockedSlots"],
        "sha256": sha_file(output),
    }


def closed_batch_candidates() -> list[dict[str, object]]:
    collected: list[dict[str, object]] = []
    for batch_dir in sorted(path for path in BATCH_ROOT.iterdir() if path.is_dir()):
        manifest_path = batch_dir / "batch-manifest.json"
        closure_path = batch_dir / "closure.json"
        frozen_path = batch_dir / "frozen-candidates.jsonl"
        if not all(path.is_file() for path in (manifest_path, closure_path, frozen_path)):
            continue
        manifest = load_json(manifest_path)
        closure = load_json(closure_path)
        if not isinstance(manifest, dict) or not isinstance(closure, dict):
            continue
        if manifest.get("status") != "completed" or closure.get("status") not in {"completed", "zero-accepted"}:
            continue
        category_hints: dict[str, object] = {}
        comparison_path = batch_dir / "comparison.jsonl"
        if comparison_path.is_file():
            for row, _ in parse_jsonl_with_hash(comparison_path):
                candidate_id = row.get("candidateId")
                if isinstance(candidate_id, str):
                    category_hints[candidate_id] = row.get("assignedCategory")
        for frozen, raw_sha in parse_jsonl_with_hash(frozen_path):
            nested_candidate = frozen.get("candidate")
            candidate = nested_candidate if isinstance(nested_candidate, dict) else frozen
            candidate_id = frozen.get("candidateId")
            require(isinstance(candidate, dict), f"frozen-candidate-payload:{batch_dir.name}")
            require(isinstance(candidate_id, str), f"frozen-candidate-id:{batch_dir.name}")
            task_set = candidate.get("taskSet", frozen.get("taskSet", "public"))
            require(task_set == "public", f"holdout-candidate-export:{candidate_id}")
            collected.append(
                packet_row(
                    job_id="",
                    source_kind="closed-batch-frozen-row",
                    source_path=str(frozen_path.relative_to(ROOT)),
                    batch_id=batch_dir.name,
                    candidate_id=candidate_id,
                    source_sha=raw_sha,
                    candidate=candidate,
                    category_hint=category_hints.get(candidate_id),
                )
            )
    return collected


def pilot_candidates() -> list[dict[str, object]]:
    document = load_json(PILOT_PATH)
    require(isinstance(document, dict), "pilot-document")
    candidates = document.get("candidates")
    require(isinstance(candidates, list) and len(candidates) == 15, "pilot-candidates")
    rows = []
    for candidate in candidates:
        require(isinstance(candidate, dict), "pilot-candidate-object")
        candidate_id = candidate.get("id")
        require(isinstance(candidate_id, str), "pilot-candidate-id")
        rows.append(
            packet_row(
                job_id="",
                source_kind="pilot-canonical-object",
                source_path=str(PILOT_PATH.relative_to(ROOT)),
                batch_id="pilot-15",
                candidate_id=candidate_id,
                source_sha=sha_bytes(canonical_bytes(candidate)),
                candidate=candidate,
                category_hint=None,
            )
        )
    return rows


def packet_row(
    *,
    job_id: str,
    source_kind: str,
    source_path: str,
    batch_id: str,
    candidate_id: str,
    source_sha: str,
    candidate: dict[str, object],
    category_hint: object,
) -> dict[str, object]:
    def text(field: str) -> str:
        value = candidate.get(field)
        return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)

    return {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.catalog-annotation-packet/v1",
        "jobId": job_id,
        "sourceKind": source_kind,
        "sourcePath": source_path,
        "batchId": batch_id,
        "candidateId": candidate_id,
        "sourceFrozenRowSha256": source_sha,
        "label": text("label"),
        "userRequest": text("userRequest"),
        "taskAction": text("taskAction"),
        "canonicalFinalState": text("canonicalFinalState"),
        "confirmationBoundary": text("confirmationBoundary"),
        "prohibitedStates": text("prohibitedStates"),
        "unknowns": text("unknowns"),
        "priorCategoryHint": category_hint,
    }


def completed_clean_room_candidates(exchange_root: Path) -> list[dict[str, object]]:
    collected: list[dict[str, object]] = []
    exchange_root = exchange_root.resolve()
    if not exchange_root.exists():
        return collected
    for ready_path in sorted(exchange_root.glob("*/READY.json")):
        ready = load_json(ready_path)
        require(isinstance(ready, dict), f"clean-room-ready-object:{ready_path.parent.name}")
        if ready.get("jobType") != "clean-room-production" or ready.get("stage") != "candidate-freeze":
            continue
        closure_path = ready_path.parent / "CLOSURE.json"
        if not closure_path.is_file():
            continue
        closure = load_json(closure_path)
        require(isinstance(closure, dict), f"clean-room-closure-object:{ready_path.parent.name}")
        if closure.get("status") != "COMPLETED":
            continue
        require(closure.get("inputBoundaryStatus") == "clean", f"clean-room-boundary:{ready_path.parent.name}")
        require(closure.get("nextStageAutoStarted") is False, f"clean-room-next-stage:{ready_path.parent.name}")
        output = ready.get("output")
        require(isinstance(output, dict), f"clean-room-output-contract:{ready_path.parent.name}")
        output_path_value = output.get("path")
        require(isinstance(output_path_value, str), f"clean-room-output-path:{ready_path.parent.name}")
        output_path = ready_path.parent / output_path_value
        require(output_path.is_file(), f"clean-room-output-missing:{ready_path.parent.name}")
        require(closure.get("outputPath") == output_path_value, f"clean-room-output-binding:{ready_path.parent.name}")
        require(closure.get("outputSha256") == sha_file(output_path), f"clean-room-output-sha:{ready_path.parent.name}")
        require(closure.get("outputBytes") == output_path.stat().st_size, f"clean-room-output-size:{ready_path.parent.name}")
        rows = parse_jsonl_with_hash(output_path)
        require(len(rows) == output.get("rowCount"), f"clean-room-output-count:{ready_path.parent.name}")
        frozen_ids = closure.get("frozenCandidateIds")
        require(isinstance(frozen_ids, list), f"clean-room-frozen-ids:{ready_path.parent.name}")
        require(
            frozen_ids == [row.get("candidateId") for row, _ in rows],
            f"clean-room-frozen-id-binding:{ready_path.parent.name}",
        )
        batch_id = ready.get("batchId")
        require(isinstance(batch_id, str) and batch_id, f"clean-room-batch-id:{ready_path.parent.name}")
        for frozen, raw_sha in rows:
            candidate = frozen.get("candidate")
            candidate_id = frozen.get("candidateId")
            require(isinstance(candidate, dict), f"clean-room-candidate-payload:{ready_path.parent.name}")
            require(isinstance(candidate_id, str), f"clean-room-candidate-id:{ready_path.parent.name}")
            require(candidate.get("candidateId") == candidate_id, f"clean-room-candidate-binding:{candidate_id}")
            require(candidate.get("origin") == "kiheon-ideation", f"clean-room-candidate-origin:{candidate_id}")
            collected.append(
                packet_row(
                    job_id="",
                    source_kind="clean-room-frozen-row",
                    source_path=str(output_path.relative_to(ROOT)),
                    batch_id=batch_id,
                    candidate_id=candidate_id,
                    source_sha=raw_sha,
                    candidate=candidate,
                    category_hint=None,
                )
            )
    return collected


def all_candidate_rows(exchange_root: Path = DEFAULT_EXCHANGE_ROOT) -> list[dict[str, object]]:
    rows = [
        *pilot_candidates(),
        *closed_batch_candidates(),
        *completed_clean_room_candidates(exchange_root),
    ]
    ids = [row["candidateId"] for row in rows]
    require(len(rows) >= 56, f"annotation-target-regression:{len(rows)}")
    require(len(set(ids)) == len(ids), "annotation-target-duplicate-id")
    return rows


def exchange_job_index(exchange_root: Path, portfolio_root: Path) -> tuple[set[str], list[str]]:
    exchange_root = exchange_root.resolve()
    portfolio_root = portfolio_root.resolve()
    packet_candidate_ids: set[str] = set()
    active_job_ids: list[str] = []
    if not exchange_root.exists():
        return packet_candidate_ids, active_job_ids
    for ready_path in sorted(exchange_root.glob("*/READY.json")):
        ready = load_json(ready_path)
        require(isinstance(ready, dict), f"exchange-ready-object:{ready_path.parent.name}")
        job_id = ready.get("jobId")
        require(job_id == ready_path.parent.name, f"exchange-job-id:{ready_path.parent.name}")
        if ready.get("jobType") != "catalog-annotation":
            continue
        packet_path = ready_path.parent / "packet.jsonl"
        require(ready.get("packetSha256") == sha_file(packet_path), f"exchange-packet-sha:{job_id}")
        if (portfolio_root / "receipts" / f"apply-{job_id}.json").is_file():
            continue
        for row, _ in parse_jsonl_with_hash(packet_path):
            candidate_id = row.get("candidateId")
            require(isinstance(candidate_id, str) and candidate_id, f"exchange-packet-candidate:{job_id}")
            require(candidate_id not in packet_candidate_ids, f"exchange-candidate-reselected:{candidate_id}")
            packet_candidate_ids.add(candidate_id)
        active_job_ids.append(str(job_id))
    return packet_candidate_ids, active_job_ids


def available_slot_ids(portfolio_root: Path) -> dict[str, list[str]]:
    ledger = load_json(portfolio_root.resolve() / "portfolio-100.json")
    require(isinstance(ledger, dict), "portfolio-object")
    categories = ledger.get("categories")
    require(isinstance(categories, list), "portfolio-categories")
    available: dict[str, list[str]] = {}
    for category in categories:
        require(isinstance(category, dict), "portfolio-category-object")
        category_id = category.get("categoryId")
        require(category_id in CATEGORIES, f"portfolio-category-id:{category_id}")
        slots = category.get("slots")
        require(isinstance(slots, list), f"portfolio-category-slots:{category_id}")
        available[str(category_id)] = [
            str(slot["slotId"])
            for slot in slots
            if isinstance(slot, dict) and slot.get("status") == "empty"
        ]
    require(tuple(available) == CATEGORIES, "portfolio-available-category-order")
    return available


def prepare_job(
    job_id: str,
    limit: int,
    exchange_root: Path,
    portfolio_root: Path,
    candidate_ids: tuple[str, ...] = (),
    provisional_candidate_ids: tuple[str, ...] = (),
) -> dict[str, object]:
    require(re.fullmatch(r"[a-z0-9][a-z0-9-]{2,63}", job_id) is not None, "job-id")
    require(1 <= limit <= 10, "job-limit-1-to-10")
    validate_portfolio(portfolio_root)
    job_dir = exchange_root.resolve() / job_id
    require(not job_dir.exists(), f"job-exists:{job_id}")
    packet_candidate_ids, active_job_ids = exchange_job_index(exchange_root, portfolio_root)
    require(not active_job_ids, f"active-job-exists:{','.join(active_job_ids)}")
    existing_ids = {
        row.get("candidateId")
        for row, _ in parse_jsonl_with_hash(portfolio_root.resolve() / "catalog-annotations.jsonl")
    }
    excluded_ids = existing_ids | packet_candidate_ids
    if candidate_ids:
        inventory = [row for row in all_candidate_rows(exchange_root) if row["candidateId"] not in existing_ids]
    else:
        inventory = [row for row in all_candidate_rows(exchange_root) if row["candidateId"] not in excluded_ids]
    inventory_by_id = {str(row["candidateId"]): row for row in inventory}
    require(len(candidate_ids) == len(set(candidate_ids)), "job-candidate-id-duplicate")
    if candidate_ids:
        require(len(candidate_ids) <= limit, "job-candidate-id-over-limit")
        missing = [candidate_id for candidate_id in candidate_ids if candidate_id not in inventory_by_id]
        require(not missing, f"job-candidate-id-unavailable:{','.join(missing)}")
        rows = [inventory_by_id[candidate_id] for candidate_id in candidate_ids]
    else:
        rows = inventory[:limit]
    require(rows, "no-unannotated-candidates")
    selected_ids = {str(row["candidateId"]) for row in rows}
    require(
        set(provisional_candidate_ids) <= selected_ids,
        "job-provisional-candidate-outside-packet",
    )
    for row in rows:
        row["jobId"] = job_id
    job_dir.mkdir(parents=True)
    packet_path = job_dir / "packet.jsonl"
    write_jsonl(packet_path, rows)
    input_manifest = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.exchange-input-manifest/v1",
        "jobId": job_id,
        "files": [
            {
                "path": "packet.jsonl",
                "byteLength": packet_path.stat().st_size,
                "sha256": sha_file(packet_path),
            }
        ],
    }
    write_json(job_dir / "INPUT-MANIFEST.json", input_manifest)
    ready = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.exchange-ready/v1",
        "jobId": job_id,
        "jobType": "catalog-annotation",
        "methodRevision": "standard-v1.3.5",
        "sourceCommitSha": git_head(),
        "packetPath": "packet.jsonl",
        "packetSha256": sha_file(packet_path),
        "allowedInputs": [
            "READY.json",
            "INPUT-MANIFEST.json",
            "packet.jsonl",
            "author-output.staging.jsonl",
        ],
        "forbiddenInputs": [
            "official MICA task catalogue",
            "private holdout",
            "portfolio-100.json and candidate-to-slot occupancy",
            "prior annotation review results",
            "Notion and Slack",
        ],
        "availableSlotIdsByCategory": available_slot_ids(portfolio_root),
        "roles": {
            "catalogAnnotator": {
                "output": "author-output.staging.jsonl",
                "schemaVersion": "mica.catalog-annotation/v3",
                "exactFields": list(ANNOTATION_FIELDS_V3),
            },
            "catalogAnnotationReviewer": {
                "output": "review-output.staging.jsonl",
                "schemaVersion": "mica.catalog-annotation-review/v3",
                "exactFields": list(REVIEW_FIELDS_V3),
                "mustUseDistinctContext": True,
            },
        },
        "annotationEnums": {
            "categoryId": [
                {
                    "value": category,
                    "labelKo": CATEGORY_LABELS_KO[category],
                    "guidanceKo": (
                        "계속적 이용계약에서 월 단위 요금, 의무사용기간·위약금, 해지 절차가 계약의 축인 통신, 디지털 구독, 물품 렌털을 포함한다. "
                        "납부·정산이 핵심이면 주거·공과금, 자금 이동이 핵심이면 금융·은행·투자, 구매·배송이 핵심이면 쇼핑·배송으로 분류한다."
                        if category == RENTAL_CATEGORY_ID
                        else "후보 원문이 이 생활 영역을 직접 지지할 때만 선택한다."
                    ),
                }
                for category in CATEGORIES
            ],
            "terminationClass": list(TERMINATION_CLASSES),
            "declaredComplexity": list(COMPLEXITIES),
            "targetSurface": list(TARGET_SURFACES),
            "slotDisposition": ["assigned", "category-overflow"],
        },
        "guidanceKo": {
            "task": "packet의 동결 후보 의미를 바꾸지 않고 카테고리, 슬롯 상태, 종료 유형, 구조 복잡도, 목표 접점을 사후 annotation한다.",
            "category": (
                "사용자 요청의 소재나 근거 수집처가 아니라 주 성공 경로의 완료 조건과 권위 있는 최종 상태가 성립하는 생활 영역을 우선한다. "
                "슬롯이 남는다는 이유로 다른 카테고리를 선택하지 않는다. 두 영역의 완료 조건이 실제로 겹치면 hold로 남긴다."
            ),
            "terminationClass": {
                "completed-final-state": "주 성공 경로에서 권위 있는 최종 상태에 도달하면 올바르게 종료한다. 실패 복구 분기에만 안전 인계가 있으면 이 값을 유지한다.",
                "approval-handoff": "주 성공 경로의 목표 종착점 자체가 사용자 또는 권한자의 필수 승인 인계이면 올바르게 종료한다.",
                "refusal": "범위 밖이거나 금지된 요청을 거절하면 올바르게 종료한다.",
                "escalation": "주 성공 경로를 에이전트가 완료할 수 없어 사람 또는 권위 기관에 안전하게 인계하는 것이 최종 상태이면 올바르게 종료한다.",
            },
            "declaredComplexity": {
                "single-step": "하나의 짧은 상태 확인 또는 변경으로 끝난다.",
                "multi-step": "한 세션 안에서 여러 의존 행동과 확인을 거친다.",
                "cross-session": "비동기 대기나 후속 확인으로 여러 세션에 걸친다.",
            },
            "targetSurface": "실제 플랫폼 확정값이 아니라 계획용 목표값이다. surfaceStatus는 항상 target-only이며 confirmedSurface를 만들지 않는다.",
            "measurementIntent": "상세 fixture나 oracle을 만들지 말고, 나중에 무엇을 참·거짓으로 확인할지 한 문장으로 쓴다.",
            "slot": (
                "판정한 카테고리에 빈 슬롯이 있으면 slotDisposition은 assigned이고 proposedSlotId는 READY의 가용 슬롯 중 하나여야 한다. "
                "판정한 카테고리의 가용 슬롯이 0개이면 slotDisposition은 category-overflow이고 proposedSlotId는 null이다. "
                "빈 슬롯이 있는데 overflow를 선택하거나, 슬롯을 얻으려고 카테고리 판정을 바꾸지 않는다."
            ),
            "categoryProvisional": (
                "기본값은 false이며 categoryRationale은 빈 문자열이다. READY의 controllerApprovedProvisionalCandidateIds에 있는 후보가 "
                "telecom-subscriptions를 선택하면 categoryProvisional은 반드시 true여야 한다. 이때 categoryRationale은 "
                "정기계약 기제 공유. 분류 체계 개정 시 재배치 대상 으로 정확히 기록한다. 다른 카테고리를 선택하면 false와 빈 문자열을 유지한다. "
                "이 표시는 카테고리 관문을 우회하는 승인이나 자동 배정이 아니다."
            ),
            "evidence": "후보 원문이 지지하지 않는 사업자명, 시장 수치, 표본수, 제약을 만들지 않는다.",
            "review": "여섯 boolean 판정을 모두 독립적으로 확인한다. 모두 true일 때만 accept하며, 근거가 부족하면 hold, 잘못된 결속이면 reject한다.",
            "reviewConfidence": "high·medium·low 중 하나를 기록한다. medium·low는 uncertaintyNote가 필수이며 low는 accept할 수 없다.",
            "inputAccess": "허용 입력을 순서대로 하나씩 읽는다. 검색·병렬 명령에 금지 경로를 함께 넣지 않으며 금지 입력을 한 번이라도 읽으면 결과를 살리지 않고 INPUT-BOUNDARY-BREACH로 닫는다.",
        },
        "controllerApprovedProvisionalCandidateIds": list(provisional_candidate_ids),
        "maxRows": len(rows),
        "closureContract": {
            "path": "CLOSURE.json",
            "inputBoundaryStatusValues": ["clean", "breach"],
            "exactFields": [
                "origin",
                "schemaVersion",
                "jobId",
                "status",
                "SlackCalls",
                "NotionCalls",
                "forbiddenInputReads",
                "inputBoundaryStatus",
                "authorContextId",
                "reviewerContextId",
                "writtenRows",
                "acceptedRows",
                "rejectedRows",
                "heldRows",
                "authorOutputSha256",
                "reviewOutputSha256",
                "closedAt",
                "nextStageAutoStarted",
            ],
        },
        "completionStatuses": ["COMPLETED", "ZERO-ACCEPTED", "INPUT-BOUNDARY-BREACH", "BLOCKED"],
        "status": "READY",
    }
    write_json(job_dir / "READY.json", ready)
    for name in ("author-output.staging.jsonl", "review-output.staging.jsonl"):
        (job_dir / name).write_text("", encoding="utf-8")
    return {"status": "READY", "jobId": job_id, "rows": len(rows), "path": str(job_dir)}


def validate_annotation(
    row: dict[str, object],
    job_id: str,
    packet: dict[str, dict[str, object]],
    available_slots: dict[str, set[str]],
    annotation_schema: object,
    approved_provisional_ids: set[str],
) -> None:
    require(
        tuple(row) == annotation_fields(annotation_schema),
        f"annotation-key-order:{row.get('candidateId')}",
    )
    require(row.get("origin") == "kiheon-ideation", "annotation-origin")
    require(row.get("schemaVersion") == annotation_schema, "annotation-schema")
    require(row.get("jobId") == job_id, "annotation-job")
    candidate_id = row.get("candidateId")
    require(isinstance(candidate_id, str) and candidate_id in packet, f"annotation-candidate:{candidate_id}")
    source = packet[candidate_id]
    require(row.get("batchId") == source.get("batchId"), f"annotation-batch:{candidate_id}")
    require(row.get("sourceFrozenRowSha256") == source.get("sourceFrozenRowSha256"), f"annotation-source-sha:{candidate_id}")
    category = row.get("categoryId")
    require(category in CATEGORIES, f"annotation-category:{candidate_id}")
    slot_disposition = annotation_slot_disposition(row)
    require(slot_disposition in SLOT_DISPOSITIONS, f"annotation-slot-disposition:{candidate_id}")
    category_slots = available_slots[str(category)]
    if slot_disposition == "assigned":
        require(row.get("proposedSlotId") in category_slots, f"annotation-slot:{candidate_id}")
    else:
        require(
            annotation_schema in {"mica.catalog-annotation/v3", "mica.catalog-annotation/v4"},
            f"annotation-overflow-schema:{candidate_id}",
        )
        require(not category_slots, f"annotation-overflow-with-available-slot:{candidate_id}")
        require(row.get("proposedSlotId") is None, f"annotation-overflow-slot:{candidate_id}")
    if annotation_schema in {
        "mica.catalog-annotation/v2",
        "mica.catalog-annotation/v3",
        "mica.catalog-annotation/v4",
    }:
        provisional = row.get("categoryProvisional")
        rationale = row.get("categoryRationale")
        require(type(provisional) is bool, f"annotation-provisional:{candidate_id}")
        require(isinstance(rationale, str), f"annotation-rationale:{candidate_id}")
        if provisional:
            require(candidate_id in approved_provisional_ids, f"annotation-provisional-not-approved:{candidate_id}")
            require(category == RENTAL_CATEGORY_ID, f"annotation-provisional-category:{candidate_id}")
            require(rationale == RENTAL_PROVISIONAL_RATIONALE, f"annotation-provisional-rationale:{candidate_id}")
        else:
            require(not rationale, f"annotation-rationale-without-provisional:{candidate_id}")
            require(
                candidate_id not in approved_provisional_ids or category != RENTAL_CATEGORY_ID,
                f"annotation-provisional-required:{candidate_id}",
            )
    if annotation_schema == "mica.catalog-annotation/v4":
        require(row.get("tier") in TIER_VALUES, f"annotation-tier:{candidate_id}")
    require(row.get("terminationClass") in TERMINATION_CLASSES, f"annotation-termination:{candidate_id}")
    require(row.get("declaredComplexity") in COMPLEXITIES, f"annotation-complexity:{candidate_id}")
    require(row.get("targetSurface") in TARGET_SURFACES, f"annotation-surface:{candidate_id}")
    require(row.get("surfaceStatus") == "target-only", f"annotation-surface-status:{candidate_id}")
    require("confirmedSurface" not in row, f"annotation-confirmed-surface:{candidate_id}")
    require(isinstance(row.get("measurementIntent"), str) and row["measurementIntent"].strip(), f"annotation-measurement-intent:{candidate_id}")
    require(isinstance(row.get("annotatorContextId"), str) and row["annotatorContextId"].strip(), f"annotation-context:{candidate_id}")
    timestamp(row.get("annotatedAt"), f"annotation-time:{candidate_id}")


def validate_job(job_id: str, exchange_root: Path) -> dict[str, object]:
    job_dir = exchange_root.resolve() / job_id
    ready = load_json(job_dir / "READY.json")
    manifest = load_json(job_dir / "INPUT-MANIFEST.json")
    require(isinstance(ready, dict) and ready.get("status") == "READY", "job-not-ready")
    require(isinstance(manifest, dict), "job-input-manifest")
    require(ready.get("jobId") == job_id and manifest.get("jobId") == job_id, "job-id-mismatch")
    packet_path = job_dir / "packet.jsonl"
    require(ready.get("packetSha256") == sha_file(packet_path), "job-packet-sha")
    files = manifest.get("files")
    require(isinstance(files, list) and len(files) == 1, "job-input-files")
    require(files[0].get("sha256") == sha_file(packet_path), "job-input-manifest-sha")
    packet_rows = parse_jsonl_with_hash(packet_path)
    packet = {str(row.get("candidateId")): row for row, _ in packet_rows}
    require(len(packet) == len(packet_rows), "job-packet-duplicate")
    available_raw = ready.get("availableSlotIdsByCategory")
    if available_raw is None:
        available_slots = {
            category: {f"{category}-{index:02d}" for index in range(1, 11)}
            for category in CATEGORIES
        }
    else:
        require(isinstance(available_raw, dict), "job-available-slots")
        require(tuple(available_raw) == CATEGORIES, "job-available-category-order")
        available_slots: dict[str, set[str]] = {}
        for category in CATEGORIES:
            slot_ids = available_raw.get(category)
            require(isinstance(slot_ids, list), f"job-available-slot-list:{category}")
            require(len(slot_ids) == len(set(slot_ids)), f"job-available-slot-duplicate:{category}")
            expected = {f"{category}-{index:02d}" for index in range(1, 11)}
            require(set(slot_ids) <= expected, f"job-available-slot-id:{category}")
            available_slots[category] = set(slot_ids)
    annotations = parse_jsonl_with_hash(job_dir / "author-output.staging.jsonl")
    reviews = parse_jsonl_with_hash(job_dir / "review-output.staging.jsonl")
    reviewer_contract = ready.get("roles", {}).get("catalogAnnotationReviewer") if isinstance(ready.get("roles"), dict) else None
    annotator_contract = ready.get("roles", {}).get("catalogAnnotator") if isinstance(ready.get("roles"), dict) else None
    require(isinstance(annotator_contract, dict), "job-annotator-contract")
    annotation_schema = annotator_contract.get("schemaVersion")
    require(annotator_contract.get("exactFields") == list(annotation_fields(annotation_schema)), "job-annotator-fields")
    accepted_annotation_schemas = {str(annotation_schema)}
    accepted_schema_contracts = annotator_contract.get("acceptedSchemas")
    if accepted_schema_contracts is not None:
        require(isinstance(accepted_schema_contracts, list), "job-annotator-accepted-schemas")
        accepted_annotation_schemas = set()
        for contract in accepted_schema_contracts:
            require(isinstance(contract, dict), "job-annotator-accepted-schema-object")
            schema = contract.get("schemaVersion")
            require(contract.get("exactFields") == list(annotation_fields(schema)), "job-annotator-accepted-schema-fields")
            accepted_annotation_schemas.add(str(schema))
        require(str(annotation_schema) in accepted_annotation_schemas, "job-annotator-default-schema")
    approved_provisional_raw = ready.get("controllerApprovedProvisionalCandidateIds", [])
    require(isinstance(approved_provisional_raw, list), "job-provisional-candidate-list")
    require(
        len(approved_provisional_raw) == len(set(approved_provisional_raw)),
        "job-provisional-candidate-duplicate",
    )
    approved_provisional_ids = {str(value) for value in approved_provisional_raw}
    require(approved_provisional_ids <= set(packet), "job-provisional-candidate-outside-packet")
    require(isinstance(reviewer_contract, dict), "job-reviewer-contract")
    review_schema = reviewer_contract.get("schemaVersion")
    expected_review_fields = review_fields(review_schema)
    require(len(annotations) <= int(ready.get("maxRows", 0)), "job-annotation-over-max")
    annotation_by_id: dict[str, tuple[dict[str, object], str]] = {}
    annotator_contexts: set[str] = set()
    proposed_slots: set[str] = set()
    for row, row_sha in annotations:
        row_schema = row.get("schemaVersion")
        require(str(row_schema) in accepted_annotation_schemas, f"annotation-schema-not-accepted:{row.get('candidateId')}")
        validate_annotation(
            row,
            job_id,
            packet,
            available_slots,
            row_schema,
            approved_provisional_ids,
        )
        candidate_id = str(row["candidateId"])
        require(candidate_id not in annotation_by_id, f"annotation-duplicate:{candidate_id}")
        if annotation_slot_disposition(row) == "assigned":
            proposed_slot = str(row["proposedSlotId"])
            require(proposed_slot not in proposed_slots, f"annotation-slot-duplicate:{proposed_slot}")
            proposed_slots.add(proposed_slot)
        annotation_by_id[candidate_id] = (row, row_sha)
        annotator_contexts.add(str(row["annotatorContextId"]))
    reviewed_ids: set[str] = set()
    accepted = 0
    reviewer_contexts: set[str] = set()
    for row, _ in reviews:
        require(tuple(row) == expected_review_fields, f"review-key-order:{row.get('candidateId')}")
        require(row.get("origin") == "kiheon-ideation", "review-origin")
        require(row.get("schemaVersion") == review_schema, "review-schema")
        require(row.get("jobId") == job_id, "review-job")
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id in annotation_by_id, f"review-candidate:{candidate_id}")
        require(candidate_id not in reviewed_ids, f"review-duplicate:{candidate_id}")
        reviewed_ids.add(candidate_id)
        annotation, annotation_sha = annotation_by_id[candidate_id]
        require(row.get("annotationRowSha256") == annotation_sha, f"review-annotation-sha:{candidate_id}")
        checks = review_check_fields(review_schema)
        require(all(type(row.get(field)) is bool for field in checks), f"review-check-shape:{candidate_id}")
        confidence = (
            row.get("confidence")
            if review_schema in {"mica.catalog-annotation-review/v2", "mica.catalog-annotation-review/v3"}
            else "legacy-unknown"
        )
        if review_schema in {"mica.catalog-annotation-review/v2", "mica.catalog-annotation-review/v3"}:
            require(confidence in REVIEW_CONFIDENCES, f"review-confidence:{candidate_id}")
            uncertainty_note = row.get("uncertaintyNote")
            require(isinstance(uncertainty_note, str), f"review-uncertainty:{candidate_id}")
            require(confidence == "high" or uncertainty_note.strip(), f"review-uncertainty-empty:{candidate_id}")
        expected = all(row[field] for field in checks) and confidence != "low"
        require(row.get("verdict") in {"accept", "reject", "hold"}, f"review-verdict:{candidate_id}")
        require((row.get("verdict") == "accept") == expected, f"review-verdict-mismatch:{candidate_id}")
        reviewer = row.get("reviewerContextId")
        require(isinstance(reviewer, str) and reviewer.strip(), f"review-context:{candidate_id}")
        require(reviewer not in annotator_contexts, f"annotation-review-context-collision:{candidate_id}")
        reviewer_contexts.add(reviewer)
        require(isinstance(row.get("reviewNote"), str) and row["reviewNote"].strip(), f"review-note:{candidate_id}")
        timestamp(row.get("reviewedAt"), f"review-time:{candidate_id}")
        accepted += row.get("verdict") == "accept"
    require(reviewed_ids == set(annotation_by_id), "job-review-incomplete")
    require(len(annotator_contexts) == 1, "job-annotator-context-count")
    require(len(reviewer_contexts) == 1, "job-reviewer-context-count")
    return {"status": "pass", "jobId": job_id, "packet": len(packet), "annotated": len(annotations), "accepted": accepted}


def apply_job(job_id: str, applied_by: str, observed_at: str, exchange_root: Path, portfolio_root: Path) -> dict[str, object]:
    result = validate_job(job_id, exchange_root)
    timestamp(observed_at, "portfolio-apply-time")
    portfolio_root = portfolio_root.resolve()
    job_dir = exchange_root.resolve() / job_id
    receipt_path = portfolio_root / "receipts" / f"apply-{job_id}.json"
    if receipt_path.exists():
        receipt = load_json(receipt_path)
        require(isinstance(receipt, dict), f"portfolio-receipt-object:{job_id}")
        require(receipt.get("jobId") == job_id, f"portfolio-receipt-job:{job_id}")
        require(
            receipt.get("annotationSha256") == sha_file(job_dir / "author-output.staging.jsonl"),
            f"portfolio-replay-annotation:{job_id}",
        )
        require(
            receipt.get("reviewSha256") == sha_file(job_dir / "review-output.staging.jsonl"),
            f"portfolio-replay-review:{job_id}",
        )
        require(
            receipt.get("afterPortfolioSha256") == sha_file(portfolio_root / "portfolio-100.json"),
            f"portfolio-replay-ledger:{job_id}",
        )
        require(
            receipt.get("afterAnnotationLedgerSha256")
            == sha_file(portfolio_root / "catalog-annotations.jsonl"),
            f"portfolio-replay-annotation-ledger:{job_id}",
        )
        require(
            receipt.get("afterReviewLedgerSha256")
            == sha_file(portfolio_root / "catalog-annotation-reviews.jsonl"),
            f"portfolio-replay-review-ledger:{job_id}",
        )
        return {
            "status": "pass",
            "jobId": job_id,
            "applied": receipt.get("appliedCount"),
            "receipt": str(receipt_path),
            "replayed": True,
        }
    closure = load_json(job_dir / "CLOSURE.json")
    require(isinstance(closure, dict), "job-closure")
    ready = load_json(job_dir / "READY.json")
    require(isinstance(ready, dict), "job-ready-object")
    closure_contract = ready.get("closureContract")
    require(isinstance(closure_contract, dict), "job-closure-contract")
    closure_fields = closure_contract.get("exactFields")
    require(isinstance(closure_fields, list), "job-closure-fields")
    require(list(closure) == closure_fields, "job-closure-key-order")
    require(closure.get("origin") == "kiheon-ideation", "job-closure-origin")
    require(closure.get("schemaVersion") == "mica.exchange-closure/v1", "job-closure-schema")
    require(closure.get("jobId") == job_id, "job-closure-id")
    require(closure.get("status") in {"COMPLETED", "ZERO-ACCEPTED"}, "job-closure-status")
    require(closure.get("SlackCalls") == 0 and closure.get("NotionCalls") == 0, "job-external-tool-call")
    if "forbiddenInputReads" in closure_fields:
        require(closure.get("forbiddenInputReads") == 0, "job-forbidden-input-read")
        require(closure.get("inputBoundaryStatus") == "clean", "job-input-boundary-status")
    require(closure.get("nextStageAutoStarted") is False, "job-next-stage-started")
    require(
        closure.get("authorOutputSha256") == sha_file(job_dir / "author-output.staging.jsonl"),
        "job-author-output-sha",
    )
    require(
        closure.get("reviewOutputSha256") == sha_file(job_dir / "review-output.staging.jsonl"),
        "job-review-output-sha",
    )
    timestamp(closure.get("closedAt"), "job-closure-time")
    annotations = {row["candidateId"]: (row, sha) for row, sha in parse_jsonl_with_hash(job_dir / "author-output.staging.jsonl")}
    reviews = {row["candidateId"]: (row, sha) for row, sha in parse_jsonl_with_hash(job_dir / "review-output.staging.jsonl")}
    require(closure.get("writtenRows") == len(annotations), "job-closure-written-count")
    require(closure.get("acceptedRows") == result["accepted"], "job-closure-accepted-count")
    require(
        closure.get("rejectedRows")
        == sum(row.get("verdict") == "reject" for row, _ in reviews.values()),
        "job-closure-rejected-count",
    )
    require(
        closure.get("heldRows") == sum(row.get("verdict") == "hold" for row, _ in reviews.values()),
        "job-closure-held-count",
    )
    annotator_contexts = {str(row.get("annotatorContextId")) for row, _ in annotations.values()}
    reviewer_contexts = {str(row.get("reviewerContextId")) for row, _ in reviews.values()}
    require(annotator_contexts == {closure.get("authorContextId")}, "job-closure-author-context")
    require(reviewer_contexts == {closure.get("reviewerContextId")}, "job-closure-reviewer-context")
    ledger_path = portfolio_root / "portfolio-100.json"
    before_portfolio_sha = sha_file(ledger_path)
    ledger = load_json(ledger_path)
    require(isinstance(ledger, dict), "portfolio-object")
    existing_annotations = parse_jsonl_with_hash(portfolio_root / "catalog-annotations.jsonl")
    existing_ids = {row.get("candidateId") for row, _ in existing_annotations}
    applied = 0
    placed = 0
    unplaced = 0
    for candidate_id, (review, review_sha) in reviews.items():
        if review.get("verdict") != "accept":
            continue
        require(candidate_id not in existing_ids, f"portfolio-candidate-already-applied:{candidate_id}")
        annotation, annotation_sha = annotations[candidate_id]
        if annotation_slot_disposition(annotation) == "assigned":
            slot_id = annotation["proposedSlotId"]
            target = None
            for category in ledger["categories"]:
                for slot in category["slots"]:
                    if slot["slotId"] == slot_id:
                        target = slot
                        break
            require(target is not None, f"portfolio-slot-missing:{slot_id}")
            require(target["status"] == "empty", f"portfolio-slot-not-empty:{slot_id}")
            target.update(
                {
                    "status": "occupied",
                    "candidateId": candidate_id,
                    "annotationRowSha256": annotation_sha,
                    "reviewRowSha256": review_sha,
                    "sourceBatchId": annotation["batchId"],
                    "tier": annotation_tier(annotation),
                }
            )
            placed += 1
        else:
            unplaced += 1
        existing_ids.add(candidate_id)
        applied += 1
    require(applied == result["accepted"], "portfolio-accepted-apply-count")
    annotation_ledger = portfolio_root / "catalog-annotations.jsonl"
    review_ledger = portfolio_root / "catalog-annotation-reviews.jsonl"
    before_annotation_bytes = annotation_ledger.read_bytes()
    before_review_bytes = review_ledger.read_bytes()
    annotation_raw_rows = raw_jsonl_rows_by_candidate(job_dir / "author-output.staging.jsonl")
    review_raw_rows = raw_jsonl_rows_by_candidate(job_dir / "review-output.staging.jsonl")
    annotation_bytes = before_annotation_bytes + b"".join(
        annotation_raw_rows[candidate_id]
        for candidate_id in annotations
        if reviews[candidate_id][0].get("verdict") == "accept"
    )
    review_bytes = before_review_bytes + b"".join(
        review_raw_rows[candidate_id]
        for candidate_id, (row, _) in reviews.items()
        if row.get("verdict") == "accept"
    )
    portfolio_bytes = pretty_json_bytes(ledger)
    receipt = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.portfolio-apply-receipt/v1",
        "transactionId": f"apply-{job_id}",
        "jobId": job_id,
        "sourceBatchIds": sorted({str(row[0].get("batchId")) for row in annotations.values()}),
        "sourceCommitSha": ready.get("sourceCommitSha"),
        "sourceClosureSha256": sha_file(job_dir / "CLOSURE.json"),
        "annotationPath": display_path(job_dir / "author-output.staging.jsonl"),
        "annotationSha256": sha_file(job_dir / "author-output.staging.jsonl"),
        "reviewPath": display_path(job_dir / "review-output.staging.jsonl"),
        "reviewSha256": sha_file(job_dir / "review-output.staging.jsonl"),
        "beforePortfolioSha256": before_portfolio_sha,
        "afterPortfolioSha256": sha_bytes(portfolio_bytes),
        "beforeAnnotationLedgerSha256": sha_bytes(before_annotation_bytes),
        "afterAnnotationLedgerSha256": sha_bytes(annotation_bytes),
        "beforeReviewLedgerSha256": sha_bytes(before_review_bytes),
        "afterReviewLedgerSha256": sha_bytes(review_bytes),
        "appliedByContextId": applied_by,
        "appliedCount": applied,
        "placedCount": placed,
        "unplacedCount": unplaced,
        "observedAt": observed_at,
    }
    artifact_ledger = portfolio_root / "portfolio-artifact-ledger.jsonl"
    artifact_bytes = artifact_ledger.read_bytes() + canonical_bytes(receipt)
    transactional_write(
        {
            ledger_path: portfolio_bytes,
            annotation_ledger: annotation_bytes,
            review_ledger: review_bytes,
            receipt_path: pretty_json_bytes(receipt),
            artifact_ledger: artifact_bytes,
        },
        transaction_id=f"apply-{job_id}",
        validator=lambda: validate_portfolio(portfolio_root),
    )
    return {
        "status": "pass",
        "jobId": job_id,
        "applied": applied,
        "placed": placed,
        "unplaced": unplaced,
        "receipt": str(receipt_path),
    }


def print_result(result: dict[str, object], as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("PASS " + " ".join(f"{key}={value}" for key, value in result.items() if key != "status"))


def main() -> int:
    parser = argparse.ArgumentParser(description="MICA research portfolio controller")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--portfolio-root", type=Path, default=DEFAULT_PORTFOLIO_ROOT)
    parser.add_argument("--exchange-root", type=Path, default=DEFAULT_EXCHANGE_ROOT)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("init")
    commands.add_parser("validate")
    commands.add_parser("status")
    export = commands.add_parser("export-public")
    export.add_argument("--output", type=Path, required=True)
    prepare = commands.add_parser("prepare-job")
    prepare.add_argument("--job-id", required=True)
    prepare.add_argument("--limit", type=int, default=10)
    prepare.add_argument("--candidate-id", action="append", default=[])
    prepare.add_argument("--provisional-candidate-id", action="append", default=[])
    validate = commands.add_parser("validate-job")
    validate.add_argument("--job-id", required=True)
    apply = commands.add_parser("apply")
    apply.add_argument("--job-id", required=True)
    apply.add_argument("--applied-by-context-id", required=True)
    apply.add_argument("--observed-at", required=True)
    args = parser.parse_args()
    try:
        if args.command == "init":
            result = init_portfolio(args.portfolio_root)
        elif args.command == "validate":
            result = validate_portfolio(args.portfolio_root)
        elif args.command == "status":
            result = portfolio_status(args.portfolio_root)
        elif args.command == "export-public":
            result = export_public(args.portfolio_root, args.output)
        elif args.command == "prepare-job":
            result = prepare_job(
                args.job_id,
                args.limit,
                args.exchange_root,
                args.portfolio_root,
                tuple(args.candidate_id),
                tuple(args.provisional_candidate_id),
            )
        elif args.command == "validate-job":
            result = validate_job(args.job_id, args.exchange_root)
        else:
            result = apply_job(
                args.job_id,
                args.applied_by_context_id,
                args.observed_at,
                args.exchange_root,
                args.portfolio_root,
            )
    except PortfolioError as exc:
        if args.json:
            print(json.dumps({"status": "fail", "detail": str(exc)}, ensure_ascii=False))
        else:
            print(f"FAIL {exc}")
        return 1
    print_result(result, args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
