#!/usr/bin/env python3
"""Clean-room job packet integrity and accepted-only freeze.

두 가지 판단 없는 단계를 사람과 모델 대신 결정적으로 수행한다.

- verify: job packet의 모든 SHA-256 리터럴을 재계산해 대조한다. 읽기 전용이다.
- freeze: review verdict에서 기계적으로 도출되는 accepted-only 동결을 수행한다.

두 단계 모두 의미를 판정하지 않는다. verdict를 다시 읽거나 문구를 고치지 않는다.
확정할 수 없는 형태를 만나면 추측하지 않고 fail-closed로 종료한다.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

HEX_RUN = re.compile(r"^[0-9a-fA-F]{20,80}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
GIT_SHA = re.compile(r"^[0-9a-f]{40}$")


class Fail(Exception):
    """계약 위반. 호출자는 추측하지 않고 종료한다."""


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def sha256_line(line: str) -> str:
    """줄바꿈을 제외한 원본 JSON 한 줄의 SHA-256."""
    return sha256_bytes(line.encode("utf-8"))


def read_rows(path: Path) -> list[str]:
    """JSONL의 원본 줄을 바이트 그대로 보존해 반환한다."""
    text = path.read_text(encoding="utf-8")
    return [line for line in text.split("\n") if line.strip()]


def walk(node: object, trail: str = ""):
    """READY.json을 재귀 순회하며 (경로, 값)을 낸다."""
    if isinstance(node, dict):
        for key, value in node.items():
            child = f"{trail}.{key}" if trail else key
            yield child, value
            yield from walk(value, child)
    elif isinstance(node, list):
        for index, value in enumerate(node):
            child = f"{trail}[{index}]"
            yield child, value
            yield from walk(value, child)


# ---------------------------------------------------------------- verify


def check_digest_shape(ready: dict) -> list[str]:
    """digest 리터럴의 자릿수를 키 이름 기준으로 검사한다.

    kh-b13-observation-freeze attempt 1은 controller가 64자리를 62자리로 옮겨 적어
    custodian 역할 전체를 다시 실행했다. 이 검사가 그 결함을 잡는다.

    `sourceCommitSha`처럼 git 커밋을 가리키는 키는 SHA-1 40자리이므로 대상이 아니다.
    키 이름으로 기대 자릿수를 정하고, 값의 생김새로 추정하지 않는다.
    """
    problems = []
    for trail, value in walk(ready):
        if not isinstance(value, str) or not HEX_RUN.match(value):
            continue
        key = trail.rsplit(".", 1)[-1].lower()
        if key.endswith("sha256"):
            if not SHA256.match(value):
                problems.append(
                    f"digest-shape:{trail}: {len(value)}자리 '{value}' "
                    f"(SHA-256 소문자 64자리여야 함)"
                )
        elif key.endswith("commitsha") or key == "commitsha":
            if not GIT_SHA.match(value):
                problems.append(
                    f"commit-shape:{trail}: {len(value)}자리 '{value}' "
                    f"(git SHA-1 소문자 40자리여야 함)"
                )
    return problems


def check_pointers(job: Path, ready: dict) -> list[str]:
    """{path, sha256} 포인터를 디스크와 대조한다."""
    problems = []
    seen = 0
    for trail, value in walk(ready):
        if not isinstance(value, dict):
            continue
        if "path" not in value or "sha256" not in value:
            continue
        seen += 1
        target = job / str(value["path"])
        if not target.is_file():
            problems.append(f"pointer-missing:{trail}: {value['path']}")
            continue
        actual = sha256_file(target)
        if actual != value["sha256"]:
            problems.append(
                f"pointer-sha:{trail}:{value['path']} "
                f"선언={value['sha256']} 실제={actual}"
            )
        declared_bytes = value.get("byteLength")
        if isinstance(declared_bytes, int):
            actual_bytes = target.stat().st_size
            if actual_bytes != declared_bytes:
                problems.append(
                    f"pointer-bytes:{trail}:{value['path']} "
                    f"선언={declared_bytes} 실제={actual_bytes}"
                )
    if seen == 0:
        problems.append("pointer-none: READY.json에 {path, sha256} 포인터가 없다")
    return problems


def check_receipts(job: Path, ready: dict) -> list[str]:
    """영수증 SHA가 실재하는 파일을 가리키는지 확인한다.

    receipt는 설계상 **앞 단계 job 디렉터리**의 산출물을 가리킨다. 따라서 현재
    packet에 없는 것은 정상이고, exchange 트리 어디에도 없을 때만 결함이다.
    controller가 손으로 옮겨 적은 값이 어떤 실제 파일과도 대응하지 않는 경우를 잡는다.
    """
    exchange = job.parent
    on_disk: dict[str, str] = {}
    for path in sorted(exchange.rglob("*")):
        if path.is_file() and path.suffix in (".json", ".jsonl", ".md", ".txt"):
            on_disk.setdefault(sha256_file(path), str(path.relative_to(exchange)))

    problems = []
    for trail, value in walk(ready):
        if not isinstance(value, str) or not SHA256.match(value):
            continue
        lowered = trail.lower()
        if "receipt" not in lowered or not lowered.endswith("sha256"):
            continue
        if value not in on_disk:
            problems.append(
                f"receipt-orphan:{trail}: {value} 와 일치하는 파일이 "
                f"exchange 트리에 없다"
            )
    return problems


def check_package_manifest(job: Path) -> list[str]:
    """PACKAGE-SHA256.txt를 디스크와 대조한다."""
    manifest = job / "PACKAGE-SHA256.txt"
    if not manifest.is_file():
        return ["package-manifest-missing: PACKAGE-SHA256.txt 없음"]
    problems = []
    for raw in manifest.read_text(encoding="utf-8").splitlines():
        raw = raw.strip()
        if not raw:
            continue
        parts = raw.split(None, 1)
        if len(parts) != 2:
            problems.append(f"package-line: 형식 불명 '{raw}'")
            continue
        digest, name = parts[0], parts[1].strip()
        target = job / name
        if not target.is_file():
            problems.append(f"package-missing: {name}")
            continue
        actual = sha256_file(target)
        if actual != digest:
            problems.append(
                f"package-sha: {name} 선언={digest} 실제={actual}"
            )
    return problems


def check_allowed_inputs(job: Path, ready: dict) -> list[str]:
    allowed = ready.get("allowedInputs")
    if not isinstance(allowed, list):
        return []
    return [
        f"allowed-missing: {name}"
        for name in allowed
        if isinstance(name, str) and not (job / name).is_file()
    ]


SUPPORTED_JOB_TYPE = "clean-room-production"


def verify(job: Path) -> int:
    ready_path = job / "READY.json"
    if not ready_path.is_file():
        print(f"FAIL ready-missing: {ready_path}")
        return 1
    ready = json.loads(ready_path.read_text(encoding="utf-8"))

    job_type = ready.get("jobType")
    if job_type != SUPPORTED_JOB_TYPE:
        # catalog-annotation 등은 packet 구조가 다르다. 다른 계약을 이 규칙으로
        # 판정하면 거짓 결함이 된다. 검사하지 않았다고 밝히고 물러난다.
        print(f"job: {ready.get('jobId', job.name)}")
        print(f"SKIP jobType='{job_type}': 이 스크립트는 '{SUPPORTED_JOB_TYPE}'만 검사한다")
        return 0

    problems: list[str] = []
    problems += check_digest_shape(ready)
    problems += check_pointers(job, ready)
    problems += check_receipts(job, ready)
    problems += check_package_manifest(job)
    problems += check_allowed_inputs(job, ready)

    print(f"job: {ready.get('jobId', job.name)}")
    print(f"role: {role_name(ready)}")
    for problem in problems:
        print(f"FAIL {problem}")
    if problems:
        print(f"\n{len(problems)}건 실패")
        return 1
    print("\nPASS 모든 SHA-256 리터럴이 디스크와 일치한다")
    return 0


# ---------------------------------------------------------------- prepare


def write_json(path: Path, payload: object) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def fill_pointers(job: Path, node: object) -> list[str]:
    """{path} 포인터의 digest를 디스크에서 채운다.

    저자가 선언한 필드만 채운다. `byteLength`를 쓰지 않은 포인터에 임의로
    추가하지 않는다. packet의 형태를 정하는 것은 저자이고 이 함수는 값만 채운다.
    """
    filled = []
    if isinstance(node, dict):
        path_value = node.get("path")
        if isinstance(path_value, str):
            target = job / path_value
            if not target.is_file():
                raise Fail(f"prepare-missing: {path_value}")
            had_bytes = "byteLength" in node
            node["sha256"] = sha256_file(target)
            if had_bytes:
                node["byteLength"] = target.stat().st_size
            filled.append(path_value)
        for value in node.values():
            filled += fill_pointers(job, value)
    elif isinstance(node, list):
        for value in node:
            filled += fill_pointers(job, value)
    return filled


def prepare(job: Path) -> int:
    """controller가 손으로 옮겨 적던 SHA 결속을 계산으로 대체한다.

    READY.json은 의미 내용만 저자가 쓰고, 모든 digest는 이 명령이 채운다.
    kh-b13 한 배치에서 controller가 손으로 적은 SHA-256 리터럴은 111개였고
    그중 하나의 전사 오류가 custodian 역할 전체를 다시 실행하게 만들었다.
    """
    ready_path = job / "READY.json"
    if not ready_path.is_file():
        raise Fail(f"prepare-ready: {ready_path} 없음")
    ready = json.loads(ready_path.read_text(encoding="utf-8"))
    if ready.get("jobType") != SUPPORTED_JOB_TYPE:
        raise Fail(f"job-type: prepare는 '{SUPPORTED_JOB_TYPE}'만 다룬다")

    allowed = ready.get("allowedInputs")
    if not isinstance(allowed, list) or not allowed:
        raise Fail("prepare-allowed: READY.allowedInputs 가 필요하다")
    generated = {"READY.json", "INPUT-MANIFEST.json", "PACKAGE-SHA256.txt"}
    contents = [name for name in allowed if name not in generated]
    for name in contents:
        if not (job / name).is_file():
            raise Fail(f"prepare-missing: {name}")

    # 1. INPUT-MANIFEST.json 을 내용 파일에서 생성한다.
    manifest = {
        "origin": ready.get("origin", "kiheon-ideation"),
        "schemaVersion": "mica.clean-room-input-manifest/v1",
        "jobId": ready.get("jobId"),
        "files": [
            {
                "path": name,
                "sha256": sha256_file(job / name),
                "byteLength": (job / name).stat().st_size,
            }
            for name in contents
        ],
    }
    write_json(job / "INPUT-MANIFEST.json", manifest)

    # 2. READY.json 의 모든 포인터를 디스크에서 채운다.
    filled = fill_pointers(job, ready)
    write_json(ready_path, ready)

    # 3. PACKAGE-SHA256.txt 는 READY.json 을 포함하므로 마지막이다.
    package_files = sorted(set(contents) | {"READY.json", "INPUT-MANIFEST.json"})
    lines = [f"{sha256_file(job / name)}  {name}" for name in package_files]
    (job / "PACKAGE-SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"job: {ready.get('jobId')}")
    print(f"내용 파일 {len(contents)}개에서 digest {len(filled) + len(package_files)}개를 계산했다")
    for name in package_files:
        print(f"  {name}")
    print()
    return verify(job)


# ---------------------------------------------------------------- freeze


def role_name(ready: dict) -> str:
    role = ready.get("role")
    if isinstance(role, dict):
        return str(role.get("name", "?"))
    return str(role or "?")


def output_spec(ready: dict) -> tuple[str, list[str]]:
    """출력 경로와 정확한 필드 순서를 READY에서 도출한다."""
    role = ready.get("role")
    if isinstance(role, dict) and "output" in role and "exactFields" in role:
        return str(role["output"]), list(role["exactFields"])
    out = ready.get("output")
    if isinstance(out, dict) and "path" in out and "exactFieldOrder" in out:
        return str(out["path"]), list(out["exactFieldOrder"])
    raise Fail("output-spec: READY에서 출력 경로와 필드 순서를 확정할 수 없다")


def find_pointer(ready: dict, *needles: str, exclude: tuple[str, ...] = ()) -> dict:
    """이름에 needle을 모두 포함하고 exclude를 하나도 포함하지 않는 포인터 하나.

    정확히 1개로 좁혀지지 않으면 추측하지 않고 fail-closed로 종료한다.
    """
    hits = []
    for trail, value in walk(ready):
        if not isinstance(value, dict) or "path" not in value:
            continue
        key = trail.lower()
        if all(n in key for n in needles) and not any(x in key for x in exclude):
            hits.append((trail, value))
    if len(hits) != 1:
        found = ", ".join(t for t, _ in hits) or "없음"
        raise Fail(
            f"pointer-ambiguous:{'+'.join(needles)}: 정확히 1개여야 하는데 {found}"
        )
    return hits[0][1]


def accepted_indexes(reviews: list[str]) -> list[int]:
    """verdict=accept 이고 모든 check가 pass인 행의 인덱스.

    verdict와 checks를 다시 판정하지 않는다. 기록된 값을 그대로 읽는다.
    """
    keep = []
    for index, raw in enumerate(reviews):
        row = json.loads(raw)
        verdict = row.get("verdict")
        checks = row.get("checks")
        if not isinstance(checks, dict) or not checks:
            raise Fail(f"review-checks: {index}행에 checks가 없다")
        all_pass = all(value == "pass" for value in checks.values())
        if verdict == "accept" and all_pass:
            keep.append(index)
        elif verdict == "accept" and not all_pass:
            raise Fail(
                f"review-inconsistent: {index}행 verdict=accept 인데 fail check가 있다"
            )
    return keep


def build_observation_rows(
    ready: dict, fields: list[str], sources: list[str], reviews: list[str],
    keep: list[int], context_id: str,
) -> list[dict]:
    rows = []
    for index in keep:
        origin = json.loads(sources[index])
        row: dict[str, object] = {}
        for field in fields:
            if field == "frozenRowSha256":
                row[field] = sha256_line(sources[index])
            elif field == "reviewRowSha256":
                row[field] = sha256_line(reviews[index])
            elif field == "frozenBy":
                row[field] = context_id
            else:
                if field not in origin:
                    raise Fail(f"field-missing: 원본 {index}행에 '{field}'가 없다")
                row[field] = origin[field]
        rows.append(row)
    return rows


def build_candidate_rows(
    ready: dict, fields: list[str], sources: list[str], reviews: list[str],
    keep: list[int], context_id: str, frozen_at: str,
) -> list[dict]:
    out = ready.get("output", {})
    receipt = find_pointer(ready, "review", "closure")
    receipt_sha = receipt["sha256"]
    rows = []
    for index in keep:
        origin = json.loads(sources[index])
        row: dict[str, object] = {}
        for field in fields:
            if field == "candidate":
                row[field] = origin
            elif field == "candidateRowSha256":
                row[field] = sha256_line(sources[index])
            elif field == "reviewRowSha256":
                row[field] = sha256_line(reviews[index])
            elif field == "taskReceiptSha256":
                row[field] = receipt_sha
            elif field == "custodianContextId":
                row[field] = context_id
            elif field == "frozenAt":
                row[field] = frozen_at
            elif field == "schemaVersion":
                row[field] = out.get("schemaVersion")
            elif field in origin:
                row[field] = origin[field]
            elif field in ready:
                row[field] = ready[field]
            else:
                raise Fail(f"field-missing: '{field}'의 값을 확정할 수 없다")
        rows.append(row)
    return rows


def render(rows: list[dict]) -> str:
    lines = [json.dumps(row, ensure_ascii=False, separators=(", ", ": ")) for row in rows]
    return "\n".join(lines) + "\n"


def freeze(job: Path, context_id: str, frozen_at: str | None, check_only: bool) -> int:
    ready = json.loads((job / "READY.json").read_text(encoding="utf-8"))
    if ready.get("jobType") != SUPPORTED_JOB_TYPE:
        raise Fail(
            f"job-type: freeze는 '{SUPPORTED_JOB_TYPE}'만 다룬다 "
            f"(이 job은 '{ready.get('jobType')}')"
        )
    if verify(job) != 0:
        print("\nfreeze 중단: packet 검증 실패. 추측하지 않는다.")
        return 1
    print()

    role = role_name(ready)
    out_path, fields = output_spec(ready)

    if context_id in (ready.get("forbiddenPriorContextIds") or []):
        raise Fail(f"context-forbidden: {context_id} 는 앞 단계 컨텍스트다")

    if role == "observationCustodian":
        source_ptr = find_pointer(
            ready, "observation", exclude=("review", "closure")
        )
        review_ptr = find_pointer(
            ready, "observation", "review", exclude=("closure",)
        )
    elif role == "candidateCustodian":
        source_ptr = find_pointer(ready, "candidatepacket")
        review_ptr = find_pointer(ready, "candidatereviewpacket")
    else:
        raise Fail(f"role-unsupported: '{role}' 는 이 스크립트가 다루지 않는다")

    sources = read_rows(job / source_ptr["path"])
    reviews = read_rows(job / review_ptr["path"])
    if len(sources) != len(reviews):
        raise Fail(
            f"row-mismatch: 원본 {len(sources)}행 vs review {len(reviews)}행"
        )

    keep = accepted_indexes(reviews)

    if role == "observationCustodian":
        rows = build_observation_rows(
            ready, fields, sources, reviews, keep, context_id
        )
    else:
        if frozen_at is None:
            raise Fail("frozen-at: candidate freeze는 --at 이 필요하다")
        rows = build_candidate_rows(
            ready, fields, sources, reviews, keep, context_id, frozen_at
        )

    payload = render(rows)
    target = job / out_path

    print(f"role: {role}")
    print(f"입력 {len(sources)}행 → 수락 {len(keep)}행 → 제외 {len(sources) - len(keep)}행")
    for index in keep:
        row = json.loads(sources[index])
        ident = row.get("observationId") or row.get("candidateId") or f"#{index}"
        print(f"  freeze {ident}")

    if check_only:
        if not target.is_file():
            print(f"\nFAIL check: {out_path} 없음")
            return 1
        existing = target.read_text(encoding="utf-8")
        if existing == payload:
            print(f"\nPASS check: {out_path} 재현 일치 ({len(payload)} bytes)")
            return 0
        print(f"\nFAIL check: {out_path} 재현 불일치")
        print(f"  기존 {len(existing)} bytes sha={sha256_bytes(existing.encode())}")
        print(f"  재현 {len(payload)} bytes sha={sha256_bytes(payload.encode())}")
        return 1

    if target.exists():
        print(f"\nFAIL exists: {out_path} 가 이미 있다. 덮어쓰지 않는다.")
        return 1
    target.write_text(payload, encoding="utf-8")
    print(f"\nwrote {out_path}")
    print(f"  sha256 {sha256_file(target)}")
    print(f"  bytes  {target.stat().st_size}")
    print(f"  rows   {len(rows)}")
    return 0


# ---------------------------------------------------------------- cli


def main() -> int:
    parser = argparse.ArgumentParser(
        description="MICA clean-room packet 검증과 accepted-only 동결"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("prepare", help="내용 파일에서 INPUT-MANIFEST·READY digest·PACKAGE를 계산")
    p.add_argument("job")

    v = sub.add_parser("verify", help="packet의 모든 SHA-256을 재계산해 대조 (읽기 전용)")
    v.add_argument("job")

    f = sub.add_parser("freeze", help="review verdict에서 accepted-only 동결을 도출")
    f.add_argument("job")
    f.add_argument("--context-id", required=True, help="현재 custodian 세션의 실제 context ID")
    f.add_argument("--at", help="frozenAt 의 UTC ISO-8601 (candidate freeze 필수)")
    f.add_argument("--check", action="store_true", help="쓰지 않고 기존 출력과 재현 대조")

    args = parser.parse_args()
    job = Path(args.job).resolve()
    if not job.is_dir():
        print(f"FAIL job-missing: {job}")
        return 1

    try:
        if args.command == "prepare":
            return prepare(job)
        if args.command == "verify":
            return verify(job)
        return freeze(job, args.context_id, args.at, args.check)
    except Fail as exc:
        print(f"FAIL {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
