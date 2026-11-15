
from pathlib import Path
import sqlite3
import apsw

SOURCE = Path("field_shift.db")
DESTINATION = Path("field_shift_apsw_recovered.db")


def main():
    if not SOURCE.exists():
        print("ERROR: Original database not found.")
        return

    if DESTINATION.exists():
        print("ERROR: Recovery destination already exists.")
        print("Do not overwrite it. Rename it before retrying.")
        return

    print("Starting SQLite recovery...")
    print("Original database will not be modified.")

    try:
        connection = apsw.Connection(str(SOURCE), flags=apsw.SQLITE_OPEN_READONLY)

        cursor = connection.cursor()

        recovery_sql = """
        SELECT name, sql
        FROM sqlite_master
        WHERE type = 'table'
        """

        try:
            print("Checking readable tables...")
            for row in cursor.execute(recovery_sql):
                print(row)
        except apsw.Error as exc:
            print("Normal table inspection failed:", exc)

        connection.close()

        print("\nIMPORTANT:")
        print("This APSW build has the shell module, but the Python shell")
        print("does not necessarily expose SQLite's .recover command.")
        print("No recovery file has been created by this script.")
        print("\nNext, we will check the exact recovery command available.")

    except apsw.Error as exc:
        print("APSW error:", exc)


if __name__ == "__main__":
    main()

