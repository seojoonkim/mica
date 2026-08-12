#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
from pathlib import Path
import shutil
import subprocess
import sys
from typing import Final


SANDBOX_EXEC: Final = "/usr/bin/sandbox-exec"


@dataclass(frozen=True, slots=True)
class IsolationReceipt:
    enforcement: str
    private_root: str
    agent_root: str
    public_root_readable: bool
    private_probe_blocked: bool


class IsolationError(RuntimeError):
    pass


def sandbox_profile() -> str:
    return "\n".join(
        [
            "(version 1)",
            "(allow default)",
            '(deny file-read* file-write* (subpath (param "PRIVATE_ROOT")))',
            '(allow file-read* file-write* (subpath (param "AGENT_ROOT")))',
        ]
    )


def run_isolated(private_root: Path, agent_root: Path, command: list[str]) -> subprocess.CompletedProcess[str]:
    if shutil.which(SANDBOX_EXEC) is None:
        raise IsolationError("sandbox-exec-unavailable")
    private_root = private_root.resolve()
    agent_root = agent_root.resolve()
    if private_root == agent_root or private_root.is_relative_to(agent_root) or agent_root.is_relative_to(private_root):
        raise IsolationError("isolation-roots-overlap")
    if not private_root.is_dir():
        raise IsolationError("private-root-missing")
    if not agent_root.is_dir():
        raise IsolationError("agent-root-missing")
    return subprocess.run(
        [
            SANDBOX_EXEC,
            "-D",
            f"PRIVATE_ROOT={private_root}",
            "-D",
            f"AGENT_ROOT={agent_root}",
            "-p",
            sandbox_profile(),
            *command,
        ],
        cwd=agent_root,
        check=False,
        capture_output=True,
        text=True,
    )


def verify_isolation(private_root: Path, agent_root: Path, private_probe: Path) -> IsolationReceipt:
    private_root = private_root.resolve()
    agent_root = agent_root.resolve()
    private_probe = private_probe.resolve()
    if not private_probe.is_relative_to(private_root):
        raise IsolationError("private-probe-outside-private-root")
    public_probe = agent_root / ".mica-public-probe"
    public_probe.write_text("public", encoding="utf-8")
    try:
        result = run_isolated(
            private_root,
            agent_root,
            ["/bin/zsh", "-c", f'test -r "{public_probe}" && ! head -c 1 "{private_probe}" >/dev/null 2>&1'],
        )
    finally:
        public_probe.unlink(missing_ok=True)
    if result.returncode != 0:
        raise IsolationError("os-isolation-preflight-failed")
    return IsolationReceipt(
        enforcement="macos-sandbox-exec",
        private_root=str(private_root),
        agent_root=str(agent_root),
        public_root_readable=True,
        private_probe_blocked=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="MICA 피측정 에이전트 파일시스템 격리 실행기")
    parser.add_argument("--private-root", required=True)
    parser.add_argument("--agent-root", required=True)
    parser.add_argument("--private-probe", required=True)
    parser.add_argument("--receipt", required=True)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if not args.command:
        print("FAIL missing-command", file=sys.stderr)
        return 2
    try:
        receipt = verify_isolation(Path(args.private_root), Path(args.agent_root), Path(args.private_probe))
        result = run_isolated(Path(args.private_root), Path(args.agent_root), args.command)
    except (IsolationError, OSError) as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        return 2
    receipt_value = {
        "enforcement": receipt.enforcement,
        "privateRoot": receipt.private_root,
        "agentRoot": receipt.agent_root,
        "publicRootReadable": receipt.public_root_readable,
        "privateProbeBlocked": receipt.private_probe_blocked,
    }
    Path(args.receipt).write_text(json.dumps(receipt_value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
