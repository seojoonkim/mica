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
EXPOSURE_ARTIFACTS = (
    "agent-visible.jsonl",
    "blind-agent-rehearsal.jsonl",
)
V4_SCHEMA = "mica.scenario-production-batch/v4"
AGENT_VISIBLE_FIELDS = {
    "origin",
    "schemaVersion",
    "batchId",
    "candidateId",
    "userRequest",
    "userKnownConstraints",
    "commonSafetyPolicy",
    "allowedTools",
    "preparedByContextId",
}
BLIND_REHEARSAL_FIELDS = {
    "origin",
    "schemaVersion",
    "batchId",
    "candidateId",
    "agentVisibleRowSha256",
    "rehearsalContextId",
    "requestUnderstood",
    "successOrSafeHandoffReachable",
    "hiddenInformationRequired",
    "implementationSequenceForced",
    "hiddenPathAccessible",
    "verdict",
    "notes",
    "reviewedAt",
}
PUBLIC_LEAK_PATTERNS = (
    re.compile(
        r"(?<![A-Za-z0-9_])(?:canonicalFinalState|confirmationBoundary|prohibitedStates|"
        r"failureRecoveryEvents|fixtureRefs?|resetRef|attemptEligibilityRef|"
        r"oracleRef|binaryOracle|measurementDecision)(?![A-Za-z0-9_])",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?<![A-Za-z0-9_])(?:token[ -]?registry|probe[ -]?id|event[ -]?id|tick[ -]?formula|"
        r"fixture[ -]?id|variant[ -]?id)(?![A-Za-z0-9_])",
        re.IGNORECASE,
    ),
    re.compile(r"(?<![A-Za-z0-9_])(?:EXP|EV|PROBE|EVENT|TOKEN|FIXTURE|VARIANT)-[A-Za-z0-9_-]+(?![A-Za-z0-9_])"),
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
        "roleContexts": "15개 역할 경계, 동시 실행은 최대 3개",
        "maxConcurrentContexts": 3,
        "reasoning": "의미 역할 전반에 high/xhigh 중심",
        "methodologyPath": "docs/kiheon-ideation-pilot-15/methodology.md",
        "methodRevision": "standard-v1.3",
        "recommendedWhen": "첫 재현, 방법론 변경, 고위험 과업, 반복 결함 또는 판정 충돌",
    },
    "lean": {
        "label": "Lean v1",
        "maxDrafts": 3,
        "estimatedHours": "3–5",
        "roleContexts": "15개 역할 경계, 정형 단계는 저비용 컨텍스트",
        "maxConcurrentContexts": 2,
        "reasoning": "정형 작업 medium, 의미 작업 high, 예외만 xhigh 이상",
        "methodologyPath": "docs/kiheon-ideation-pilot-15/methodology-lean-v1.md",
        "methodRevision": "lean-v1.2-b5",
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


def artifacts_for_manifest(manifest: dict[str, object]) -> tuple[str, ...]:
    if manifest.get("schemaVersion") == V4_SCHEMA:
        return (*ARTIFACTS, *EXPOSURE_ARTIFACTS)
    return ARTIFACTS


def batch_manifest(batch_id: str, count: int, profile: str) -> dict[str, object]:
    config = profile_config(profile)
    return {
        "origin": "kiheon-ideation",
        "schemaVersion": V4_SCHEMA,
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
            "exposurePreparer": ["frozen-candidates.jsonl", "agent-production-contract.md"],
            "blindAgentRehearsal": ["agent-visible.jsonl"],
            "measurementReviewer": [
                "frozen-candidates.jsonl",
                "comparison.jsonl",
                "measurement-contracts.jsonl",
                "blind-agent-rehearsal.jsonl",
            ],
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
            "exposurePreparer": None,
            "blindAgentRehearsal": None,
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
    manifest = batch_manifest(batch_id, selected_count, profile)
    (target / "batch-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for name in artifacts_for_manifest(manifest):
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


def empty_batch_rows(target: Path, manifest: dict[str, object]) -> dict[str, int]:
    row_counts: dict[str, int] = {}
    for name in artifacts_for_manifest(manifest):
        path = target / name
        require(path.is_file(), f"missing:{name}")
        row_counts[name] = len(parse_jsonl(path))
    return row_counts


def validate_method_lock(manifest: dict[str, object], require_current_files: bool) -> dict[str, object]:
    profile = manifest.get("productionProfile")
    require(isinstance(profile, str), "method-lock-profile")
    profile_config(profile)
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
    revision = manifest.get("methodRevision")
    require(isinstance(revision, str) and revision.strip(), "method-revision-manifest")
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
    require(all(count == 0 for count in empty_batch_rows(target, manifest).values()), "batch-not-empty")
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
    if manifest.get("schemaVersion") != V4_SCHEMA:
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


def parse_jsonl_with_hash(path: Path) -> list[tuple[dict[str, object], str]]:
    rows: list[tuple[dict[str, object], str]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not raw.strip():
            continue
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise CheckError(f"invalid-jsonl:{path.name}:{line_no}:{exc.msg}") from exc
        require(isinstance(value, dict), f"jsonl-row-not-object:{path.name}:{line_no}")
        require(value.get("origin") == "kiheon-ideation", f"wrong-origin:{path.name}:{line_no}")
        rows.append((value, hashlib.sha256(raw.encode("utf-8")).hexdigest()))
    return rows


def require_string_list(value: object, detail: str, allow_empty: bool = False) -> None:
    require(isinstance(value, list), detail)
    require(allow_empty or len(value) > 0, detail)
    require(all(isinstance(item, str) and item.strip() for item in value), detail)


def validate_timestamp(value: object, detail: str) -> None:
    require(isinstance(value, str), detail)
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError as exc:
        raise CheckError(detail) from exc
    require(parsed.tzinfo is not None, detail)


def validate_exposure(target: Path, require_complete: bool = True) -> dict[str, object]:
    target = target.resolve()
    require(target.is_dir(), f"batch-not-directory:{target}")
    manifest = load_json(target / "batch-manifest.json")
    require(isinstance(manifest, dict), "batch-manifest-not-object")
    require(manifest.get("schemaVersion") == V4_SCHEMA, "exposure-requires-batch-v4")
    batch_id = manifest.get("batchId")
    require(isinstance(batch_id, str), "batch-id")

    public_path = target / "agent-visible.jsonl"
    rehearsal_path = target / "blind-agent-rehearsal.jsonl"
    measurement_path = target / "measurement-contracts.jsonl"
    for path in (public_path, rehearsal_path, measurement_path):
        require(path.is_file(), f"missing:{path.name}")

    measurement_rows = parse_jsonl(measurement_path)
    measurement_by_id: dict[str, dict[str, object]] = {}
    for index, row in enumerate(measurement_rows, start=1):
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id.strip(), f"measurement-candidate-id:{index}")
        require(candidate_id not in measurement_by_id, f"measurement-candidate-duplicate:{candidate_id}")
        measurement_by_id[candidate_id] = row

    public_by_id: dict[str, tuple[dict[str, object], str]] = {}
    for index, (row, raw_sha) in enumerate(parse_jsonl_with_hash(public_path), start=1):
        require(set(row) == AGENT_VISIBLE_FIELDS, f"agent-visible-shape:{index}")
        require(row.get("schemaVersion") == "mica.agent-visible/v1", f"agent-visible-schema:{index}")
        require(row.get("batchId") == batch_id, f"agent-visible-batch:{index}")
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id.strip(), f"agent-visible-candidate:{index}")
        require(candidate_id not in public_by_id, f"agent-visible-duplicate:{candidate_id}")
        require(candidate_id in measurement_by_id, f"agent-visible-without-measurement:{candidate_id}")
        require(isinstance(row.get("userRequest"), str) and row["userRequest"].strip(), f"agent-visible-request:{index}")
        require_string_list(row.get("userKnownConstraints"), f"agent-visible-constraints:{index}", allow_empty=True)
        require_string_list(row.get("commonSafetyPolicy"), f"agent-visible-safety:{index}")
        require_string_list(row.get("allowedTools"), f"agent-visible-tools:{index}")
        require(
            isinstance(row.get("preparedByContextId"), str) and row["preparedByContextId"].strip(),
            f"agent-visible-preparer:{index}",
        )
        public_text = json.dumps(row, ensure_ascii=False, sort_keys=True)
        for pattern in PUBLIC_LEAK_PATTERNS:
            require(pattern.search(public_text) is None, f"agent-visible-leak:{candidate_id}:{pattern.pattern}")
        public_by_id[candidate_id] = (row, raw_sha)

    rehearsal_by_id: dict[str, dict[str, object]] = {}
    for index, row in enumerate(parse_jsonl(rehearsal_path), start=1):
        require(set(row) == BLIND_REHEARSAL_FIELDS, f"blind-rehearsal-shape:{index}")
        require(row.get("schemaVersion") == "mica.blind-agent-rehearsal/v1", f"blind-rehearsal-schema:{index}")
        require(row.get("batchId") == batch_id, f"blind-rehearsal-batch:{index}")
        candidate_id = row.get("candidateId")
        require(isinstance(candidate_id, str) and candidate_id.strip(), f"blind-rehearsal-candidate:{index}")
        require(candidate_id not in rehearsal_by_id, f"blind-rehearsal-duplicate:{candidate_id}")
        require(candidate_id in public_by_id, f"blind-rehearsal-without-agent-visible:{candidate_id}")
        require(
            row.get("agentVisibleRowSha256") == public_by_id[candidate_id][1],
            f"blind-rehearsal-agent-visible-sha:{candidate_id}",
        )
        require(
            isinstance(row.get("rehearsalContextId"), str) and row["rehearsalContextId"].strip(),
            f"blind-rehearsal-context:{index}",
        )
        for field in (
            "requestUnderstood",
            "successOrSafeHandoffReachable",
            "hiddenInformationRequired",
            "implementationSequenceForced",
            "hiddenPathAccessible",
        ):
            require(type(row.get(field)) is bool, f"blind-rehearsal-boolean:{candidate_id}:{field}")
        expected_pass = (
            row["requestUnderstood"]
            and row["successOrSafeHandoffReachable"]
            and not row["hiddenInformationRequired"]
            and not row["implementationSequenceForced"]
            and not row["hiddenPathAccessible"]
        )
        require(row.get("verdict") in {"pass", "reject"}, f"blind-rehearsal-verdict:{candidate_id}")
        require((row["verdict"] == "pass") == expected_pass, f"blind-rehearsal-verdict-mismatch:{candidate_id}")
        require(isinstance(row.get("notes"), str) and row["notes"].strip(), f"blind-rehearsal-notes:{candidate_id}")
        validate_timestamp(row.get("reviewedAt"), f"blind-rehearsal-time:{candidate_id}")
        rehearsal_by_id[candidate_id] = row

    roles = manifest.get("roles")
    if isinstance(roles, dict):
        preparer = roles.get("exposurePreparer")
        rehearsal_context = roles.get("blindAgentRehearsal")
        if isinstance(preparer, str):
            require(
                all(row[0].get("preparedByContextId") == preparer for row in public_by_id.values()),
                "agent-visible-role-mismatch",
            )
        if isinstance(rehearsal_context, str):
            require(
                all(row.get("rehearsalContextId") == rehearsal_context for row in rehearsal_by_id.values()),
                "blind-rehearsal-role-mismatch",
            )

    if require_complete:
        measurement_ids = set(measurement_by_id)
        require(set(public_by_id) == measurement_ids, "agent-visible-candidate-set")
        require(set(rehearsal_by_id) == measurement_ids, "blind-rehearsal-candidate-set")
        require(all(row.get("verdict") == "pass" for row in rehearsal_by_id.values()), "blind-rehearsal-not-all-pass")
        require(isinstance(roles, dict), "exposure-roles-not-object")
        boundary_roles = [roles.get(name) for name in ("exposurePreparer", "blindAgentRehearsal", "measurementReviewer")]
        require(
            all(isinstance(value, str) and value.strip() for value in boundary_roles),
            "exposure-role-unassigned",
        )
        require(len(set(boundary_roles)) == len(boundary_roles), "exposure-role-collision")
        require(
            all(row.get("measurementReviewerContextId") == boundary_roles[2] for row in measurement_by_id.values()),
            "measurement-reviewer-role-mismatch",
        )
        require(
            all(row.get("measurementDecision") == "designable" for row in measurement_by_id.values()),
            "measurement-not-designable-after-exposure",
        )

    return {
        "status": "pass",
        "batchId": batch_id,
        "agentVisible": len(public_by_id),
        "rehearsed": len(rehearsal_by_id),
        "rehearsalPassed": sum(row.get("verdict") == "pass" for row in rehearsal_by_id.values()),
        "complete": require_complete,
    }


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
    if schema_version == V4_SCHEMA:
        if manifest.get("status") == "prepared-unlocked":
            require(manifest.get("methodRevision") == config["methodRevision"], "v4-method-revision")
        expected_manifest = batch_manifest(str(manifest.get("batchId")), count, str(profile))
        roles = manifest.get("roles")
        allowlist = manifest.get("roleInputAllowlist")
        require(isinstance(roles, dict), "v4-roles-not-object")
        require(set(roles) == set(expected_manifest["roles"]), "v4-role-shape")
        require(isinstance(allowlist, dict), "v4-role-allowlist-not-object")
        require(set(allowlist) == set(expected_manifest["roleInputAllowlist"]), "v4-role-allowlist-shape")
        require(allowlist.get("blindAgentRehearsal") == ["agent-visible.jsonl"], "v4-blind-input-boundary")
    if schema_version in {"mica.scenario-production-batch/v3", V4_SCHEMA}:
        require(manifest.get("status") != "prepared-unlocked" or manifest.get("methodLock") is None, "unlocked-batch-has-lock")
        if manifest.get("status") != "prepared-unlocked":
            method_lock = validate_method_lock(manifest, require_current_files=False)
    row_counts = empty_batch_rows(target, manifest)
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
        if schema_version == V4_SCHEMA:
            exposure = validate_exposure(target, require_complete=True)
            require(accepted == exposure["rehearsalPassed"], "completed-exposure-count")
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
    if manifest.get("schemaVersion") in {"mica.scenario-production-batch/v3", V4_SCHEMA}:
        validate_method_lock(manifest, require_current_files=True)
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
    exposure = subparsers.add_parser("validate-exposure")
    exposure.add_argument("path", type=Path)
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
        elif args.command == "validate-exposure":
            result = validate_exposure(args.path)
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
