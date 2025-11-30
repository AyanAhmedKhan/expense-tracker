from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import statements, expenses, reimbursements, summary, auth
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ICICI Tracker")

# Get CORS origins from environment or use default
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(statements.router)
app.include_router(expenses.router)
app.include_router(reimbursements.router)
app.include_router(summary.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ICICI Tracker API"}
