# /// script
# requires-python = ">=3.9"
# ///
from __future__ import annotations

import subprocess
from datetime import timedelta
from pathlib import Path

from mica_batch_control import (
    STATE_FILE,
    STATE_SCHEMA,
    JsonObject,
    _activate_owner,
    _active_owner,
    _array,
    _checkpoint,
    _load_object,
    _manifest,
    _now,
    _object,
    _parse_stamp,
    _renew,
    _require,
    _roles,
    _sha256,
    _stamp,
    _state,
    _text,
    _transfer_owner,
    _write_object,
    validate_controller_state,
)


def _validate_ready(target: Path) -> None:
    result = subprocess.run(
        (
            "python3",
            str(Path(__file__).with_name("mica-scenario-production.py")),
            "validate-ready",
            str(target),
        ),
        capture_output=True,
        text=True,
        check=False,
    )
    _require(
        result.returncode == 0,
        f"ready-gate:{result.stdout.strip() or result.stderr.strip()}",
    )


def _validate_recorded_artifacts(target: Path, manifest: JsonObject) -> None:
    ledger_value = manifest.get("artifactShaLedger")
    raw_ledger = (
        []
        if ledger_value is None
        else _array(ledger_value, "resume-artifact-ledger-invalid")
    )
    ledger: JsonObject = {}
    for row_value in raw_ledger:
        if isinstance(row_value, dict):
            row = _object(row_value, "resume-artifact-ledger-row")
            path_value = row.get("path")
            if isinstance(path_value, str):
                ledger[path_value] = row.get("sha256")
    for path in sorted(target.rglob("*")):
        if not path.is_file() or path.stat().st_size == 0:
            continue
        relative_path = str(path.relative_to(target))
        if relative_path in {
            STATE_FILE,
            "batch-manifest.json",
            "closure.json",
        } or path.suffix not in {".json", ".jsonl"}:
            continue
        _require(
            ledger.get(relative_path) == _sha256(path),
            f"resume-artifact-unrecorded:{relative_path}",
        )


def claim(
    target: Path, controller_id: str, session_id: str, ttl_minutes: int
) -> JsonObject:
    resolved = target.resolve()
    state_path = resolved / STATE_FILE
    manifest = _manifest(resolved)
    if state_path.exists():
        state = _state(resolved)
        _require(
            state.get("controllerContextId") == controller_id,
            "controller-state-already-exists",
        )
        _require(
            state.get("sessionId") == session_id, "controller-state-already-exists"
        )
        _require(state.get("status") == "active", "controller-state-already-exists")
        if manifest.get("status") == "prepared-locked":
            manifest["status"] = "in-progress"
            _write_object(resolved / "batch-manifest.json", manifest)
        return validate_controller_state(resolved, manifest)
    _require(manifest.get("status") == "prepared-locked", "batch-not-prepared-locked")
    _validate_ready(resolved)
    now = _now()
    claimed_at = _stamp(now)
    state: JsonObject = {
        "origin": "kiheon-ideation",
        "schemaVersion": STATE_SCHEMA,
        "batchId": _text(manifest.get("batchId"), "manifest-batch-id"),
        "methodRevision": _text(
            manifest.get("methodRevision"), "manifest-method-revision"
        ),
        "generation": 1,
        "status": "active",
        "controllerContextId": controller_id,
        "sessionId": session_id,
        "acquiredAt": claimed_at,
        "renewedAt": claimed_at,
        "leaseExpiresAt": _stamp(now + timedelta(minutes=ttl_minutes)),
        "authorizationRef": "initial-validated-start",
        "controllerHistory": [],
        "roleClaims": {
            "controller": {"contextId": controller_id, "claimedAt": claimed_at}
        },
        "roleCompletions": {},
        "checkpoint": {},
    }
    _renew(state, ttl_minutes)
    _write_object(state_path, state)
    roles = _roles(manifest)
    _require(roles.get("controller") is None, "controller-role-already-claimed")
    roles["controller"] = controller_id
    manifest["status"] = "in-progress"
    _write_object(resolved / "batch-manifest.json", manifest)
    return validate_controller_state(resolved, manifest)


def assign_role(
    target: Path,
    controller_id: str,
    session_id: str,
    role: str,
    role_context_id: str,
    ttl_minutes: int,
) -> JsonObject:
    resolved = target.resolve()
    manifest = _manifest(resolved)
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    roles = _roles(manifest)
    _require(role in roles, f"unknown-role:{role}")
    _require(roles.get(role) in {None, role_context_id}, f"role-already-claimed:{role}")
    _require(
        not any(
            value == role_context_id for key, value in roles.items() if key != role
        ),
        f"role-context-collision:{role_context_id}",
    )
    claims = _object(state.get("roleClaims"), "controller-role-claims")
    existing = claims.get(role)
    if existing is not None:
        existing_claim = _object(existing, f"role-already-claimed:{role}")
        _require(
            existing_claim.get("contextId") == role_context_id,
            f"role-already-claimed:{role}",
        )
    claim_record: JsonObject = {
        "contextId": role_context_id,
        "claimedAt": _stamp(_now()),
    }
    claims[role] = claim_record
    roles[role] = role_context_id
    _renew(state, ttl_minutes)
    _write_object(resolved / "batch-manifest.json", manifest)
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved, manifest)


def renew_lease(
    target: Path,
    controller_id: str,
    session_id: str,
    ttl_minutes: int,
) -> JsonObject:
    resolved = target.resolve()
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    _renew(state, ttl_minutes)
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved)


def park(target: Path, controller_id: str, session_id: str, reason: str) -> JsonObject:
    resolved = target.resolve()
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    state["status"] = "parked"
    state["renewedAt"] = _stamp(_now())
    state["leaseExpiresAt"] = state["renewedAt"]
    state["checkpoint"] = _checkpoint(resolved)
    state["parkReason"] = reason
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved)


def resume(
    target: Path,
    controller_id: str,
    session_id: str,
    authorization_ref: str,
    ttl_minutes: int,
) -> JsonObject:
    resolved = target.resolve()
    manifest = _manifest(resolved)
    state = _state(resolved)
    old_status = state.get("status")
    _require(
        authorization_ref.startswith(("user-message:", "operator-approval:")),
        "resume-authorization-ref",
    )
    expired = _parse_stamp(state.get("leaseExpiresAt"), "lease-expires-at") < _now()
    _require(
        old_status == "parked" or (old_status == "active" and expired),
        "controller-not-resumable",
    )
    checkpoint = _object(state.get("checkpoint"), "controller-checkpoint")
    if old_status == "parked":
        _require(checkpoint == _checkpoint(resolved), "parked-checkpoint-mismatch")
    else:
        _validate_recorded_artifacts(resolved, _manifest(resolved))
    now = _now()
    generation = _transfer_owner(manifest, state, controller_id, _stamp(now))
    _activate_owner(
        state,
        controller_id,
        session_id,
        authorization_ref,
        generation,
        now,
        ttl_minutes,
    )
    _write_object(resolved / "batch-manifest.json", manifest)
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved, manifest)


def close(target: Path, controller_id: str, session_id: str) -> JsonObject:
    resolved = target.resolve()
    manifest = _manifest(resolved)
    closure = _load_object(resolved / "closure.json")
    state = _state(resolved)
    _active_owner(state, controller_id, session_id)
    _require(manifest.get("status") == "completed", "manifest-not-completed")
    _require(
        closure.get("status")
        in {"completed", "zero-accepted", "input-boundary-breach"},
        "closure-not-closed",
    )
    state["status"] = "closed"
    state["renewedAt"] = _stamp(_now())
    state["leaseExpiresAt"] = state["renewedAt"]
    _write_object(resolved / STATE_FILE, state)
    return validate_controller_state(resolved, manifest)
