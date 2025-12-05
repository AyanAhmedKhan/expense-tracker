import sqlite3
import os

DB_FILE = "sql_app.db"

def migrate():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    tables = ["expenses", "reimbursements", "statement_uploads"]
    
    for table in tables:
        print(f"Checking table {table}...")
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [info[1] for info in cursor.fetchall()]
            
            if "user_id" not in columns:
                print(f"Adding user_id column to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER REFERENCES users(id)")
                print(f"Added user_id to {table}.")
            else:
                print(f"Column user_id already exists in {table}.")
        except Exception as e:
            print(f"Error checking/migrating table {table}: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
