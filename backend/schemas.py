from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from models import ExpenseStatus

class ExpenseBase(BaseModel):
    date: datetime
    description: str
    amount: float
    source: str
    status: ExpenseStatus = ExpenseStatus.PENDING
    reimbursed_amount: float = 0.0

class ExpenseCreate(ExpenseBase):
    transaction_hash: str

class Expense(ExpenseBase):
    id: int
    transaction_hash: str
    created_at: datetime

    class Config:
        orm_mode = True

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
        orm_mode = True

class StatementUploadBase(BaseModel):
    file_name: str
    num_transactions_imported: int

class StatementUpload(StatementUploadBase):
    id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True

class UploadSummary(BaseModel):
    uploaded: int
    existing: int
    new_added: int

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
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
