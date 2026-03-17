#!/usr/bin/env python3
"""
Interactively fix composers with unknown nationality (XX) in the database.

Usage:
    python3 scripts/fix_nationalities.py
"""

import psycopg2

DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "composerguesser",
    "user":     "composerguesser",
    "password": "composerguesser",
}

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute(
        "SELECT composer_id, complete_name FROM tbl_composer WHERE nationality = 'XX' ORDER BY complete_name"
    )
    composers = cur.fetchall()

    if not composers:
        print("No composers with unknown nationality. All done!")
        cur.close()
        conn.close()
        return

    print(f"{len(composers)} composer(s) with unknown nationality.")
    print("Enter an ISO 3166-1 alpha-2 country code (e.g. DE, FR, US).")
    print("Press Enter to skip, or Ctrl+C to quit.\n")

    fixed = 0
    for composer_id, name in composers:
        while True:
            code = input(f"{name}: ").strip().upper()
            if code == "":
                print("  Skipped.\n")
                break
            if len(code) == 2 and code.isalpha():
                cur.execute(
                    "UPDATE tbl_composer SET nationality = %s WHERE composer_id = %s",
                    (code, composer_id),
                )
                conn.commit()
                fixed += 1
                print(f"  Set to {code}.\n")
                break
            print("  Invalid code — must be exactly 2 letters (e.g. DE, FR). Try again.")

    print(f"Done. {fixed} composer(s) updated.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nQuitting.")
