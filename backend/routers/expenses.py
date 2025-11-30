from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
import crud, models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/expenses",
    tags=["expenses"]
)

@router.get("/", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    status: Optional[models.ExpenseStatus] = None,
    source: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    sort_by: Optional[str] = "date",
    order: Optional[str] = "desc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Convert date strings to datetime if provided
    from datetime import datetime
    from_date_dt = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
    to_date_dt = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None
    expenses = crud.get_expenses(
        db,
        skip=skip,
        limit=limit,
        q=q,
        status=status,
        source=source,
        min_amount=min_amount,
        max_amount=max_amount,
        from_date=from_date_dt,
        to_date=to_date_dt,
        sort_by=sort_by,
        order=order,
    )
    return expenses

@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_expense(db, expense)
