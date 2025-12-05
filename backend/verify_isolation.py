from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
import models, crud, schemas
from datetime import datetime

# Setup in-memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify():
    Base.metadata.create_all(bind=engine)
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
        description="User A Expense",
        amount=100.0,
        source="Test",
        transaction_hash="hash_a"
    )
    crud.create_expense(db, expense_data, user_id=user_a.id)
    print("Created expense for User A")

    # Verify User A sees it
    expenses_a = crud.get_expenses(db, user_id=user_a.id)
    print(f"User A sees {len(expenses_a)} expenses")
    if len(expenses_a) != 1:
        print("FAIL: User A should see 1 expense")
    else:
        print("PASS: User A sees their expense")

    # Verify User B sees nothing
    expenses_b = crud.get_expenses(db, user_id=user_b.id)
    print(f"User B sees {len(expenses_b)} expenses")
    if len(expenses_b) != 0:
        print("FAIL: User B should see 0 expenses")
    else:
        print("PASS: User B sees no expenses")

    db.close()

if __name__ == "__main__":
    verify()
