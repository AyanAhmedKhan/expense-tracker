from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime

def get_expense_by_hash(db: Session, transaction_hash: str, user_id: int):
    return db.query(models.Expense).filter(models.Expense.transaction_hash == transaction_hash, models.Expense.user_id == user_id).first()

def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int):
    db_expense = models.Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    q: str = None,
    status: models.ExpenseStatus = None,
    source: str = None,
    min_amount: float = None,
    max_amount: float = None,
    from_date: datetime = None,
    to_date: datetime = None,
    sort_by: str = "date",
    order: str = "desc",
    user_id: int = None
):
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    if q:
        query = query.filter(models.Expense.description.ilike(f"%{q}%"))
    if status:
        query = query.filter(models.Expense.status == status)
    if source:
        query = query.filter(models.Expense.source == source)
    if min_amount is not None:
        query = query.filter(models.Expense.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(models.Expense.amount <= max_amount)
    if from_date:
        query = query.filter(models.Expense.date >= from_date)
    if to_date:
        query = query.filter(models.Expense.date <= to_date)
    sort_col = {
        "date": models.Expense.date,
        "amount": models.Expense.amount,
        "created_at": models.Expense.created_at,
        "description": models.Expense.description,
    }.get(sort_by, models.Expense.date)
    if order.lower() == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())
    return query.offset(skip).limit(limit).all()

def create_reimbursement(db: Session, reimbursement: schemas.ReimbursementCreate, user_id: int):
    # Calculate total amount from selected expenses
    expenses = db.query(models.Expense).filter(models.Expense.id.in_(reimbursement.expense_ids), models.Expense.user_id == user_id).all()
    # Only reimburse debits (positive amount) with remaining balance
    applicable = [
        e for e in expenses
        if (e.amount > 0) and (e.amount - e.reimbursed_amount > 0)
    ]
    total_amount = sum(e.amount - e.reimbursed_amount for e in applicable)
    if total_amount <= 0 or not applicable:
        # Nothing to reimburse
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No reimbursable expenses selected")
    
    db_reimbursement = models.Reimbursement(
        amount=total_amount,
        note=reimbursement.note,
        date=datetime.utcnow(),
        user_id=user_id
    )
    db.add(db_reimbursement)
    db.commit()
    db.refresh(db_reimbursement)

    # Update expenses and create coverage
    for expense in applicable:
        amount_to_cover = expense.amount - expense.reimbursed_amount
        if amount_to_cover > 0:
            expense.status = models.ExpenseStatus.REIMBURSED
            expense.reimbursed_amount = expense.amount
            
            coverage = models.ReimbursementCoverage(
                reimbursement_id=db_reimbursement.id,
                expense_id=expense.id,
                amount_applied=amount_to_cover
            )
            db.add(coverage)
    
    db.commit()
    return db_reimbursement

def get_reimbursements(db: Session, skip: int = 0, limit: int = 100, user_id: int = None):
    return db.query(models.Reimbursement).filter(models.Reimbursement.user_id == user_id).offset(skip).limit(limit).all()

def get_reimbursement_items(db: Session, reimbursement_id: int):
    # Join coverage with expenses
    from sqlalchemy.orm import joinedload
    coverages = db.query(models.ReimbursementCoverage).filter(models.ReimbursementCoverage.reimbursement_id == reimbursement_id).all()
    expense_ids = [c.expense_id for c in coverages]
    expenses = db.query(models.Expense).filter(models.Expense.id.in_(expense_ids)).all()
    # Map applied amount
    applied_map = {c.expense_id: c.amount_applied for c in coverages}
    # Return enriched dicts
    return [
        {
            "id": e.id,
            "date": e.date,
            "description": e.description,
            "amount": e.amount,
            "applied": applied_map.get(e.id, 0.0),
            "source": e.source,
        }
    for e in expenses]

def create_statement_upload(db: Session, upload: schemas.StatementUploadBase, user_id: int):
    db_upload = models.StatementUpload(**upload.dict(), user_id=user_id)
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload
