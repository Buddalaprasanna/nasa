
import sqlite3
from pathlib import Path

SOURCE = Path("field_shift.db")
BACKUP = Path("field_shift_backup.db")
RECOVERED = Path("field_shift_recovered.db")


def recover_database(source, destination):
    if not source.exists():
        print(f"ERROR: {source} was not found.")
        return False

    if destination.exists():
        print(f"ERROR: {destination} already exists.")
        print("Rename or move the existing recovery file before retrying.")
        return False

    print(f"Attempting recovery from: {source}")

    try:
        source_uri = f"{source.resolve().as_uri()}?mode=ro"
        src = sqlite3.connect(source_uri, uri=True)
        dst = sqlite3.connect(destination)

        try:
            result = src.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
            print("Source tables readable:", result)
        except sqlite3.DatabaseError as exc:
            print("Normal table listing failed:", exc)

        try:
            src.backup(dst)
            print("SQLite backup API completed.")
        except sqlite3.DatabaseError as exc:
            print("SQLite backup API could not recover the file:", exc)

        dst.close()
        src.close()

        if not destination.exists() or destination.stat().st_size == 0:
            print("No usable recovery file was created.")
            return False

        check = sqlite3.connect(destination)
        try:
            integrity = check.execute("PRAGMA integrity_check").fetchall()
            tables = check.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()

            print("Recovered database integrity:", integrity)
            print("Recovered tables:", tables)
        finally:
            check.close()

        return True

    except Exception as exc:
        print("Recovery failed:", repr(exc))
        return False


if __name__ == "__main__":
    print("Original database:", SOURCE.exists())
    print("Backup database:", BACKUP.exists())

    recover_database(SOURCE, RECOVERED)
