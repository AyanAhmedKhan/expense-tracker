from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Auto-seed default categories if user has none
    crud.seed_default_categories(db, user_id=current_user.id)
    return crud.get_categories(db, user_id=current_user.id)

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_category(db, category, user_id=current_user.id)

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_category(db, category_id, user_id=current_user.id)

# ── Auto-Tag Rules ──

@router.get("/auto-tag-rules", response_model=List[schemas.AutoTagRule])
def read_auto_tag_rules(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_auto_tag_rules(db, user_id=current_user.id)

@router.post("/auto-tag-rules", response_model=schemas.AutoTagRule)
def create_auto_tag_rule(rule: schemas.AutoTagRuleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_auto_tag_rule(db, rule, user_id=current_user.id)

@router.delete("/auto-tag-rules/{rule_id}")
def delete_auto_tag_rule(rule_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.delete_auto_tag_rule(db, rule_id, user_id=current_user.id)
