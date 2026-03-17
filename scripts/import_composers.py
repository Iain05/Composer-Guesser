#!/usr/bin/env python3
"""
Import composers and their works from dump.json into the database.

Composers whose epoch doesn't map to our Era enum (Medieval, Renaissance,
Post-War, 21st Century) are skipped.

Nationality is fetched from the MusicBrainz API. Composers where MusicBrainz
returns no country are imported with nationality = 'XX'.

Requirements:
    pip install psycopg2-binary requests

Usage:
    python3 scripts/import_composers.py
"""

import json
import time
import sys
from pathlib import Path

import psycopg2
import requests

# ─── Config ──────────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "composerguesser",
    "user":     "composerguesser",
    "password": "composerguesser",
}

DUMP_FILE = Path(__file__).parent.parent / "dump.json"

MUSICBRAINZ_URL = "https://musicbrainz.org/ws/2/artist/"
MUSICBRAINZ_HEADERS = {
    "User-Agent": "ComposerGuesser/1.0 (https://github.com/composerguesser)"
}
MUSICBRAINZ_RATE_LIMIT = 1.1  # seconds between requests

EPOCH_MAP = {
    "Baroque":        "BAROQUE",
    "Classical":      "CLASSICAL",
    "Early Romantic": "EARLY_ROMANTIC",
    "Romantic":       "ROMANTIC",
    "Late Romantic":  "LATE_ROMANTIC",
    "20th Century":   "_20TH_CENTURY",
}

SKIPPED_EPOCHS = {"Medieval", "Renaissance", "Post-War", "21st Century"}

# ─── MusicBrainz lookup ──────────────────────────────────────────────────────

def fetch_nationality(complete_name: str) -> str:
    """Return ISO 3166-1 alpha-2 country code, or 'XX' if not found."""
    try:
        resp = requests.get(
            MUSICBRAINZ_URL,
            params={"query": f'artist:"{complete_name}"', "fmt": "json"},
            headers=MUSICBRAINZ_HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
        artists = resp.json().get("artists", [])

        for artist in artists:
            if artist.get("type") != "Person":
                continue
            score = int(artist.get("score", 0))
            if score < 70:
                break  # results are sorted by score descending

            country = artist.get("country")
            if country:
                return country

            # fallback: area ISO codes
            area_codes = (
                artist.get("area", {})
                      .get("iso-3166-1-codes", [])
            )
            if area_codes:
                return area_codes[0]

    except Exception as e:
        print(f"    MusicBrainz error for '{complete_name}': {e}")

    return "XX"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def extract_year(date_str: str | None) -> int | None:
    if date_str:
        return int(date_str[:4])
    return None

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"Loading {DUMP_FILE}...")
    with open(DUMP_FILE, encoding="utf-8") as f:
        data = json.load(f)

    composers = data["composers"]
    mappable = [c for c in composers if c["epoch"] in EPOCH_MAP]
    skipped  = [c for c in composers if c["epoch"] in SKIPPED_EPOCHS]
    unknown  = [c for c in composers if c["epoch"] not in EPOCH_MAP and c["epoch"] not in SKIPPED_EPOCHS]

    print(f"  Total composers: {len(composers)}")
    print(f"  To import:       {len(mappable)}")
    print(f"  Skipped (epoch): {len(skipped)} "
          f"({', '.join(sorted({c['epoch'] for c in skipped}))})")
    if unknown:
        print(f"  Unknown epoch:   {[c['epoch'] for c in unknown]}")
    print()

    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    print("Clearing existing data (tbl_composer_work → tbl_composer)...")
    cur.execute("TRUNCATE TABLE tbl_composer_work, tbl_composer RESTART IDENTITY CASCADE")
    conn.commit()
    print("  Done.\n")

    total_works = 0
    failed_nationality = []

    for i, composer in enumerate(mappable, 1):
        name          = composer["complete_name"]
        last_name     = composer["name"]
        epoch         = composer["epoch"]
        era           = EPOCH_MAP[epoch]
        birth_year    = extract_year(composer.get("birth"))
        death_year    = extract_year(composer.get("death"))
        works         = composer.get("works", [])

        print(f"[{i}/{len(mappable)}] {name} ({epoch})")

        print(f"    Fetching nationality from MusicBrainz...")
        nationality = fetch_nationality(name)
        time.sleep(MUSICBRAINZ_RATE_LIMIT)

        if nationality == "XX":
            failed_nationality.append(name)
            print(f"    ⚠ No nationality found — using 'XX'")
        else:
            print(f"    Country: {nationality}")

        cur.execute(
            """
            INSERT INTO tbl_composer
                (complete_name, last_name, birth_year, death_year, era, nationality)
            VALUES (%s, %s, %s, %s, %s::era_type, %s)
            RETURNING composer_id
            """,
            (name, last_name, birth_year, death_year, era, nationality),
        )
        composer_id = cur.fetchone()[0]

        for work in works:
            cur.execute(
                """
                INSERT INTO tbl_composer_work (composer_id, title, genre)
                VALUES (%s, %s, %s)
                """,
                (composer_id, work["title"], work.get("genre")),
            )

        print(f"    Inserted {len(works)} works.")
        total_works += len(works)
        conn.commit()

    print()
    print("═" * 50)
    print(f"Import complete.")
    print(f"  Composers imported: {len(mappable)}")
    print(f"  Works imported:     {total_works}")

    if failed_nationality:
        print(f"\n  ⚠ Composers with unknown nationality ({len(failed_nationality)}):")
        for n in failed_nationality:
            print(f"    - {n}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
