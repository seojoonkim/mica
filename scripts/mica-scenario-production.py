#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOC_ROOT = ROOT / "docs" / "kiheon-ideation-pilot-15"
CODEX_SKILL = ROOT / ".agents" / "skills" / "mica-scenario-production" / "SKILL.md"
CLAUDE_SKILL = ROOT / ".claude" / "skills" / "mica-scenario-production" / "SKILL.md"
REQUIRED_DOCS = (
    DOC_ROOT / "README.md",
    DOC_ROOT / "methodology.md",
    DOC_ROOT / "reproduction.md",
    DOC_ROOT / "agent-production-contract.md",
    DOC_ROOT / "role-prompts.md",
    DOC_ROOT / "candidate-specs.json",
    DOC_ROOT / "manifest.json",
    ROOT / "data" / "kiheon-ideation-pilot-15-summary.json",
)
ARTIFACTS = (
    "source-evidence.jsonl",
    "source-reviews.jsonl",
    "need-observations.jsonl",
    "observation-reviews.jsonl",
    "frozen-observations.jsonl",
    "task-candidates.jsonl",
    "candidate-reviews.jsonl",
    "frozen-candidates.jsonl",
    "comparison.jsonl",
    "measurement-contracts.jsonl",
    "defect-ledger.jsonl",
)
CANDIDATE_FIELDS = {
    "id",
    "label",
    "userRequest",
    "taskAction",
    "canonicalFinalState",
    "confirmationBoundary",
    "prohibitedStates",
    "diagnosticAxes",
    "constraints",
    "unknowns",
    "failureRecoveryEvents",
    "terminationClass",
    "comparisonVerdict",
    "measurementDecision",
    "executionTrack",
    "marketApplicability",
}
LOCAL_PATH_PATTERNS = (
    re.compile(r"/" + r"Users/[^/]+/"),
    re.compile(r"[A-Za-z]:\\Users\\"),
    re.compile(r"\$HOME/(?:vooy|\.codex|\.claude)/"),
)


class CheckError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def load_json(path: Path) -> object:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise CheckError(f"invalid-json:{display_path(path)}:{exc}") from exc


def require(condition: bool, detail: str) -> None:
    if not condition:
        raise CheckError(detail)


def portable_files() -> tuple[Path, ...]:
    return (
        CODEX_SKILL,
        CLAUDE_SKILL,
        ROOT / ".agents" / "skills" / "mica-scenario-production" / "agents" / "openai.yaml",
        DOC_ROOT / "agent-production-contract.md",
        DOC_ROOT / "role-prompts.md",
        ROOT / "scripts" / "mica-scenario-production.py",
    )


def preflight() -> dict[str, object]:
    for path in (*REQUIRED_DOCS, *portable_files()):
        require(path.is_file(), f"missing:{path.relative_to(ROOT)}")

    require(CODEX_SKILL.read_bytes() == CLAUDE_SKILL.read_bytes(), "skill-entrypoint-mismatch")

    manifest = load_json(DOC_ROOT / "manifest.json")
    require(isinstance(manifest, dict), "manifest-not-object")
    entries = manifest.get("files")
    require(isinstance(entries, list), "manifest-files-not-list")
    for entry in entries:
        require(isinstance(entry, dict), "manifest-entry-not-object")
        rel = entry.get("path")
        require(isinstance(rel, str), "manifest-path-not-string")
        path = ROOT / rel
        require(path.is_file(), f"manifest-missing:{rel}")
        require(entry.get("sha256") == sha256(path), f"manifest-sha:{rel}")
        require(entry.get("byteLength") == path.stat().st_size, f"manifest-size:{rel}")

    specs = load_json(DOC_ROOT / "candidate-specs.json")
    require(isinstance(specs, dict), "candidate-specs-not-object")
    candidates = specs.get("candidates")
    require(isinstance(candidates, list) and len(candidates) == 15, "candidate-count-not-15")
    ids: list[str] = []
    for index, candidate in enumerate(candidates, start=1):
        require(isinstance(candidate, dict), f"candidate-{index}-not-object")
        require(set(candidate) == CANDIDATE_FIELDS, f"candidate-{index}-field-shape")
        candidate_id = candidate.get("id")
        require(isinstance(candidate_id, str), f"candidate-{index}-id")
        ids.append(candidate_id)
        require(candidate.get("measurementDecision") == "designable", f"candidate-{index}-not-designable")
    require(len(set(ids)) == 15, "candidate-ids-not-unique")

    summary = load_json(ROOT / "data" / "kiheon-ideation-pilot-15-summary.json")
    require(isinstance(summary, dict), "summary-not-object")
    roadmap = summary.get("roadmap")
    require(isinstance(roadmap, dict), "summary-roadmap-not-object")
    require(roadmap.get("completedMeasurableCandidates") == 15, "summary-completed-not-15")
    require(roadmap.get("remainingMeasurableCandidates") == 85, "summary-remaining-not-85")

    for path in portable_files():
        text = path.read_text(encoding="utf-8")
        for pattern in LOCAL_PATH_PATTERNS:
            require(not pattern.search(text), f"local-path:{path.relative_to(ROOT)}")

    return {
        "status": "pass",
        "skill": "mica-scenario-production",
        "entrypoints": [str(CODEX_SKILL.relative_to(ROOT)), str(CLAUDE_SKILL.relative_to(ROOT))],
        "manifestEntries": len(entries),
        "measurableCandidates": len(candidates),
    }


def batch_manifest(batch_id: str, count: int) -> dict[str, object]:
    return {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.scenario-production-batch/v1",
        "batchId": batch_id,
        "status": "prepared",
        "maxDrafts": count,
        "createdBy": "mica-scenario-production",
        "authorInputs": ["source-evidence.jsonl"],
        "forbiddenAuthorInputs": [
            "existing MICA tasks",
            "docs/kiheon-ideation-pilot-15/candidate-specs.json",
            "prior candidates and comparison results",
            "category quotas and gap hints",
        ],
        "roles": {
            "sourceResearcher": None,
            "sourceReviewer": None,
            "needWriter": None,
            "observationReviewer": None,
            "observationCustodian": None,
            "translator": None,
            "candidateReviewer": None,
            "candidateCustodian": None,
            "comparator": None,
            "measurementAssetAuthor": None,
            "oracleReviewer": None,
            "measurementReviewer": None,
            "controller": None,
        },
        "modelRecord": [],
        "externalActionsAuthorized": False,
    }


def new_batch(batch_id: str, count: int, output: Path | None) -> dict[str, object]:
    require(re.fullmatch(r"[a-z0-9][a-z0-9-]{2,63}", batch_id) is not None, "invalid-batch-id")
    require(1 <= count <= 5, "count-must-be-1-to-5")
    target = output.resolve() if output else ROOT / "work" / "mica-scenario-batches" / batch_id
    require(not target.exists(), f"target-exists:{target}")
    target.mkdir(parents=True)
    (target / "batch-manifest.json").write_text(
        json.dumps(batch_manifest(batch_id, count), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for name in ARTIFACTS:
        (target / name).write_text("", encoding="utf-8")
    (target / "closure.json").write_text(
        json.dumps(
            {
                "origin": "kiheon-ideation",
                "schemaVersion": "mica.scenario-production-closure/v1",
                "batchId": batch_id,
                "status": "open",
                "acceptedMeasurableCandidates": 0,
                "newActionableProcessDefects": [],
                "nextBatchDecision": "hold-until-reviewed",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return {"status": "prepared", "batchId": batch_id, "maxDrafts": count, "path": str(target)}


def parse_jsonl(path: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise CheckError(f"invalid-jsonl:{path.name}:{line_no}:{exc.msg}") from exc
        require(isinstance(value, dict), f"jsonl-row-not-object:{path.name}:{line_no}")
        require(value.get("origin") == "kiheon-ideation", f"wrong-origin:{path.name}:{line_no}")
        rows.append(value)
    return rows


def validate_batch(target: Path) -> dict[str, object]:
    target = target.resolve()
    require(target.is_dir(), f"batch-not-directory:{target}")
    manifest_path = target / "batch-manifest.json"
    closure_path = target / "closure.json"
    require(manifest_path.is_file(), "missing:batch-manifest.json")
    require(closure_path.is_file(), "missing:closure.json")
    manifest = load_json(manifest_path)
    closure = load_json(closure_path)
    require(isinstance(manifest, dict), "batch-manifest-not-object")
    require(isinstance(closure, dict), "closure-not-object")
    require(manifest.get("origin") == "kiheon-ideation", "batch-origin")
    require(closure.get("origin") == "kiheon-ideation", "closure-origin")
    require(manifest.get("batchId") == closure.get("batchId"), "batch-id-mismatch")
    count = manifest.get("maxDrafts")
    require(isinstance(count, int) and 1 <= count <= 5, "batch-max-drafts")
    row_counts: dict[str, int] = {}
    for name in ARTIFACTS:
        path = target / name
        require(path.is_file(), f"missing:{name}")
        row_counts[name] = len(parse_jsonl(path))
    for name in ("need-observations.jsonl", "task-candidates.jsonl", "frozen-candidates.jsonl"):
        require(row_counts[name] <= count, f"row-count-over-max:{name}")
    if manifest.get("status") == "completed":
        roles = manifest.get("roles")
        require(isinstance(roles, dict), "completed-roles-not-object")
        role_ids = list(roles.values())
        require(all(isinstance(value, str) and value.strip() for value in role_ids), "completed-role-unassigned")
        require(len(role_ids) == len(set(role_ids)), "completed-role-collision")
        require(closure.get("status") in {"completed", "zero-accepted"}, "completed-closure-status")
        accepted = closure.get("acceptedMeasurableCandidates")
        require(isinstance(accepted, int), "completed-accepted-count")
        require(accepted == row_counts["measurement-contracts.jsonl"], "completed-measurement-count")
    return {
        "status": "pass",
        "batchId": manifest.get("batchId"),
        "batchStatus": manifest.get("status"),
        "rows": row_counts,
    }


def print_result(result: dict[str, object], as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        details = " ".join(f"{key}={value}" for key, value in result.items() if key != "status")
        print(f"PASS {details}".rstrip())


def main() -> int:
    parser = argparse.ArgumentParser(description="Portable MICA scenario production helper")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("preflight")
    new = subparsers.add_parser("new-batch")
    new.add_argument("--batch-id", required=True)
    new.add_argument("--count", type=int, default=5)
    new.add_argument("--output", type=Path)
    validate = subparsers.add_parser("validate-batch")
    validate.add_argument("path", type=Path)
    args = parser.parse_args()
    try:
        if args.command == "preflight":
            result = preflight()
        elif args.command == "new-batch":
            result = new_batch(args.batch_id, args.count, args.output)
        else:
            result = validate_batch(args.path)
    except CheckError as exc:
        if args.json:
            print(json.dumps({"status": "fail", "detail": str(exc)}, ensure_ascii=False))
        else:
            print(f"FAIL {exc}")
        return 1
    print_result(result, args.json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
