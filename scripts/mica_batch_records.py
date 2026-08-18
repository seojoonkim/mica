# /// script
# requires-python = ">=3.9"
# ///
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from mica_batch_control import (
    STATE_FILE,
    JsonObject,
    JsonValue,
    _active_owner,
    _array,
    _manifest,
    _now,
    _object,
    _require,
    _sha256,
    _stamp,
    _state,
    _write_object,
    validate_controller_state,
)


def _artifact(target: Path, relative_path: str) -> Path:
    _require(
        bool(relative_path) and not Path(relative_path).is_absolute(),
        "artifact-relative-path",
    )
    candidate = (target / relative_path).resolve()
    _require(
        candidate != target and target in candidate.parents, "artifact-path-boundary"
    )
    _require(
        candidate.is_file() and candidate.name != STATE_FILE,
        f"artifact-missing:{relative_path}",
    )
    return candidate


def _mtime(path: Path) -> datetime:
    return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc)


def _upsert_ledger(
    manifest: JsonObject,
    target: Path,
    artifact_paths: list[str],
    role_context_id: str,
    observed_at: str,
) -> list[JsonObject]:
    raw_ledger = manifest.get("artifactShaLedger")
    ledger = [] if raw_ledger is None else _array(raw_ledger, "artifact-ledger")
    retained: list[JsonObject] = []
    for row_value in ledger:
        row = _object(row_value, "artifact-ledger-row")
        if row.get("path") not in artifact_paths:
            retained.append(row)
    additions: list[JsonObject] = []
    for relative_path in artifact_paths:
        path = _artifact(target, relative_path)
        additions.append(
            {
                "path": relative_path,
                "sha256": _sha256(path),
                "closedBy": role_context_id,
                "verifiedByController": True,
                "at": _stamp(_mtime(path)),
                "observedAt": observed_at,
                "timeSource": "filesystem-mtime-observed-by-controller-tool",
            }
        )
    updated_ledger: list[JsonValue] = []
    updated_ledger.extend(retained)
    updated_ledger.extend(additions)
    manifest["artifactShaLedger"] = updated_ledger
    return additions


def _upsert_model_record(
    manifest: JsonObject,
    role: str,
    role_context_id: str,
    model: str,
    effort_class: str,
    tools_summary: str,
    completed_at: str,
) -> None:
    raw_records = _array(manifest.get("modelRecord"), "model-record")
    retained: list[JsonValue] = []
    for row_value in raw_records:
        row = _object(row_value, "model-record-row")
        if row.get("role") != role or row.get("contextId") != role_context_id:
            retained.append(row)
    record: JsonObject = {
        "role": role,
        "model": model,
        "effortClass": effort_class,
        "tools": tools_summary,
        "contextId": role_context_id,
        "executedAt": completed_at,
        "timeSource": "latest-artifact-filesystem-mtime",
    }
    retained.append(record)
    manifest["modelRecord"] = retained


def complete_role(
    target: Path,
    controller_id: str,
    session_id: str,
    role: str,
    role_context_id: str,
    model: str,
    effort_class: str,
    tools_summary: str,
    artifact_paths: list[str],
    write_authorization_token: str | None,
) -> JsonObject:
    resolved = target.resolve()
    _require(
        bool(artifact_paths) and len(set(artifact_paths)) == len(artifact_paths),
        "role-artifacts",
    )
    manifest = _manifest(resolved)
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    claims = _object(state.get("roleClaims"), "controller-role-claims")
    claim = _object(claims.get(role), f"role-not-claimed:{role}")
    _require(claim.get("contextId") == role_context_id, f"role-not-claimed:{role}")
    completions = _object(state.get("roleCompletions"), "controller-role-completions")
    _require(role not in completions, f"role-already-completed:{role}")
    if manifest.get("methodRevision") == "standard-v1.3.4":
        _require(
            claim.get("generation") == state.get("generation"),
            f"role-authorization-stale-generation:{role}",
        )
        _require(
            isinstance(write_authorization_token, str)
            and write_authorization_token == claim.get("writeAuthorizationToken"),
            f"role-authorization-token:{role}",
        )
    observed_at = _stamp(_now())
    additions = _upsert_ledger(
        manifest, resolved, artifact_paths, role_context_id, observed_at
    )
    completed_at = max(str(row["at"]) for row in additions)
    _upsert_model_record(
        manifest,
        role,
        role_context_id,
        model,
        effort_class,
        tools_summary,
        completed_at,
    )
    artifact_values: list[JsonValue] = []
    artifact_values.extend(artifact_paths)
    completion: JsonObject = {
        "contextId": role_context_id,
        "completedAt": completed_at,
        "observedAt": observed_at,
        "artifacts": artifact_values,
    }
    if manifest.get("methodRevision") == "standard-v1.3.4":
        completion["writeAuthorizationToken"] = write_authorization_token
    completions[role] = completion
    _write_object(resolved / "batch-manifest.json", manifest)
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved, manifest)


def record_controller_artifact(
    target: Path,
    controller_id: str,
    session_id: str,
    artifact_paths: list[str],
) -> JsonObject:
    resolved = target.resolve()
    _require(
        bool(artifact_paths) and len(set(artifact_paths)) == len(artifact_paths),
        "controller-artifacts",
    )
    _require(
        set(artifact_paths) <= {"defect-ledger.jsonl"},
        "controller-artifact-not-allowed",
    )
    manifest = _manifest(resolved)
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    _require(
        manifest.get("methodRevision") == "standard-v1.3.4",
        "controller-artifact-requires-standard-v1.3.4",
    )
    observed_at = _stamp(_now())
    _upsert_ledger(
        manifest,
        resolved,
        artifact_paths,
        controller_id,
        observed_at,
    )
    _write_object(resolved / "batch-manifest.json", manifest)
    return validate_controller_state(resolved, manifest)
