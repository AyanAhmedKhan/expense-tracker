from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class ExpenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    REIMBURSED = "REIMBURSED"

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#6366f1")  # Hex color for UI
    icon = Column(String, default="tag")       # Icon name for UI
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('name', 'user_id', name='uix_category_name_user'),
    )

class AutoTagRule(Base):
    """User-defined rules: if expense description contains `keyword`, assign `category_id`."""
    __tablename__ = "auto_tag_rules"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False)        # e.g., "jiomart"
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", lazy="joined")

    __table_args__ = (
        UniqueConstraint('keyword', 'user_id', name='uix_autotag_keyword_user'),
    )

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    description = Column(String)
    amount = Column(Float)
    source = Column(String)  # e.g., "ICICI Statement"
    status = Column(Enum(ExpenseStatus), default=ExpenseStatus.PENDING)
    reimbursed_amount = Column(Float, default=0.0)
    transaction_hash = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", backref="expenses", lazy="joined")

    __table_args__ = (
        UniqueConstraint('transaction_hash', 'user_id', name='uix_expense_hash_user'),
    )

class Reimbursement(Base):
    __tablename__ = "reimbursements"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)
    note = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    num_transactions_imported = Column(Integer)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)  # Nullable for Google OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
