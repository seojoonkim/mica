# /// script
# requires-python = ">=3.9"
# ///
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Union

JsonScalar = Union[str, int, float, bool, None]
JsonValue = Union[JsonScalar, list["JsonValue"], dict[str, "JsonValue"]]
JsonObject = dict[str, JsonValue]
STATE_FILE = "controller-state.json"
STATE_SCHEMA = "mica.scenario-production-controller-state/v1"


class ControlError(RuntimeError):
    pass


def _require(condition: bool, detail: str) -> None:
    if not condition:
        raise ControlError(detail)


def _object(value: JsonValue, detail: str) -> JsonObject:
    if not isinstance(value, dict):
        raise ControlError(detail)
    return value


def _array(value: JsonValue, detail: str) -> list[JsonValue]:
    if not isinstance(value, list):
        raise ControlError(detail)
    return value


def _integer(value: JsonValue, detail: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise ControlError(detail)
    return value


def _load_object(path: Path) -> JsonObject:
    try:
        value: JsonValue = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ControlError(f"invalid-json:{path.name}") from exc
    return _object(value, f"not-object:{path.name}")


def _write_object(path: Path, value: JsonObject) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.", dir=path.parent
    )
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(payload)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary_name, path)
    except BaseException:
        try:
            os.unlink(temporary_name)
        except FileNotFoundError:
            pass
        raise


def _text(value: JsonValue, detail: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ControlError(detail)
    return value


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _stamp(value: datetime) -> str:
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def _parse_stamp(value: JsonValue, detail: str) -> datetime:
    text = _text(value, detail)
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ControlError(detail) from exc
    _require(parsed.tzinfo is not None, detail)
    return parsed.astimezone(timezone.utc)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _manifest(target: Path) -> JsonObject:
    manifest = _load_object(target / "batch-manifest.json")
    _require(manifest.get("origin") == "kiheon-ideation", "manifest-origin")
    return manifest


def _state(target: Path) -> JsonObject:
    return _load_object(target / STATE_FILE)


def _active_owner(state: JsonObject, controller_id: str, session_id: str) -> None:
    _require(state.get("status") == "active", "controller-not-active")
    _require(
        state.get("controllerContextId") == controller_id, "controller-owner-mismatch"
    )
    _require(state.get("sessionId") == session_id, "controller-session-mismatch")
    _require(
        _parse_stamp(state.get("leaseExpiresAt"), "lease-expires-at") >= _now(),
        "controller-lease-expired",
    )


def _renew(state: JsonObject, ttl_minutes: int) -> None:
    _require(5 <= ttl_minutes <= 240, "lease-ttl-must-be-5-to-240")
    now = _now()
    state["renewedAt"] = _stamp(now)
    state["leaseExpiresAt"] = _stamp(now + timedelta(minutes=ttl_minutes))


def _checkpoint(target: Path) -> JsonObject:
    return {
        path.name: _sha256(path)
        for path in sorted(target.iterdir())
        if path.is_file() and path.name != STATE_FILE
    }


def _roles(manifest: JsonObject) -> JsonObject:
    return _object(manifest.get("roles"), "manifest-roles")


def _transfer_owner(
    manifest: JsonObject,
    state: JsonObject,
    controller_id: str,
    claimed_at: str,
) -> int:
    history = _array(state.get("controllerHistory"), "controller-history")
    history_entry: JsonObject = {
        "controllerContextId": state.get("controllerContextId"),
        "sessionId": state.get("sessionId"),
        "releasedAt": claimed_at,
        "status": state.get("status"),
    }
    history.append(history_entry)
    next_generation = _integer(state.get("generation"), "controller-generation") + 1
    roles = _roles(manifest)
    _require(
        roles.get("controller") == state.get("controllerContextId"),
        "controller-manifest-owner-mismatch",
    )
    claims = _object(state.get("roleClaims"), "controller-role-claims")
    claim: JsonObject = {"contextId": controller_id, "claimedAt": claimed_at}
    roles["controller"] = controller_id
    claims["controller"] = claim
    return next_generation


def _activate_owner(
    state: JsonObject,
    controller_id: str,
    session_id: str,
    authorization_ref: str,
    generation: int,
    now: datetime,
    ttl_minutes: int,
) -> None:
    state["generation"] = generation
    state["status"] = "active"
    state["controllerContextId"] = controller_id
    state["sessionId"] = session_id
    state["acquiredAt"] = _stamp(now)
    state["authorizationRef"] = authorization_ref
    state["checkpoint"] = {}
    _renew(state, ttl_minutes)


def validate_controller_state(
    target: Path, manifest: Union[JsonObject, None] = None
) -> JsonObject:
    resolved = target.resolve()
    current_manifest = _manifest(resolved) if manifest is None else manifest
    state = _state(resolved)
    _require(state.get("origin") == "kiheon-ideation", "controller-state-origin")
    _require(state.get("schemaVersion") == STATE_SCHEMA, "controller-state-schema")
    _require(
        state.get("batchId") == current_manifest.get("batchId"),
        "controller-state-batch",
    )
    _require(
        state.get("methodRevision") == current_manifest.get("methodRevision"),
        "controller-state-revision",
    )
    _require(
        state.get("status") in {"active", "parked", "closed"}, "controller-state-status"
    )
    _text(state.get("controllerContextId"), "controller-context-id")
    _text(state.get("sessionId"), "controller-session-id")
    _parse_stamp(state.get("acquiredAt"), "controller-acquired-at")
    _parse_stamp(state.get("renewedAt"), "controller-renewed-at")
    _parse_stamp(state.get("leaseExpiresAt"), "lease-expires-at")
    generation = _integer(state.get("generation"), "controller-generation")
    _require(generation >= 1, "controller-generation")
    authorization_ref = _text(
        state.get("authorizationRef"), "controller-authorization-ref"
    )
    _require(
        authorization_ref == "initial-validated-start"
        or authorization_ref.startswith(("user-message:", "operator-approval:")),
        "controller-authorization-ref",
    )
    _array(state.get("controllerHistory"), "controller-history")
    _object(state.get("checkpoint"), "controller-checkpoint")
    claims = _object(state.get("roleClaims"), "controller-role-claims")
    completions = _object(state.get("roleCompletions"), "controller-role-completions")
    manifest_roles = _roles(current_manifest)
    _require(
        manifest_roles.get("controller") == state.get("controllerContextId"),
        "controller-manifest-owner-mismatch",
    )
    claimed_contexts: list[str] = []
    for role, claim_value in claims.items():
        _require(role in manifest_roles, f"role-claim:{role}")
        claim = _object(claim_value, f"role-claim:{role}")
        context_id = _text(claim.get("contextId"), f"role-context:{role}")
        _parse_stamp(claim.get("claimedAt"), f"role-claimed-at:{role}")
        _require(
            manifest_roles.get(role) == context_id,
            f"role-claim-manifest-mismatch:{role}",
        )
        claimed_contexts.append(context_id)
    _require(
        len(claimed_contexts) == len(set(claimed_contexts)),
        "role-claim-context-collision",
    )
    for role, context_value in manifest_roles.items():
        if context_value is not None:
            claim = _object(claims.get(role), f"manifest-role-claim-missing:{role}")
            _require(
                claim.get("contextId") == context_value,
                f"manifest-role-claim-missing:{role}",
            )
    for role, completion_value in completions.items():
        _require(role in claims, f"role-completion:{role}")
        completion = _object(completion_value, f"role-completion:{role}")
        _require(
            completion.get("contextId") == manifest_roles.get(role),
            f"role-completion-context:{role}",
        )
        _parse_stamp(completion.get("completedAt"), f"role-completed-at:{role}")
        _parse_stamp(completion.get("observedAt"), f"role-observed-at:{role}")
        _array(completion.get("artifacts"), f"role-artifacts:{role}")
    if current_manifest.get("status") == "completed":
        _require(state.get("status") == "closed", "completed-controller-not-closed")
    return {
        "status": "pass",
        "batchId": _text(state.get("batchId"), "controller-state-batch"),
        "controllerStatus": _text(state.get("status"), "controller-state-status"),
        "generation": generation,
        "roleClaims": len(claims),
        "roleCompletions": len(completions),
    }
