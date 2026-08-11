#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOC_ROOT = ROOT / "docs" / "kiheon-ideation-pilot-15"
CODEX_SKILL = ROOT / ".agents" / "skills" / "mica-scenario-production" / "SKILL.md"
CLAUDE_SKILL = ROOT / ".claude" / "skills" / "mica-scenario-production" / "SKILL.md"
OPERATING_MODEL = DOC_ROOT / "codex-claude-operating-model.md"
TEST_SCRIPT = ROOT / "scripts" / "test-mica-scenario-production.py"
REQUIRED_DOCS = (
    DOC_ROOT / "README.md",
    DOC_ROOT / "methodology.md",
    DOC_ROOT / "methodology-lean-v1.md",
    DOC_ROOT / "reproduction.md",
    DOC_ROOT / "agent-production-contract.md",
    DOC_ROOT / "role-prompts.md",
    OPERATING_MODEL,
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
PRODUCTION_PROFILES: dict[str, dict[str, object]] = {
    "standard": {
        "label": "표준",
        "maxDrafts": 5,
        "estimatedHours": "6–12",
        "roleContexts": "8–12개의 분리된 역할 실행",
        "maxConcurrentContexts": 3,
        "reasoning": "의미 역할 전반에 high/xhigh 중심",
        "methodologyPath": "docs/kiheon-ideation-pilot-15/methodology.md",
        "methodRevision": "standard-v1.1-b4",
        "recommendedWhen": "첫 재현, 방법론 변경, 고위험 과업, 반복 결함 또는 판정 충돌",
    },
    "lean": {
        "label": "Lean v1",
        "maxDrafts": 3,
        "estimatedHours": "3–5",
        "roleContexts": "독립 의미 역할은 유지하고 최대 2개만 동시 실행",
        "maxConcurrentContexts": 2,
        "reasoning": "정형 작업 medium, 의미 작업 high, 예외만 xhigh 이상",
        "methodologyPath": "docs/kiheon-ideation-pilot-15/methodology-lean-v1.md",
        "methodRevision": "lean-v1.1-b4",
        "recommendedWhen": "계약과 도구가 안정적이며 빠른 중간 공유가 필요한 후속 배치",
    },
}
COMMON_METHOD_FILES = (
    ".agents/skills/mica-scenario-production/SKILL.md",
    ".claude/skills/mica-scenario-production/SKILL.md",
    "docs/kiheon-ideation-pilot-15/reproduction.md",
    "docs/kiheon-ideation-pilot-15/agent-production-contract.md",
    "docs/kiheon-ideation-pilot-15/role-prompts.md",
    "docs/kiheon-ideation-pilot-15/codex-claude-operating-model.md",
    "scripts/mica-scenario-production.py",
    "scripts/test-mica-scenario-production.py",
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


def git(*args: str) -> bytes:
    try:
        return subprocess.run(
            ("git", *args),
            cwd=ROOT,
            check=True,
            capture_output=True,
        ).stdout
    except (OSError, subprocess.CalledProcessError) as exc:
        raise CheckError(f"git:{' '.join(args)}") from exc


def method_files(profile: str) -> tuple[str, ...]:
    profile_config(profile)
    profile_docs = (
        "docs/kiheon-ideation-pilot-15/methodology.md",
        "docs/kiheon-ideation-pilot-15/methodology-lean-v1.md",
    )
    if profile == "standard":
        profile_docs = profile_docs[:1]
    return (*profile_docs, *COMMON_METHOD_FILES)


def git_head() -> str:
    head = git("rev-parse", "HEAD").decode("ascii").strip()
    require(re.fullmatch(r"[0-9a-f]{40}", head) is not None, "git-head")
    return head


def git_file_bytes(commit_sha: str, relative_path: str) -> bytes:
    return git("show", f"{commit_sha}:{relative_path}")


def portable_files() -> tuple[Path, ...]:
    return (
        CODEX_SKILL,
        CLAUDE_SKILL,
        ROOT / ".agents" / "skills" / "mica-scenario-production" / "agents" / "openai.yaml",
        DOC_ROOT / "methodology-lean-v1.md",
        DOC_ROOT / "agent-production-contract.md",
        DOC_ROOT / "role-prompts.md",
        ROOT / "scripts" / "mica-scenario-production.py",
        TEST_SCRIPT,
        OPERATING_MODEL,
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
        "selectionRequired": True,
        "profiles": list(PRODUCTION_PROFILES),
        "entrypoints": [str(CODEX_SKILL.relative_to(ROOT)), str(CLAUDE_SKILL.relative_to(ROOT))],
        "manifestEntries": len(entries),
        "measurableCandidates": len(candidates),
    }


def profile_catalog() -> dict[str, object]:
    profiles = []
    for profile_id, config in PRODUCTION_PROFILES.items():
        profiles.append({"id": profile_id, **config})
    return {
        "status": "pass",
        "selectionRequired": True,
        "profiles": profiles,
        "next": "new-batch --profile <standard|lean> --batch-id <batch-id>, then lock-method <batch-path>",
    }


def profile_config(profile: str) -> dict[str, object]:
    config = PRODUCTION_PROFILES.get(profile)
    require(config is not None, "profile-must-be-standard-or-lean")
    return config


def batch_manifest(batch_id: str, count: int, profile: str) -> dict[str, object]:
    config = profile_config(profile)
    return {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.scenario-production-batch/v3",
        "batchId": batch_id,
        "status": "prepared-unlocked",
        "productionProfile": profile,
        "methodologyPath": config["methodologyPath"],
        "methodRevision": config["methodRevision"],
        "methodLock": None,
        "resourceEstimate": {
            "estimatedHours": config["estimatedHours"],
            "roleContexts": config["roleContexts"],
            "maxConcurrentContexts": config["maxConcurrentContexts"],
            "reasoning": config["reasoning"],
        },
        "maxDrafts": count,
        "createdBy": "mica-scenario-production",
        "leanV1": {
            "defaultBatchSize": 3,
            "escalatedBatchSize": 5,
            "maxConcurrentContexts": 2,
            "orderDependentStagesSequential": True,
            "semanticReReviewFocus": "new, changed, and high-risk items; mechanical checks always full",
        },
        "authorInputs": ["source-evidence.jsonl"],
        "forbiddenAuthorInputs": [
            "existing MICA tasks",
            "docs/kiheon-ideation-pilot-15/candidate-specs.json",
            "prior candidates and comparison results",
            "category quotas and gap hints",
        ],
        "roleInputAllowlist": {
            "sourceResearcher": ["controller-assigned research scope", "independent primary sources"],
            "sourceReviewer": ["source-evidence.jsonl", "cited primary source locations"],
            "needWriter": ["accepted rows of source-evidence.jsonl"],
            "observationReviewer": ["need-observations.jsonl", "accepted source-evidence.jsonl rows", "agent-production-contract.md"],
            "observationCustodian": ["need-observations.jsonl", "observation-reviews.jsonl"],
            "translator": ["frozen-observations.jsonl", "task candidate base fields in agent-production-contract.md"],
            "candidateReviewer": ["frozen-observations.jsonl", "task-candidates.jsonl", "agent-production-contract.md"],
            "candidateCustodian": ["task-candidates.jsonl", "candidate-reviews.jsonl"],
            "comparator": ["frozen-candidates.jsonl", "docs/kiheon-ideation-pilot-15/candidate-specs.json", "existing MICA task catalogue"],
            "measurementAssetAuthor": ["frozen-candidates.jsonl", "comparison.jsonl"],
            "oracleReviewer": ["frozen-candidates.jsonl", "fixture, reset, and eligibility assets"],
            "measurementReviewer": ["frozen-candidates.jsonl", "comparison.jsonl", "measurement-contracts.jsonl"],
            "controller": ["all batch artifacts read-only", "defect-ledger.jsonl", "closure.json"],
        },
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


def new_batch(batch_id: str, profile: str, count: int | None, output: Path | None) -> dict[str, object]:
    require(re.fullmatch(r"[a-z0-9][a-z0-9-]{2,63}", batch_id) is not None, "invalid-batch-id")
    config = profile_config(profile)
    max_drafts = config["maxDrafts"]
    require(isinstance(max_drafts, int), "profile-max-drafts")
    selected_count = max_drafts if count is None else count
    require(1 <= selected_count <= max_drafts, f"count-must-be-1-to-{max_drafts}-for-{profile}")
    target = output.resolve() if output else ROOT / "work" / "mica-scenario-batches" / batch_id
    require(not target.exists(), f"target-exists:{target}")
    target.mkdir(parents=True)
    (target / "batch-manifest.json").write_text(
        json.dumps(batch_manifest(batch_id, selected_count, profile), ensure_ascii=False, indent=2) + "\n",
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
                "productionProfile": profile,
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
    return {
        "status": "prepared-unlocked",
        "batchId": batch_id,
        "productionProfile": profile,
        "estimatedHours": config["estimatedHours"],
        "maxDrafts": selected_count,
        "path": str(target),
    }


def empty_batch_rows(target: Path) -> dict[str, int]:
    row_counts: dict[str, int] = {}
    for name in ARTIFACTS:
        path = target / name
        require(path.is_file(), f"missing:{name}")
        row_counts[name] = len(parse_jsonl(path))
    return row_counts


def validate_method_lock(manifest: dict[str, object], require_current_files: bool) -> dict[str, object]:
    profile = manifest.get("productionProfile")
    require(isinstance(profile, str), "method-lock-profile")
    config = profile_config(profile)
    lock = manifest.get("methodLock")
    require(isinstance(lock, dict), "method-lock-missing")
    require(
        set(lock) == {"schemaVersion", "revision", "sourceCommitSha", "sourceFiles", "lockedAt"},
        "method-lock-shape",
    )
    require(lock.get("schemaVersion") == "mica.scenario-production-method-lock/v1", "method-lock-schema")
    locked_at = lock.get("lockedAt")
    require(isinstance(locked_at, str), "method-lock-time")
    try:
        parsed_locked_at = datetime.fromisoformat(locked_at)
    except ValueError as exc:
        raise CheckError("method-lock-time") from exc
    require(parsed_locked_at.tzinfo is not None, "method-lock-timezone")
    revision = config["methodRevision"]
    require(manifest.get("methodRevision") == revision, "method-revision-manifest")
    require(lock.get("revision") == revision, "method-revision-lock")
    commit_sha = lock.get("sourceCommitSha")
    require(isinstance(commit_sha, str) and re.fullmatch(r"[0-9a-f]{40}", commit_sha) is not None, "method-lock-commit")
    source_files = lock.get("sourceFiles")
    require(isinstance(source_files, list), "method-lock-files")
    expected_paths = method_files(profile)
    require(len(source_files) == len(expected_paths), "method-lock-file-count")
    for index, (entry, relative_path) in enumerate(zip(source_files, expected_paths), start=1):
        require(isinstance(entry, dict), f"method-lock-file-{index}")
        require(set(entry) == {"path", "sha256"}, f"method-lock-file-shape-{index}")
        require(entry.get("path") == relative_path, f"method-lock-file-path-{index}")
        expected_sha = hashlib.sha256(git_file_bytes(commit_sha, relative_path)).hexdigest()
        require(entry.get("sha256") == expected_sha, f"method-lock-file-sha-{index}")
        if require_current_files:
            current = ROOT / relative_path
            require(current.is_file(), f"method-current-missing:{relative_path}")
            require(sha256(current) == expected_sha, f"method-current-drift:{relative_path}")
    return {"revision": revision, "sourceCommitSha": commit_sha}


def lock_method(target: Path) -> dict[str, object]:
    target = target.resolve()
    require(target.is_dir(), f"batch-not-directory:{target}")
    validate_batch(target)
    manifest_path = target / "batch-manifest.json"
    closure_path = target / "closure.json"
    require(manifest_path.is_file(), "missing:batch-manifest.json")
    require(closure_path.is_file(), "missing:closure.json")
    manifest = load_json(manifest_path)
    closure = load_json(closure_path)
    require(isinstance(manifest, dict), "batch-manifest-not-object")
    require(isinstance(closure, dict), "closure-not-object")
    require(manifest.get("status") in {"prepared", "prepared-unlocked"}, "batch-not-lockable")
    require(closure.get("status") == "open", "closure-not-open")
    require(closure.get("acceptedMeasurableCandidates") == 0, "closure-not-zero")
    require(all(count == 0 for count in empty_batch_rows(target).values()), "batch-not-empty")
    profile = manifest.get("productionProfile")
    require(isinstance(profile, str), "batch-profile")
    config = profile_config(profile)
    head = git_head()
    source_files: list[dict[str, str]] = []
    for relative_path in method_files(profile):
        path = ROOT / relative_path
        require(path.is_file(), f"method-current-missing:{relative_path}")
        committed = git_file_bytes(head, relative_path)
        require(path.read_bytes() == committed, f"method-uncommitted:{relative_path}")
        source_files.append({"path": relative_path, "sha256": hashlib.sha256(committed).hexdigest()})
    manifest["schemaVersion"] = "mica.scenario-production-batch/v3"
    manifest["status"] = "prepared-locked"
    manifest["methodRevision"] = config["methodRevision"]
    manifest["methodLock"] = {
        "schemaVersion": "mica.scenario-production-method-lock/v1",
        "revision": config["methodRevision"],
        "sourceCommitSha": head,
        "sourceFiles": source_files,
        "lockedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {
        "status": "prepared-locked",
        "batchId": manifest.get("batchId"),
        "methodRevision": config["methodRevision"],
        "sourceCommitSha": head,
        "methodFiles": len(source_files),
    }


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
    profile = manifest.get("productionProfile")
    if profile is None and manifest.get("schemaVersion") == "mica.scenario-production-batch/v1":
        profile = "legacy-v1"
        config: dict[str, object] = {"maxDrafts": 5}
        require(closure.get("productionProfile") is None, "legacy-batch-profile-mismatch")
    else:
        require(isinstance(profile, str), "batch-profile")
        config = profile_config(profile)
        require(closure.get("productionProfile") == profile, "batch-profile-mismatch")
    count = manifest.get("maxDrafts")
    max_drafts = config["maxDrafts"]
    require(isinstance(max_drafts, int), "profile-max-drafts")
    require(isinstance(count, int) and 1 <= count <= max_drafts, "batch-max-drafts")
    schema_version = manifest.get("schemaVersion")
    method_lock: dict[str, object] | None = None
    if schema_version == "mica.scenario-production-batch/v3":
        require(manifest.get("status") != "prepared-unlocked" or manifest.get("methodLock") is None, "unlocked-batch-has-lock")
        if manifest.get("status") != "prepared-unlocked":
            method_lock = validate_method_lock(
                manifest,
                require_current_files=manifest.get("status") in {"prepared-locked", "in-progress"},
            )
    row_counts = empty_batch_rows(target)
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
        "productionProfile": profile,
        "batchStatus": manifest.get("status"),
        "rows": row_counts,
        "methodLock": method_lock,
    }


def validate_ready(target: Path) -> dict[str, object]:
    result = validate_batch(target)
    require(result.get("batchStatus") == "prepared-locked", "batch-not-prepared-locked")
    rows = result.get("rows")
    require(isinstance(rows, dict) and all(value == 0 for value in rows.values()), "ready-batch-not-empty")
    closure = load_json(target.resolve() / "closure.json")
    require(isinstance(closure, dict) and closure.get("status") == "open", "ready-closure-not-open")
    manifest = load_json(target.resolve() / "batch-manifest.json")
    require(isinstance(manifest, dict), "batch-manifest-not-object")
    roles = manifest.get("roles")
    require(isinstance(roles, dict) and all(value is None for value in roles.values()), "ready-role-already-assigned")
    result["readyForProduction"] = True
    return result


def print_result(result: dict[str, object], as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    profiles = result.get("profiles")
    if isinstance(profiles, list) and profiles and isinstance(profiles[0], dict):
        print("PASS selectionRequired=true")
        for profile in profiles:
            print(
                "PROFILE "
                f"{profile['id']} label={profile['label']} "
                f"maxDrafts={profile['maxDrafts']} estimatedHours={profile['estimatedHours']} "
                f"roleContexts={profile['roleContexts']} "
                f"maxConcurrentContexts={profile['maxConcurrentContexts']} "
                f"reasoning={profile['reasoning']} recommendedWhen={profile['recommendedWhen']}"
            )
        print(f"NEXT {result['next']}")
        return
    details = " ".join(f"{key}={value}" for key, value in result.items() if key != "status")
    print(f"PASS {details}".rstrip())


def main() -> int:
    parser = argparse.ArgumentParser(description="Portable MICA scenario production helper")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("preflight")
    subparsers.add_parser("profiles")
    new = subparsers.add_parser("new-batch")
    new.add_argument("--batch-id", required=True)
    new.add_argument("--profile", choices=tuple(PRODUCTION_PROFILES), required=True)
    new.add_argument("--count", type=int)
    new.add_argument("--output", type=Path)
    validate = subparsers.add_parser("validate-batch")
    validate.add_argument("path", type=Path)
    lock = subparsers.add_parser("lock-method")
    lock.add_argument("path", type=Path)
    ready = subparsers.add_parser("validate-ready")
    ready.add_argument("path", type=Path)
    args = parser.parse_args()
    try:
        if args.command == "preflight":
            result = preflight()
        elif args.command == "profiles":
            result = profile_catalog()
        elif args.command == "new-batch":
            result = new_batch(args.batch_id, args.profile, args.count, args.output)
        elif args.command == "validate-batch":
            result = validate_batch(args.path)
        elif args.command == "lock-method":
            result = lock_method(args.path)
        else:
            result = validate_ready(args.path)
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
