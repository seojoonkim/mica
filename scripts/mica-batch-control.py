# /// script
# requires-python = ">=3.9"
# ///
from __future__ import annotations

import argparse
import json
from pathlib import Path

from mica_batch_control import ControlError, validate_controller_state
from mica_batch_lifecycle import assign_role, claim, close, park, renew_lease, resume
from mica_batch_records import complete_role, record_controller_artifact


def _owner(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("path", type=Path)
    parser.add_argument("--controller-context-id", required=True)
    parser.add_argument("--session-id", required=True)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="MICA batch controller lease and resume gate"
    )
    parser.add_argument("--json", action="store_true", help="emit JSON")
    subparsers = parser.add_subparsers(dest="command", required=True)
    claim_parser = subparsers.add_parser("claim")
    _owner(claim_parser)
    claim_parser.add_argument("--ttl-minutes", type=int, default=180)
    role_parser = subparsers.add_parser("assign-role")
    _owner(role_parser)
    role_parser.add_argument("--role", required=True)
    role_parser.add_argument("--role-context-id", required=True)
    role_parser.add_argument("--ttl-minutes", type=int, default=180)
    complete_parser = subparsers.add_parser("complete-role")
    _owner(complete_parser)
    complete_parser.add_argument("--role", required=True)
    complete_parser.add_argument("--role-context-id", required=True)
    complete_parser.add_argument("--model", required=True)
    complete_parser.add_argument("--effort-class", required=True)
    complete_parser.add_argument("--tools-summary", required=True)
    complete_parser.add_argument("--artifact", action="append", required=True)
    complete_parser.add_argument("--write-authorization-token")
    record_parser = subparsers.add_parser("record-artifact")
    _owner(record_parser)
    record_parser.add_argument("--artifact", action="append", required=True)
    renew_parser = subparsers.add_parser("renew")
    _owner(renew_parser)
    renew_parser.add_argument("--ttl-minutes", type=int, default=180)
    park_parser = subparsers.add_parser("park")
    _owner(park_parser)
    park_parser.add_argument("--reason", required=True)
    park_parser.add_argument("--abandon-role", action="append", default=[])
    resume_parser = subparsers.add_parser("resume")
    _owner(resume_parser)
    resume_parser.add_argument("--authorization-ref", required=True)
    resume_parser.add_argument("--ttl-minutes", type=int, default=180)
    close_parser = subparsers.add_parser("close")
    _owner(close_parser)
    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("path", type=Path)
    args = parser.parse_args()
    try:
        if args.command == "claim":
            result = claim(
                args.path, args.controller_context_id, args.session_id, args.ttl_minutes
            )
        elif args.command == "assign-role":
            result = assign_role(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.role,
                args.role_context_id,
                args.ttl_minutes,
            )
        elif args.command == "complete-role":
            result = complete_role(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.role,
                args.role_context_id,
                args.model,
                args.effort_class,
                args.tools_summary,
                args.artifact,
                args.write_authorization_token,
            )
        elif args.command == "record-artifact":
            result = record_controller_artifact(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.artifact,
            )
        elif args.command == "renew":
            result = renew_lease(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.ttl_minutes,
            )
        elif args.command == "park":
            result = park(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.reason,
                args.abandon_role,
            )
        elif args.command == "resume":
            result = resume(
                args.path,
                args.controller_context_id,
                args.session_id,
                args.authorization_ref,
                args.ttl_minutes,
            )
        elif args.command == "close":
            result = close(args.path, args.controller_context_id, args.session_id)
        else:
            result = validate_controller_state(args.path)
    except (ControlError, OSError) as exc:
        if args.json:
            print(json.dumps({"status": "fail", "detail": str(exc)}))
        else:
            print(f"FAIL {exc}")
        return 1
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    print(
        "PASS "
        + " ".join(f"{key}={value}" for key, value in result.items() if key != "status")
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
