from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
import models, schemas
from datetime import datetime, timedelta

# ──────────────────────────────────────
# EXPENSES
# ──────────────────────────────────────

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
    user_id: int = None,
    category_id: int = None,
    is_recurring: bool = None
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
    if category_id is not None:
        query = query.filter(models.Expense.category_id == category_id)
    if is_recurring is not None:
        query = query.filter(models.Expense.is_recurring == is_recurring)
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

def get_expenses_paginated(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    q: str = None,
    status: models.ExpenseStatus = None,
    source: str = None,
    min_amount: float = None,
    max_amount: float = None,
    from_date: datetime = None,
    to_date: datetime = None,
    sort_by: str = "date",
    order: str = "desc",
    user_id: int = None,
    category_id: int = None,
    is_recurring: bool = None
):
    """Return paginated expenses with total count."""
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
    if category_id is not None:
        query = query.filter(models.Expense.category_id == category_id)
    if is_recurring is not None:
        query = query.filter(models.Expense.is_recurring == is_recurring)

    total = query.count()

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

    import math
    skip = (page - 1) * per_page
    items = query.offset(skip).limit(per_page).all()
    pages = math.ceil(total / per_page) if per_page > 0 else 1

    return {"items": items, "total": total, "page": page, "pages": pages, "per_page": per_page}

def delete_expense(db: Session, expense_id: int, user_id: int):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    # Also remove any reimbursement coverage rows
    db.query(models.ReimbursementCoverage).filter(
        models.ReimbursementCoverage.expense_id == expense_id
    ).delete()
    db.delete(expense)
    db.commit()
    return {"deleted": True}

def delete_expenses_bulk(db: Session, expense_ids: list, user_id: int):
    expenses = db.query(models.Expense).filter(
        models.Expense.id.in_(expense_ids),
        models.Expense.user_id == user_id
    ).all()
    if not expenses:
        raise HTTPException(status_code=404, detail="No matching expenses found")
    deleted_ids = [e.id for e in expenses]
    # Remove coverage rows
    db.query(models.ReimbursementCoverage).filter(
        models.ReimbursementCoverage.expense_id.in_(deleted_ids)
    ).delete(synchronize_session=False)
    for e in expenses:
        db.delete(e)
    db.commit()
    return {"deleted": len(deleted_ids), "ids": deleted_ids}

def delete_all_expenses(db: Session, user_id: int):
    """Delete ALL expenses for a user. Nuclear option."""
    # Remove all coverage rows first
    expense_ids = [e.id for e in db.query(models.Expense.id).filter(models.Expense.user_id == user_id).all()]
    if expense_ids:
        db.query(models.ReimbursementCoverage).filter(
            models.ReimbursementCoverage.expense_id.in_(expense_ids)
        ).delete(synchronize_session=False)
    count = db.query(models.Expense).filter(models.Expense.user_id == user_id).delete(synchronize_session=False)
    db.commit()
    return {"deleted": count}

def update_expense(db: Session, expense_id: int, data: schemas.ExpenseUpdate, user_id: int):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense

def detect_recurring_expenses(db: Session, user_id: int):
    """Detect recurring expenses: descriptions appearing >= 3 times in last 90 days."""
    cutoff = datetime.utcnow() - timedelta(days=90)
    
    # Known subscription keywords
    subscription_keywords = [
        'netflix', 'spotify', 'youtube', 'amazon prime', 'hotstar', 'disney',
        'jio', 'airtel', 'vi ', 'bsnl', 'subscription', 'premium',
        'apple', 'google one', 'icloud', 'microsoft', 'adobe',
        'gym', 'membership', 'insurance', 'emi', 'sip',
        'electricity', 'water bill', 'gas bill', 'internet', 'broadband',
        'rent', 'maintenance'
    ]
    
    # Find descriptions with >= 3 occurrences in last 90 days
    recurring_descriptions = db.query(
        models.Expense.description,
        func.count(models.Expense.id).label('count')
    ).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= cutoff
    ).group_by(
        models.Expense.description
    ).having(
        func.count(models.Expense.id) >= 3
    ).all()
    
    recurring_descs = {r.description for r in recurring_descriptions}
    
    # Also flag known subscription keywords
    all_expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= cutoff
    ).all()
    
    updated_count = 0
    for expense in all_expenses:
        desc_lower = expense.description.lower()
        is_sub = any(kw in desc_lower for kw in subscription_keywords)
        is_freq = expense.description in recurring_descs
        should_be_recurring = is_sub or is_freq
        
        if expense.is_recurring != should_be_recurring:
            expense.is_recurring = should_be_recurring
            updated_count += 1
    
    db.commit()
    return {"updated": updated_count}

# ──────────────────────────────────────
# CATEGORIES
# ──────────────────────────────────────

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#ef4444", "icon": "utensils"},
    {"name": "Transport", "color": "#3b82f6", "icon": "car"},
    {"name": "Shopping", "color": "#8b5cf6", "icon": "shopping-bag"},
    {"name": "Groceries", "color": "#22c55e", "icon": "apple"},
    {"name": "Bills & Utilities", "color": "#f59e0b", "icon": "zap"},
    {"name": "Entertainment", "color": "#ec4899", "icon": "film"},
    {"name": "Health", "color": "#14b8a6", "icon": "heart"},
    {"name": "Other", "color": "#6b7280", "icon": "tag"},
]

def seed_default_categories(db: Session, user_id: int):
    """Create default categories if user has none."""
    existing = db.query(models.Category).filter(models.Category.user_id == user_id).count()
    if existing > 0:
        return
    for cat in DEFAULT_CATEGORIES:
        db.add(models.Category(**cat, user_id=user_id))
    db.commit()

def get_categories(db: Session, user_id: int):
    return db.query(models.Category).filter(models.Category.user_id == user_id).order_by(models.Category.name).all()

def create_category(db: Session, category: schemas.CategoryCreate, user_id: int):
    existing = db.query(models.Category).filter(
        models.Category.name == category.name,
        models.Category.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    db_cat = models.Category(**category.dict(), user_id=user_id)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_category(db: Session, category_id: int, user_id: int):
    cat = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == user_id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    # Unlink expenses from this category
    db.query(models.Expense).filter(
        models.Expense.category_id == category_id
    ).update({"category_id": None}, synchronize_session=False)
    db.delete(cat)
    db.commit()
    return {"deleted": True}

# ──────────────────────────────────────
# REIMBURSEMENTS
# ──────────────────────────────────────

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

# ──────────────────────────────────────
# STATEMENT UPLOADS
# ──────────────────────────────────────

def create_statement_upload(db: Session, upload: schemas.StatementUploadBase, user_id: int):
    db_upload = models.StatementUpload(**upload.dict(), user_id=user_id)
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload

# ──────────────────────────────────────
# USER PROFILE
# ──────────────────────────────────────

def update_user_profile(db: Session, user_id: int, data: schemas.UserProfileUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

# ──────────────────────────────────────
# AUTO-TAG RULES
# ──────────────────────────────────────

def get_auto_tag_rules(db: Session, user_id: int):
    return db.query(models.AutoTagRule).filter(models.AutoTagRule.user_id == user_id).order_by(models.AutoTagRule.keyword).all()

def create_auto_tag_rule(db: Session, rule: schemas.AutoTagRuleCreate, user_id: int):
    # Normalize keyword to lowercase
    keyword = rule.keyword.strip().lower()
    existing = db.query(models.AutoTagRule).filter(
        models.AutoTagRule.keyword == keyword,
        models.AutoTagRule.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Rule for '{keyword}' already exists")
    # Verify category belongs to user
    cat = db.query(models.Category).filter(
        models.Category.id == rule.category_id,
        models.Category.user_id == user_id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db_rule = models.AutoTagRule(keyword=keyword, category_id=rule.category_id, user_id=user_id)
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

def delete_auto_tag_rule(db: Session, rule_id: int, user_id: int):
    rule = db.query(models.AutoTagRule).filter(
        models.AutoTagRule.id == rule_id,
        models.AutoTagRule.user_id == user_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"deleted": True}

def auto_categorize_expense(db: Session, expense: models.Expense, user_id: int):
    """Match an expense's description against user's auto-tag rules and assign category."""
    if expense.category_id:  # Already categorized
        return
    rules = db.query(models.AutoTagRule).filter(models.AutoTagRule.user_id == user_id).all()
    desc_lower = expense.description.lower()
    for rule in rules:
        if rule.keyword in desc_lower:
            expense.category_id = rule.category_id
            return

def apply_auto_tags_to_all(db: Session, user_id: int):
    """Re-apply auto-tag rules to all uncategorized expenses."""
    rules = db.query(models.AutoTagRule).filter(models.AutoTagRule.user_id == user_id).all()
    if not rules:
        return {"tagged": 0}
    uncategorized = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.category_id == None
    ).all()
    tagged = 0
    for expense in uncategorized:
        desc_lower = expense.description.lower()
        for rule in rules:
            if rule.keyword in desc_lower:
                expense.category_id = rule.category_id
                tagged += 1
                break
    db.commit()
    return {"tagged": tagged}
