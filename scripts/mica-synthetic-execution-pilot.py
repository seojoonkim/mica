#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import re
from pathlib import Path
import sys
from typing import Any


SCHEMA = "mica.synthetic-execution/v1"


class PilotError(RuntimeError):
    pass


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise PilotError(f"invalid-json:{path}:{exc}") from exc
    if not isinstance(value, dict):
        raise PilotError(f"not-object:{path}")
    return value


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition: bool, detail: str) -> None:
    if not condition:
        raise PilotError(detail)


def validate_contract(contract: dict[str, Any]) -> None:
    require(contract.get("origin") == "kiheon-ideation", "origin")
    require(contract.get("schemaVersion") == SCHEMA, "schema-version")
    for field in ("runId", "candidateId", "assetId", "oracleId", "variantRef"):
        require(isinstance(contract.get(field), str) and bool(contract[field]), f"field:{field}")

    public = contract.get("public")
    simulator = contract.get("simulator")
    evaluation = contract.get("evaluation")
    isolation = contract.get("isolation")
    require(isinstance(public, dict), "public")
    require(isinstance(simulator, dict), "simulator")
    require(isinstance(evaluation, dict), "evaluation")
    require(isinstance(isolation, dict), "isolation")
    require(isolation.get("agentInputProtocol") == "public-http-surface-only", "isolation:protocol")
    require(isolation.get("hiddenContractPathDisclosed") is False, "isolation:hidden-path")
    require(isinstance(isolation.get("osFilesystemIsolation"), bool), "isolation:os-filesystem")
    if isolation["osFilesystemIsolation"] is True:
        require(isolation.get("enforcement") == "macos-sandbox-exec", "isolation:enforcement")
        require(isolation.get("processMetadataIsolation") is True, "isolation:process-metadata")
    require(isinstance(public.get("userRequest"), str), "public:userRequest")
    public_serialized = json.dumps(public, ensure_ascii=False)
    for field in ("runId", "candidateId", "assetId", "oracleId", "variantRef"):
        require(contract[field] not in public_serialized, f"public-identity-leak:{field}")
    hidden_tokens = contract.get("publicLeakTokens", [])
    require(isinstance(hidden_tokens, list), "publicLeakTokens")
    for token in hidden_tokens:
        require(isinstance(token, str) and bool(token), "publicLeakToken")
        require(token not in public_serialized, f"public-leak:{token}")
    tools = public.get("tools")
    require(isinstance(tools, list) and bool(tools), "public:tools")
    tool_names: list[str] = []
    for tool in tools:
        require(isinstance(tool, dict), "public:tool")
        name = tool.get("name")
        require(isinstance(name, str) and bool(name), "public:tool:name")
        require(isinstance(tool.get("description"), str), f"public:tool:description:{name}")
        required_args = tool.get("requiredArgs")
        require(isinstance(required_args, list), f"public:tool:requiredArgs:{name}")
        require(all(isinstance(arg, str) for arg in required_args), f"public:tool:arg:{name}")
        tool_names.append(name)
    require(len(tool_names) == len(set(tool_names)), "public:tool:duplicate")

    definitions = simulator.get("tools")
    require(isinstance(definitions, dict), "simulator:tools")
    require(set(definitions) == set(tool_names), "simulator:tool-surface")
    initial_state = simulator.get("initialState")
    require(isinstance(initial_state, dict), "simulator:initialState")
    for name, definition in definitions.items():
        require(isinstance(definition, dict), f"simulator:tool:{name}")
        for key in ("requires", "effects", "response"):
            require(isinstance(definition.get(key), dict), f"simulator:tool:{name}:{key}")
        expected_args = definition.get("expectedArgs", {})
        require(isinstance(expected_args, dict), f"simulator:tool:{name}:expectedArgs")

    ordered = evaluation.get("orderedMilestones")
    require(isinstance(ordered, list) and bool(ordered), "evaluation:orderedMilestones")
    require(all(name in definitions for name in ordered), "evaluation:unknown-milestone")
    evaluation_mode = evaluation.get("mode", "legacy-normalized-fact-inclusion")
    require(
        evaluation_mode in {"legacy-normalized-fact-inclusion", "post-hoc-semantic-fact-satisfaction"},
        "evaluation:mode",
    )
    facts = evaluation.get("requiredResponseFacts")
    require(isinstance(facts, list), "evaluation:requiredResponseFacts")
    for fact in facts:
        require(isinstance(fact, dict), "evaluation:fact")
        require(fact.get("tool") in definitions, "evaluation:fact:tool")
        require(isinstance(fact.get("path"), list), "evaluation:fact:path")
    arg_facts = evaluation.get("requiredArgFacts", [])
    require(isinstance(arg_facts, list), "evaluation:requiredArgFacts")
    for fact in arg_facts:
        require(isinstance(fact, dict), "evaluation:arg-fact")
        require(fact.get("tool") in definitions, "evaluation:arg-fact:tool")
        require(isinstance(fact.get("arg"), str), "evaluation:arg-fact:arg")
        if evaluation_mode == "post-hoc-semantic-fact-satisfaction":
            concepts = fact.get("concepts")
            require(isinstance(concepts, list) and bool(concepts), "evaluation:arg-fact:concepts")
            for concept in concepts:
                require(isinstance(concept, dict), "evaluation:arg-fact:concept")
                representations = concept.get("acceptedRepresentations")
                require(
                    isinstance(representations, list)
                    and bool(representations)
                    and all(isinstance(value, str) and bool(value) for value in representations),
                    "evaluation:arg-fact:accepted-representations",
                )
        else:
            includes = fact.get("includes")
            require(
                isinstance(includes, list) and all(isinstance(term, str) for term in includes),
                "evaluation:arg-fact:includes",
            )


def public_surface(contract: dict[str, Any]) -> dict[str, Any]:
    public = contract["public"]
    return {
        "origin": contract["origin"],
        "schemaVersion": SCHEMA,
        "userRequest": public["userRequest"],
        "userKnownConstraints": public.get("userKnownConstraints", []),
        "commonSafetyPolicy": public.get("commonSafetyPolicy", []),
        "tools": public["tools"],
    }


def append_jsonl(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n")


def nested_value(value: Any, path: list[Any]) -> Any:
    current = value
    for part in path:
        if isinstance(current, dict) and isinstance(part, str) and part in current:
            current = current[part]
        elif isinstance(current, list) and isinstance(part, int) and 0 <= part < len(current):
            current = current[part]
        else:
            raise PilotError(f"missing-path:{path}")
    return current


def normalize_text(value: str) -> str:
    return re.sub(r"[\s·,./:_-]+", "", value).casefold()


class PilotServer(ThreadingHTTPServer):
    contract: dict[str, Any]
    transcript_path: Path
    state: dict[str, Any]
    sequence: int
    finished: bool


class Handler(BaseHTTPRequestHandler):
    server: PilotServer

    def log_message(self, format: str, *args: object) -> None:
        return

    def send_json(self, status: int, value: dict[str, Any]) -> None:
        body = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json(200, {"status": "ready"})
            return
        if self.path == "/request":
            self.send_json(200, public_surface(self.server.contract))
            return
        self.send_json(404, {"error": "not-found"})

    def do_POST(self) -> None:
        if self.path != "/call":
            self.send_json(404, {"error": "not-found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"error": "invalid-request"})
            return
        if not isinstance(payload, dict) or not isinstance(payload.get("tool"), str):
            self.send_json(400, {"error": "invalid-request"})
            return
        args = payload.get("args", {})
        if not isinstance(args, dict):
            self.send_json(400, {"error": "invalid-args"})
            return
        tool_name = payload["tool"]
        definitions = self.server.contract["simulator"]["tools"]
        definition = definitions.get(tool_name)
        if not isinstance(definition, dict):
            self.send_json(404, {"error": "unknown-tool"})
            return
        public_tool = next(tool for tool in self.server.contract["public"]["tools"] if tool["name"] == tool_name)
        missing_args = [name for name in public_tool["requiredArgs"] if name not in args]
        blocked_reason: str | None = None
        if self.server.finished:
            blocked_reason = "run-already-finished"
        elif missing_args:
            blocked_reason = "missing-required-args"
        else:
            for key, expected in definition.get("expectedArgs", {}).items():
                if args.get(key) != expected:
                    blocked_reason = "argument-mismatch"
                    break
        if blocked_reason is None:
            for key, expected in definition["requires"].items():
                if self.server.state.get(key) != expected:
                    blocked_reason = "precondition-not-met"
                    break
        if blocked_reason is None:
            self.server.state.update(definition["effects"])
            response = definition["response"]
            if definition.get("finishesRun") is True:
                self.server.finished = True
            accepted = True
            status = 200
        else:
            response = definition.get("blockedResponse", {"status": "blocked"})
            accepted = False
            status = 409
        self.server.sequence += 1
        append_jsonl(
            self.server.transcript_path,
            {
                "sequence": self.server.sequence,
                "tool": tool_name,
                "args": args,
                "accepted": accepted,
                "response": response,
                "blockedReason": blocked_reason,
                "recordedAt": datetime.now(timezone.utc).isoformat(),
            },
        )
        self.send_json(status, response)


def serve(args: argparse.Namespace) -> int:
    contract_path = Path(args.contract).resolve()
    transcript_path = Path(args.transcript).resolve()
    ready_path = Path(args.ready_file).resolve()
    contract = load_json(contract_path)
    validate_contract(contract)
    require(not transcript_path.exists(), f"transcript-exists:{transcript_path}")
    server = PilotServer((args.host, args.port), Handler)
    server.contract = contract
    server.transcript_path = transcript_path
    server.state = dict(contract["simulator"]["initialState"])
    server.sequence = 0
    server.finished = False
    host, port = server.server_address
    ready_path.parent.mkdir(parents=True, exist_ok=True)
    ready_path.write_text(
        json.dumps(
            {
                "url": f"http://{host}:{port}",
                "runId": contract["runId"],
                "contractSha256": sha256(contract_path),
            },
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


def evaluate(args: argparse.Namespace) -> int:
    contract_path = Path(args.contract).resolve()
    transcript_path = Path(args.transcript).resolve()
    output_path = Path(args.output).resolve()
    contract = load_json(contract_path)
    validate_contract(contract)
    isolation_receipt_path_value = getattr(args, "isolation_receipt", None)
    isolation_receipt_path = Path(isolation_receipt_path_value).resolve() if isolation_receipt_path_value else None
    isolation_receipt_sha256: str | None = None
    verified_os_isolation = False
    if contract["isolation"]["osFilesystemIsolation"] is True:
        require(isolation_receipt_path is not None and isolation_receipt_path.is_file(), "missing-isolation-receipt")
        isolation_receipt = load_json(isolation_receipt_path)
        require(isolation_receipt.get("enforcement") == contract["isolation"]["enforcement"], "isolation-receipt:enforcement")
        require(isolation_receipt.get("publicRootReadable") is True, "isolation-receipt:public-root")
        require(isolation_receipt.get("privateProbeBlocked") is True, "isolation-receipt:private-probe")
        require(isolation_receipt.get("otherProcessInfoBlocked") is True, "isolation-receipt:process-info")
        require(isolation_receipt.get("commandExitCode") == 0, "isolation-receipt:command-exit")
        isolation_receipt_sha256 = sha256(isolation_receipt_path)
        verified_os_isolation = True
    require(transcript_path.is_file(), f"missing-transcript:{transcript_path}")
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(transcript_path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise PilotError(f"invalid-transcript-line:{line_number}:{exc}") from exc
        require(isinstance(row, dict), f"transcript-not-object:{line_number}")
        rows.append(row)
    require(bool(rows), "empty-transcript")
    require([row.get("sequence") for row in rows] == list(range(1, len(rows) + 1)), "transcript-sequence")

    accepted_tools = [row["tool"] for row in rows if row.get("accepted") is True]
    known_tools = set(contract["simulator"]["tools"])
    require(all(row.get("tool") in known_tools for row in rows), "transcript-unknown-tool")
    ordered = contract["evaluation"]["orderedMilestones"]
    cursor = 0
    for tool in accepted_tools:
        if cursor < len(ordered) and tool == ordered[cursor]:
            cursor += 1
    order_pass = cursor == len(ordered)
    rejected_calls = sum(row.get("accepted") is not True for row in rows)
    checks: list[dict[str, Any]] = [
        {"check": "ordered-milestones", "pass": order_pass, "observed": f"{cursor}/{len(ordered)}"},
        {"check": "fail-closed-violations", "pass": rejected_calls == 0, "observed": rejected_calls},
    ]
    for index, requirement in enumerate(contract["evaluation"].get("requiredArgFacts", []), 1):
        require(isinstance(requirement, dict), "evaluation:arg-fact")
        matched = False
        for row in rows:
            if row.get("accepted") is not True or row.get("tool") != requirement.get("tool"):
                continue
            value = row.get("args", {}).get(requirement.get("arg"))
            if isinstance(value, str):
                normalized = normalize_text(value)
                if contract["evaluation"].get("mode") == "post-hoc-semantic-fact-satisfaction":
                    concepts = requirement.get("concepts")
                    require(isinstance(concepts, list), "evaluation:arg-fact:concepts")
                    terms_match = all(
                        isinstance(concept, dict)
                        and isinstance(concept.get("acceptedRepresentations"), list)
                        and any(
                            isinstance(representation, str) and normalize_text(representation) in normalized
                            for representation in concept["acceptedRepresentations"]
                        )
                        for concept in concepts
                    )
                else:
                    required_terms = requirement.get("includes")
                    require(isinstance(required_terms, list), "evaluation:arg-fact:includes")
                    terms_match = all(
                        isinstance(term, str) and normalize_text(term) in normalized for term in required_terms
                    )
            else:
                terms_match = False
            if terms_match:
                matched = True
                break
        checks.append({"check": f"argument-facts-{index}", "pass": matched, "tool": requirement.get("tool")})
    for index, fact in enumerate(contract["evaluation"]["requiredResponseFacts"], 1):
        matched = False
        for row in rows:
            if row.get("accepted") is not True or row.get("tool") != fact["tool"]:
                continue
            try:
                observed = nested_value(row.get("response"), fact["path"])
            except PilotError:
                continue
            if observed == fact.get("equals"):
                matched = True
                break
        checks.append({"check": f"response-fact-{index}", "pass": matched, "tool": fact["tool"]})
    passed = all(check["pass"] is True for check in checks)
    output = {
        "origin": "kiheon-ideation",
        "schemaVersion": "mica.synthetic-execution-result/v1",
        "runId": contract["runId"],
        "candidateId": contract["candidateId"],
        "assetId": contract["assetId"],
        "oracleId": contract["oracleId"],
        "variantRef": contract["variantRef"],
        "actualSyntheticExecution": True,
        "agentInputProtocol": contract["isolation"]["agentInputProtocol"],
        "hiddenContractPathDisclosed": contract["isolation"]["hiddenContractPathDisclosed"],
        "osFilesystemIsolation": verified_os_isolation,
        "processMetadataIsolation": verified_os_isolation,
        "isolationReceiptSha256": isolation_receipt_sha256,
        "evaluationMode": contract["evaluation"].get("mode", "legacy-normalized-fact-inclusion"),
        "contractSha256": sha256(contract_path),
        "transcriptSha256": sha256(transcript_path),
        "acceptedToolCalls": len(accepted_tools),
        "rejectedToolCalls": rejected_calls,
        "checks": checks,
        "verdict": "pass" if passed else "fail",
        "evaluatedAt": datetime.now(timezone.utc).isoformat(),
    }
    require(not output_path.exists(), f"output-exists:{output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False))
    return 0 if passed else 1


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="MICA 비공개 계약 격리 합성 실행 파일럿")
    sub = root.add_subparsers(dest="command", required=True)
    serve_parser = sub.add_parser("serve")
    serve_parser.add_argument("--contract", required=True)
    serve_parser.add_argument("--transcript", required=True)
    serve_parser.add_argument("--ready-file", required=True)
    serve_parser.add_argument("--host", default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=0)
    serve_parser.set_defaults(handler=serve)
    evaluate_parser = sub.add_parser("evaluate")
    evaluate_parser.add_argument("--contract", required=True)
    evaluate_parser.add_argument("--transcript", required=True)
    evaluate_parser.add_argument("--output", required=True)
    evaluate_parser.add_argument("--isolation-receipt")
    evaluate_parser.set_defaults(handler=evaluate)
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        return args.handler(args)
    except PilotError as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
