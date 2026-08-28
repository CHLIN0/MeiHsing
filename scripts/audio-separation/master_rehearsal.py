#!/usr/bin/env python3
"""Create and verify a reproducible rehearsal master with FFmpeg."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, check=True, capture_output=True, text=True)


def parse_loudnorm(stderr: str) -> dict[str, str]:
    matches = re.findall(r'\{\s*"input_i".*?\}', stderr, flags=re.DOTALL)
    if not matches:
        raise RuntimeError("FFmpeg did not return loudnorm JSON")
    return json.loads(matches[-1])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--duration", type=float, default=139.5)
    parser.add_argument("--fade-start", type=float, default=138.0)
    parser.add_argument("--target-lufs", type=float, default=-16.0)
    parser.add_argument("--target-peak", type=float, default=-1.0)
    parser.add_argument("--target-lra", type=float, default=11.0)
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)

    fade_duration = max(0.0, args.duration - args.fade_start)
    preparation_filters = [f"atrim=end={args.duration}"]
    if fade_duration > 0:
        preparation_filters.append(
            f"afade=t=out:st={args.fade_start}:d={fade_duration}"
        )
    trim_and_fade = ",".join(preparation_filters)
    target = (
        f"I={args.target_lufs}:TP={args.target_peak}:LRA={args.target_lra}"
    )

    first_pass = run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(args.input),
        "-af", f"{trim_and_fade},loudnorm={target}:print_format=json",
        "-f", "null", "-",
    ])
    measured = parse_loudnorm(first_pass.stderr)

    second_filter = (
        f"{trim_and_fade},loudnorm={target}:"
        f"measured_I={measured['input_i']}:"
        f"measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:"
        f"measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}:linear=true:print_format=summary"
    )
    run([
        "ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(args.input),
        "-af", second_filter,
        "-ar", "44100", "-ac", "2", "-c:a", "pcm_s24le", str(args.output),
    ])

    verification = run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(args.output),
        "-af", f"loudnorm={target}:print_format=json",
        "-f", "null", "-",
    ])
    verified = parse_loudnorm(verification.stderr)

    report = {
        "input": str(args.input),
        "input_sha256": sha256(args.input),
        "output": str(args.output),
        "output_sha256": sha256(args.output),
        "parameters": {
            "duration_seconds": args.duration,
            "fade_start_seconds": args.fade_start,
            "fade_duration_seconds": fade_duration,
            "target_lufs": args.target_lufs,
            "target_true_peak_db": args.target_peak,
            "target_lra_lu": args.target_lra,
            "sample_rate_hz": 44100,
            "channels": 2,
            "codec": "pcm_s24le",
            "normalization": "FFmpeg loudnorm two-pass linear",
        },
        "first_pass": measured,
        "verification": verified,
    }
    if args.report:
        args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
