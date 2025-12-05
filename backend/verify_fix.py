from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, crud, schemas
from datetime import datetime

# Setup in-memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_fix():
    # Re-create tables based on current models (which now have the fix)
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
        print("PASS: Created expense for User B. The fix is working!")
    except Exception as e:
        print(f"FAIL: Could not create expense for User B: {e}")

    db.close()

if __name__ == "__main__":
    verify_fix()
