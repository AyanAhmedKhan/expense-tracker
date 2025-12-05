from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/summary",
    tags=["summary"]
)

@router.get("/")
def get_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_spent = db.query(func.sum(models.Expense.amount)).filter(models.Expense.user_id == current_user.id).scalar() or 0.0
    total_reimbursed = db.query(func.sum(models.Expense.reimbursed_amount)).filter(models.Expense.user_id == current_user.id).scalar() or 0.0
    total_pending = total_spent - total_reimbursed
    
    last_reimbursement = db.query(models.Reimbursement).filter(models.Reimbursement.user_id == current_user.id).order_by(models.Reimbursement.date.desc()).first()
    
    return {
        "total_spent": total_spent,
        "total_reimbursed": total_reimbursed,
        "total_pending": total_pending,
        "last_reimbursement_date": last_reimbursement.date if last_reimbursement else None,
        "expenses_covered_last_time": [] 
    }
