#!/usr/bin/env python3
"""
Scan assets/ for files like photo_2025-05-05_06-01-01.jpg
and write data.json with web‑friendly URLs.
"""

import json, re, sys
from pathlib import Path
from urllib.parse import quote  # NEW – makes safe URLs

ROOT        = Path(__file__).parent          # project root
ASSET_DIR   = ROOT / "assets"
OUTPUT_FILE = ROOT / "data.json"
IMG_EXTS    = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}

FILE_RX = re.compile(
    r".*?(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})(?:-(\d{2}))?\.(?:jpe?g|png|gif|webp|avif)$",
    re.IGNORECASE,
)

def main() -> None:
    if not ASSET_DIR.exists():
        sys.exit(f"❌  Folder not found: {ASSET_DIR}")

    records = []
    for path in ASSET_DIR.rglob("*"):
        if path.suffix.lower() not in IMG_EXTS:
            continue
        m = FILE_RX.match(path.name)
        if not m:
            print(f"⚠️  Skipped (name doesn’t match pattern): {path}")
            continue

        year, month, day, hour, minute = m.group(1, 2, 3, 4, 5)

        # ── NEW ── path as the browser needs it (relative to web root)
        rel = path.relative_to(ROOT).as_posix()     # e.g. assets/foo.jpg
        url = "/" + quote(rel)                      #  → /assets/foo.jpg

        records.append(
            {
                "year": year,
                "month": month,
                "day": day,
                "hour": hour,
                "minute": minute,
                "path": rel,   # keeps the plain path if you still need it
                "url":  url    # ← use this in app.js
            }
        )

    records.sort(key=lambda r: (r["year"], r["month"], r["day"], r["hour"], r["minute"]))
    OUTPUT_FILE.write_text(json.dumps(records, indent=2))
    print(f"✅  Wrote {len(records)} records → {OUTPUT_FILE.relative_to(Path.cwd())}")

if __name__ == "__main__":
    main()
