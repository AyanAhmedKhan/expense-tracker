from sqlalchemy import create_engine, Column, String, Integer, UniqueConstraint
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError
import models, crud, schemas
from datetime import datetime

# Setup in-memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def reproduce():
    # Re-create tables based on current models
    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create users
    user_a = models.User(email="a@test.com", name="User A")
    user_b = models.User(email="b@test.com", name="User B")
    db.add(user_a)
    db.add(user_b)
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)

    print(f"Created User A (id={user_a.id}) and User B (id={user_b.id})")

    # Create expense for User A
    expense_data = schemas.ExpenseCreate(
        date=datetime.now(),
        description="Shared Expense",
        amount=100.0,
        source="Test",
        transaction_hash="shared_hash"
    )
    crud.create_expense(db, expense_data, user_id=user_a.id)
    print("Created expense for User A")

    # Try to create SAME expense for User B
    print("Attempting to create same expense for User B...")
    try:
        crud.create_expense(db, expense_data, user_id=user_b.id)
        print("SUCCESS: Created expense for User B (Unexpected if constraint is global)")
    except IntegrityError:
        print("FAIL: IntegrityError caught! Global unique constraint prevented User B from having the same transaction hash.")
    except Exception as e:
        print(f"FAIL: Other error: {e}")

    db.close()

if __name__ == "__main__":
    reproduce()
