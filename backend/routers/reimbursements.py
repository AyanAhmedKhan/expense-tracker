from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/reimbursements",
    tags=["reimbursements"]
)

@router.post("/", response_model=schemas.Reimbursement)
def create_reimbursement(reimbursement: schemas.ReimbursementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_reimbursement(db, reimbursement, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Reimbursement])
def read_reimbursements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_reimbursements(db, skip=skip, limit=limit, user_id=current_user.id)

@router.get("/{reimbursement_id}/items")
def read_reimbursement_items(reimbursement_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = crud.get_reimbursement_items(db, reimbursement_id)
    if items is None:
        raise HTTPException(status_code=404, detail="Reimbursement not found")
    return items
