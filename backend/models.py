from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class ExpenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    REIMBURSED = "REIMBURSED"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    description = Column(String)
    amount = Column(Float)
    source = Column(String)  # e.g., "ICICI Statement"
    status = Column(Enum(ExpenseStatus), default=ExpenseStatus.PENDING)
    reimbursed_amount = Column(Float, default=0.0)
    transaction_hash = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Reimbursement(Base):
    __tablename__ = "reimbursements"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReimbursementCoverage(Base):
    __tablename__ = "reimbursement_coverage"

    id = Column(Integer, primary_key=True, index=True)
    reimbursement_id = Column(Integer, ForeignKey("reimbursements.id"))
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    amount_applied = Column(Float)

class StatementUpload(Base):
    __tablename__ = "statement_uploads"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    num_transactions_imported = Column(Integer)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)  # Nullable for Google OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
