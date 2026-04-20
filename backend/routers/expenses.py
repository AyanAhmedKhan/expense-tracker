from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, models, schemas
from database import get_db
from routers.auth import get_current_user
import csv
import io

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
    category_id: Optional[int] = None,
    is_recurring: Optional[bool] = None,
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
        user_id=current_user.id,
        category_id=category_id,
        is_recurring=is_recurring
    )
    return expenses

@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_expense(db, expense, user_id=current_user.id)

@router.put("/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, data: schemas.ExpenseUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.update_expense(db, expense_id, data, user_id=current_user.id)

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_expense(db, expense_id, user_id=current_user.id)

@router.post("/bulk-delete")
def bulk_delete_expenses(body: schemas.BulkDeleteRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_expenses_bulk(db, body.expense_ids, user_id=current_user.id)

@router.get("/export")
def export_expenses_csv(
    q: Optional[str] = None,
    status: Optional[models.ExpenseStatus] = None,
    source: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    sort_by: Optional[str] = "date",
    order: Optional[str] = "desc",
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from datetime import datetime
    from_date_dt = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
    to_date_dt = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None
    
    expenses = crud.get_expenses(
        db, skip=0, limit=10000,
        q=q, status=status, source=source,
        min_amount=min_amount, max_amount=max_amount,
        from_date=from_date_dt, to_date=to_date_dt,
        sort_by=sort_by, order=order,
        user_id=current_user.id, category_id=category_id
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Amount", "Type", "Status", "Category", "Recurring", "Source"])
    
    for e in expenses:
        cat_name = e.category.name if e.category else ""
        writer.writerow([
            e.date.strftime("%Y-%m-%d") if e.date else "",
            e.description,
            e.amount,
            "Credit" if e.amount < 0 else "Debit",
            e.status.value if e.status else "",
            cat_name,
            "Yes" if e.is_recurring else "No",
            e.source or ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )

@router.post("/detect-recurring")
def detect_recurring(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.detect_recurring_expenses(db, user_id=current_user.id)
