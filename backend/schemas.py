from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from models import ExpenseStatus

# --- Expense ---

class ExpenseBase(BaseModel):
    date: datetime
    description: str
    amount: float
    source: str
    status: ExpenseStatus = ExpenseStatus.PENDING
    reimbursed_amount: float = 0.0

class ExpenseCreate(ExpenseBase):
    transaction_hash: str
    category_id: Optional[int] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    category_id: Optional[int] = None
    is_recurring: Optional[bool] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    color: str
    icon: str

    class Config:
        from_attributes = True

class Expense(ExpenseBase):
    id: int
    transaction_hash: str
    category_id: Optional[int] = None
    is_recurring: bool = False
    category: Optional[CategoryOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Bulk Operations ---

class BulkDeleteRequest(BaseModel):
    expense_ids: List[int]

# --- Reimbursement ---

class ReimbursementBase(BaseModel):
    amount: float
    note: Optional[str] = None

class ReimbursementCreate(BaseModel):
    expense_ids: List[int]
    note: Optional[str] = None

class Reimbursement(ReimbursementBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# --- Statement Upload ---

class StatementUploadBase(BaseModel):
    file_name: str
    num_transactions_imported: int

class StatementUpload(StatementUploadBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

class UploadSummary(BaseModel):
    uploaded: int
    existing: int
    new_added: int

# --- Category ---

class CategoryCreate(BaseModel):
    name: str
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "tag"

class Category(BaseModel):
    id: int
    name: str
    color: str
    icon: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Auth ---

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    token: str  # Google ID token from frontend

class User(BaseModel):
    id: int
    name: str
    email: str
    google_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Profile ---

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
