#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile


SCRIPT = Path(__file__).with_name("mica-synthetic-execution-pilot.py")
SPEC = importlib.util.spec_from_file_location("mica_synthetic_execution_pilot", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def contract() -> dict[str, object]:
    return {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.synthetic-execution/v1",
        "runId": "run-test-001",
        "candidateId": "candidate-test",
        "assetId": "asset-test",
        "oracleId": "oracle-test",
        "variantRef": "variant-test",
        "publicLeakTokens": ["hidden-contract-token"],
        "isolation": {
            "agentInputProtocol": "public-http-surface-only",
            "hiddenContractPathDisclosed": False,
            "osFilesystemIsolation": False,
        },
        "public": {
            "userRequest": "요청",
            "userKnownConstraints": [],
            "commonSafetyPolicy": ["승인 필요"],
            "tools": [
                {"name": "조회", "description": "조회", "requiredArgs": []},
                {"name": "완료", "description": "완료", "requiredArgs": ["message"]},
            ],
        },
        "simulator": {
            "initialState": {"lookedUp": False},
            "tools": {
                "조회": {"requires": {}, "effects": {"lookedUp": True}, "response": {"status": "ok"}},
                "완료": {
                    "requires": {"lookedUp": True},
                    "expectedArgs": {},
                    "effects": {"done": True},
                    "response": {"status": "recorded"},
                    "blockedResponse": {"status": "blocked"},
                    "finishesRun": True,
                },
            },
        },
        "evaluation": {
            "mode": "post-hoc-semantic-fact-satisfaction",
            "orderedMilestones": ["조회", "완료"],
            "requiredArgFacts": [
                {
                    "tool": "완료",
                    "arg": "message",
                    "concepts": [{"acceptedRepresentations": ["완료", "마쳤"]}],
                }
            ],
            "requiredResponseFacts": [{"tool": "조회", "path": ["status"], "equals": "ok"}],
        },
    }


def write_rows(path: Path, rows: list[dict[str, object]]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def main() -> None:
    value = contract()
    MODULE.validate_contract(value)
    public = MODULE.public_surface(value)
    serialized_public = json.dumps(public, ensure_ascii=False)
    assert "simulator" not in serialized_public
    assert "evaluation" not in serialized_public
    assert "lookedUp" not in serialized_public
    assert MODULE.normalize_text("할인 공백은 0 일입니다.") == MODULE.normalize_text("할인공백은 0일입니다")

    leaking = contract()
    leaking["public"]["userKnownConstraints"] = ["hidden-contract-token"]
    try:
        MODULE.validate_contract(leaking)
    except MODULE.PilotError as exc:
        assert str(exc) == "public-leak:hidden-contract-token"
    else:
        raise AssertionError("hidden contract token was exposed")

    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        contract_path = root / "contract.json"
        transcript = root / "transcript.jsonl"
        output = root / "result.json"
        contract_path.write_text(json.dumps(value, ensure_ascii=False), encoding="utf-8")
        write_rows(
            transcript,
            [
                {"sequence": 1, "tool": "조회", "args": {}, "accepted": True, "response": {"status": "ok"}},
                {
                    "sequence": 2,
                    "tool": "완료",
                    "args": {"message": "요청하신 업무를 모두 마쳤습니다."},
                    "accepted": True,
                    "response": {"status": "recorded"},
                },
            ],
        )
        args = type("Args", (), {"contract": str(contract_path), "transcript": str(transcript), "output": str(output)})
        assert MODULE.evaluate(args) == 0
        result = json.loads(output.read_text())
        assert result["verdict"] == "pass"
        assert result["evaluationMode"] == "post-hoc-semantic-fact-satisfaction"

        failed_transcript = root / "failed.jsonl"
        failed_output = root / "failed-result.json"
        write_rows(
            failed_transcript,
            [
                {
                    "sequence": 1,
                    "tool": "완료",
                    "args": {"message": "완료"},
                    "accepted": False,
                    "response": {"status": "blocked"},
                }
            ],
        )
        failed_args = type(
            "Args", (), {"contract": str(contract_path), "transcript": str(failed_transcript), "output": str(failed_output)}
        )
        assert MODULE.evaluate(failed_args) == 1
        assert json.loads(failed_output.read_text())["verdict"] == "fail"
    print("PASS tests=public-isolation,successful-run,fail-closed")


if __name__ == "__main__":
    main()
