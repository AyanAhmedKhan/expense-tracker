"""
Migration script: Add category_id, is_recurring columns to expenses table,
and create categories table on Neon PostgreSQL.
Safe to run multiple times — uses IF NOT EXISTS / IF NOT EXISTS checks.
"""
import os
import sys
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    # 1. Create categories table
    """
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        color VARCHAR DEFAULT '#6366f1',
        icon VARCHAR DEFAULT 'tag',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(name, user_id)
    );
    """,
    # 2. Add category_id to expenses (if not exists)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='expenses' AND column_name='category_id'
        ) THEN
            ALTER TABLE expenses ADD COLUMN category_id INTEGER REFERENCES categories(id);
        END IF;
    END $$;
    """,
    # 3. Add is_recurring to expenses (if not exists)
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='expenses' AND column_name='is_recurring'
        ) THEN
            ALTER TABLE expenses ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
        END IF;
    END $$;
    """,
]

def run_migrations():
    print(f"Connecting to: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    with engine.connect() as conn:
        for i, sql in enumerate(MIGRATIONS, 1):
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"  Migration {i}/{len(MIGRATIONS)}: OK")
            except Exception as e:
                print(f"  Migration {i}/{len(MIGRATIONS)}: FAILED - {e}")
                sys.exit(1)
    print("All migrations complete!")

if __name__ == "__main__":
    run_migrations()
