#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
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
TERMINATION_CLASSES = (
    "completed-final-state",
    "approval-handoff",
    "refusal",
    "escalation",
)
COMPLEXITIES = ("single-step", "multi-step", "cross-session")
TARGET_SURFACES = ("web", "app-only", "identity-gated", "phone-or-in-person", "mixed-surface")
ANNOTATION_FIELDS = (
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
REVIEW_FIELDS = (
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


def transactional_write(payloads: dict[Path, bytes], transaction_id: str) -> None:
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
                "slots": [
                    {
                        "slotId": f"{category}-{index:02d}",
                        "status": "empty",
                        "candidateId": None,
                        "annotationRowSha256": None,
                        "reviewRowSha256": None,
                        "sourceBatchId": None,
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
            all(slot.get(field) is None for field in ("candidateId", "annotationRowSha256", "reviewRowSha256", "sourceBatchId")),
            f"empty-slot-binding:{slot_id}",
        )
    elif status == "blocked":
        require(len(history) > 0, f"blocked-slot-history:{slot_id}")
        require(slot.get("candidateId") is None, f"blocked-slot-candidate:{slot_id}")
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
    for name in ("catalog-annotations.jsonl", "catalog-annotation-reviews.jsonl", "portfolio-artifact-ledger.jsonl"):
        parse_jsonl_with_hash(portfolio_root / name)
    receipts = portfolio_root / "receipts"
    require(receipts.is_dir(), "portfolio-receipts")
    return {"status": "pass", "occupied": occupied, "blocked": blocked, "empty": 100 - occupied - blocked}


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


def all_candidate_rows() -> list[dict[str, object]]:
    rows = [*pilot_candidates(), *closed_batch_candidates()]
    ids = [row["candidateId"] for row in rows]
    require(len(rows) == 56, f"annotation-target-count:{len(rows)}")
    require(len(set(ids)) == len(ids), "annotation-target-duplicate-id")
    return rows


def prepare_job(job_id: str, limit: int, exchange_root: Path, portfolio_root: Path) -> dict[str, object]:
    require(re.fullmatch(r"[a-z0-9][a-z0-9-]{2,63}", job_id) is not None, "job-id")
    require(1 <= limit <= 10, "job-limit-1-to-10")
    validate_portfolio(portfolio_root)
    job_dir = exchange_root.resolve() / job_id
    require(not job_dir.exists(), f"job-exists:{job_id}")
    existing_ids = {
        row.get("candidateId")
        for row, _ in parse_jsonl_with_hash(portfolio_root.resolve() / "catalog-annotations.jsonl")
    }
    rows = [row for row in all_candidate_rows() if row["candidateId"] not in existing_ids][:limit]
    require(rows, "no-unannotated-candidates")
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
        "allowedInputs": ["READY.json", "INPUT-MANIFEST.json", "packet.jsonl"],
        "forbiddenInputs": [
            "official MICA task catalogue",
            "private holdout",
            "portfolio-100.json and slot occupancy",
            "prior annotation review results",
            "Notion and Slack",
        ],
        "roles": {
            "catalogAnnotator": {
                "output": "author-output.staging.jsonl",
                "schemaVersion": "mica.catalog-annotation/v1",
                "exactFields": list(ANNOTATION_FIELDS),
            },
            "catalogAnnotationReviewer": {
                "output": "review-output.staging.jsonl",
                "schemaVersion": "mica.catalog-annotation-review/v1",
                "exactFields": list(REVIEW_FIELDS),
                "mustUseDistinctContext": True,
            },
        },
        "annotationEnums": {
            "categoryId": list(CATEGORIES),
            "terminationClass": list(TERMINATION_CLASSES),
            "declaredComplexity": list(COMPLEXITIES),
            "targetSurface": list(TARGET_SURFACES),
        },
        "maxRows": len(rows),
        "closureContract": {
            "path": "CLOSURE.json",
            "exactFields": [
                "origin",
                "schemaVersion",
                "jobId",
                "status",
                "SlackCalls",
                "NotionCalls",
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


def validate_annotation(row: dict[str, object], job_id: str, packet: dict[str, dict[str, object]]) -> None:
    require(tuple(row) == ANNOTATION_FIELDS, f"annotation-key-order:{row.get('candidateId')}")
    require(row.get("origin") == "kiheon-ideation", "annotation-origin")
    require(row.get("schemaVersion") == "mica.catalog-annotation/v1", "annotation-schema")
    require(row.get("jobId") == job_id, "annotation-job")
    candidate_id = row.get("candidateId")
    require(isinstance(candidate_id, str) and candidate_id in packet, f"annotation-candidate:{candidate_id}")
    source = packet[candidate_id]
    require(row.get("batchId") == source.get("batchId"), f"annotation-batch:{candidate_id}")
    require(row.get("sourceFrozenRowSha256") == source.get("sourceFrozenRowSha256"), f"annotation-source-sha:{candidate_id}")
    category = row.get("categoryId")
    require(category in CATEGORIES, f"annotation-category:{candidate_id}")
    require(row.get("proposedSlotId") in {f"{category}-{index:02d}" for index in range(1, 11)}, f"annotation-slot:{candidate_id}")
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
    annotations = parse_jsonl_with_hash(job_dir / "author-output.staging.jsonl")
    reviews = parse_jsonl_with_hash(job_dir / "review-output.staging.jsonl")
    require(len(annotations) <= int(ready.get("maxRows", 0)), "job-annotation-over-max")
    annotation_by_id: dict[str, tuple[dict[str, object], str]] = {}
    annotator_contexts: set[str] = set()
    for row, row_sha in annotations:
        validate_annotation(row, job_id, packet)
        candidate_id = str(row["candidateId"])
        require(candidate_id not in annotation_by_id, f"annotation-duplicate:{candidate_id}")
        annotation_by_id[candidate_id] = (row, row_sha)
        annotator_contexts.add(str(row["annotatorContextId"]))
    reviewed_ids: set[str] = set()
    accepted = 0
    reviewer_contexts: set[str] = set()
    for row, _ in reviews:
        require(tuple(row) == REVIEW_FIELDS, f"review-key-order:{row.get('candidateId')}")
        require(row.get("origin") == "kiheon-ideation", "review-origin")
        require(row.get("schemaVersion") == "mica.catalog-annotation-review/v1", "review-schema")
        require(row.get("jobId") == job_id, "review-job")
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id in annotation_by_id, f"review-candidate:{candidate_id}")
        require(candidate_id not in reviewed_ids, f"review-duplicate:{candidate_id}")
        reviewed_ids.add(candidate_id)
        annotation, annotation_sha = annotation_by_id[candidate_id]
        require(row.get("annotationRowSha256") == annotation_sha, f"review-annotation-sha:{candidate_id}")
        checks = ("candidateBinding", "categorySlot", "terminationClass", "declaredComplexity", "targetSurfaceProvisional")
        require(all(type(row.get(field)) is bool for field in checks), f"review-check-shape:{candidate_id}")
        expected = all(row[field] for field in checks)
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
    require(not receipt_path.exists(), f"portfolio-receipt-exists:{job_id}")
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
    for candidate_id, (review, review_sha) in reviews.items():
        if review.get("verdict") != "accept":
            continue
        require(candidate_id not in existing_ids, f"portfolio-candidate-already-applied:{candidate_id}")
        annotation, annotation_sha = annotations[candidate_id]
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
            }
        )
        existing_ids.add(candidate_id)
        applied += 1
    require(applied == result["accepted"], "portfolio-accepted-apply-count")
    annotation_ledger = portfolio_root / "catalog-annotations.jsonl"
    review_ledger = portfolio_root / "catalog-annotation-reviews.jsonl"
    annotation_bytes = annotation_ledger.read_bytes() + b"".join(
        canonical_bytes(row)
        for candidate_id, (row, _) in annotations.items()
        if reviews[candidate_id][0].get("verdict") == "accept"
    )
    review_bytes = review_ledger.read_bytes() + b"".join(
        canonical_bytes(row) for row, _ in reviews.values() if row.get("verdict") == "accept"
    )
    portfolio_bytes = pretty_json_bytes(ledger)
    receipt = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.portfolio-apply-receipt/v1",
        "transactionId": f"apply-{job_id}",
        "jobId": job_id,
        "sourceCommitSha": ready.get("sourceCommitSha"),
        "annotationPath": display_path(job_dir / "author-output.staging.jsonl"),
        "annotationSha256": sha_file(job_dir / "author-output.staging.jsonl"),
        "reviewPath": display_path(job_dir / "review-output.staging.jsonl"),
        "reviewSha256": sha_file(job_dir / "review-output.staging.jsonl"),
        "beforePortfolioSha256": before_portfolio_sha,
        "afterPortfolioSha256": sha_bytes(portfolio_bytes),
        "afterAnnotationLedgerSha256": sha_bytes(annotation_bytes),
        "afterReviewLedgerSha256": sha_bytes(review_bytes),
        "appliedByContextId": applied_by,
        "appliedCount": applied,
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
    )
    validate_portfolio(portfolio_root)
    return {"status": "pass", "jobId": job_id, "applied": applied, "receipt": str(receipt_path)}


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
    prepare = commands.add_parser("prepare-job")
    prepare.add_argument("--job-id", required=True)
    prepare.add_argument("--limit", type=int, default=10)
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
        elif args.command == "prepare-job":
            result = prepare_job(args.job_id, args.limit, args.exchange_root, args.portfolio_root)
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
