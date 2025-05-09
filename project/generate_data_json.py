#!/usr/bin/env python3
"""
Walk through assets/ and build one JSON file per day + a master dates list.
"""
import json, re, sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

ROOT      = Path(__file__).parent
ASSET_DIR = ROOT / "assets"
OUT_DIR   = ROOT / "daily_json"
IMG_EXTS  = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}

NAME_RX = re.compile(
    r".*?(?P<Y>\d{4})-(?P<M>\d{2})-(?P<D>\d{2})_(?P<h>\d{2})-(?P<m>\d{2})(?:-(?P<s>\d{2}))?"
    r"\.(?:jpe?g|png|gif|webp|avif)$",
    re.IGNORECASE,
)

def main() -> None:
    if not ASSET_DIR.exists():
        sys.exit(f"❌  Folder not found: {ASSET_DIR}")

    daily: dict[str, list] = defaultdict(list)

    for p in ASSET_DIR.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in IMG_EXTS:
            continue
        m = NAME_RX.match(p.name)
        if not m:
            print("⚠️  skip", p)
            continue

        g = m.groupdict()
        g["s"] = g["s"] or "00"                # pad missing seconds
        iso = f'{g["Y"]}-{g["M"]}-{g["D"]}'

        rel = p.relative_to(ROOT).as_posix()
        daily[iso].append({
            "year":   g["Y"],  "month": g["M"],  "day": g["D"],
            "hour":   g["h"],  "minute": g["m"], "second": g["s"],
            "path":   rel,
            "url":    "/" + quote(rel),
            "timeMinutes": int(g["h"]) * 60 + int(g["m"]),
        })

    OUT_DIR.mkdir(exist_ok=True)
    for iso, rec in daily.items():
        rec.sort(key=lambda r: (r["hour"], r["minute"], r["second"]))
        (OUT_DIR / f"{iso}.json").write_text(json.dumps(rec, indent=2))

    # NEW: master list for the front end
    dates_path = OUT_DIR / "dates.json"
    dates_path.write_text(json.dumps(sorted(daily.keys()), indent=2))
    print(f"✅  {len(daily)} days → {OUT_DIR}  (+ {dates_path.name})")

if __name__ == "__main__":
    main()
