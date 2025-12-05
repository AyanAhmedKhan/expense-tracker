import sqlite3
import os

DB_FILE = "sql_app.db"

def migrate():
    if not os.path.exists(DB_FILE):
        print(f"Database file {DB_FILE} not found.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 1. Drop the old unique index on transaction_hash
    print("Dropping old unique index on transaction_hash...")
    try:
        # The index name is usually automatically generated. 
        # We can try to find it or just try to drop the likely name.
        # SQLAlchemy usually names it 'ix_expenses_transaction_hash'
        cursor.execute("DROP INDEX IF EXISTS ix_expenses_transaction_hash")
        print("Dropped index ix_expenses_transaction_hash.")
    except Exception as e:
        print(f"Error dropping index: {e}")

    # 2. Create the new composite unique index
    print("Creating new composite unique index...")
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS uix_expense_hash_user ON expenses (transaction_hash, user_id)")
        print("Created index uix_expense_hash_user.")
    except Exception as e:
        print(f"Error creating index: {e}")
        
    # 3. Re-create the simple index on transaction_hash (non-unique) for performance
    print("Creating non-unique index on transaction_hash...")
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_expenses_transaction_hash ON expenses (transaction_hash)")
        print("Created index ix_expenses_transaction_hash.")
    except Exception as e:
        print(f"Error creating index: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
