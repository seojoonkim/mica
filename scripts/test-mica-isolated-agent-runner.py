#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile


SCRIPT = Path(__file__).with_name("mica-isolated-agent-runner.py")
SPEC = importlib.util.spec_from_file_location("mica_isolated_agent_runner", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def main() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        private_root = root / "private"
        agent_root = root / "agent"
        private_root.mkdir()
        agent_root.mkdir()
        secret = private_root / "oracle.json"
        public = agent_root / "request.txt"
        secret.write_text("hidden", encoding="utf-8")
        public.write_text("public", encoding="utf-8")

        # Given: a measured process receives a public working directory.
        # When: the isolation preflight probes both public and private paths.
        receipt = MODULE.verify_isolation(private_root, agent_root, secret)
        # Then: public input remains readable and the hidden oracle is blocked by the OS.
        assert receipt.public_root_readable is True
        assert receipt.private_probe_blocked is True
        assert receipt.other_process_info_blocked is True
        assert receipt.enforcement == "macos-sandbox-exec"

        # Given: the controller may have launched the harness with private paths in its arguments.
        # When: the measured process attempts to enumerate other processes and their commands.
        process_result = MODULE.run_isolated(
            private_root,
            agent_root,
            ["/bin/ps", "-axo", "pid,command"],
        )
        # Then: process metadata is blocked before it can reveal controller arguments.
        assert process_result.returncode != 0

        # Given: the same isolated working directory and hidden contract root.
        # When: a measured command attempts to read both paths.
        result = MODULE.run_isolated(
            private_root,
            agent_root,
            ["/bin/zsh", "-c", f'test -r "{public}" && ! test -r "{secret}"'],
        )
        # Then: the process can use its public input but cannot read the oracle.
        assert result.returncode == 0

        # Given: an agent directory contains a symlink into the private contract root.
        # When: the isolated command follows that symlink.
        linked_secret = agent_root / "linked-oracle.json"
        linked_secret.symlink_to(secret)
        linked_result = MODULE.run_isolated(
            private_root,
            agent_root,
            ["/bin/zsh", "-c", f'! head -c 1 "{linked_secret}" >/dev/null 2>&1'],
        )
        # Then: path resolution still reaches the denied private root and the read is blocked.
        assert linked_result.returncode == 0

        # Given: private and agent roots overlap.
        # When: a command is prepared with that invalid topology.
        try:
            MODULE.run_isolated(private_root, private_root / "nested", ["/usr/bin/true"])
        # Then: the runner rejects the topology before spawning the measured process.
        except MODULE.IsolationError as exc:
            assert str(exc) == "isolation-roots-overlap"
        else:
            raise AssertionError("overlapping isolation roots were accepted")

        receipt_path = root / "isolation-receipt.json"
        cli_result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--private-root",
                str(private_root),
                "--agent-root",
                str(agent_root),
                "--private-probe",
                str(secret),
                "--receipt",
                str(receipt_path),
                "/bin/zsh",
                "-c",
                f'test -r "{public}" && ! head -c 1 "{secret}" >/dev/null 2>&1',
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        assert cli_result.returncode == 0
        receipt_value = json.loads(receipt_path.read_text(encoding="utf-8"))
        assert receipt_value["privateProbeBlocked"] is True
        assert receipt_value["otherProcessInfoBlocked"] is True
        assert receipt_value["commandExitCode"] == 0

    print("PASS tests=os-preflight,process-info,isolated-command,symlink,overlap,cli-receipt")


if __name__ == "__main__":
    main()
