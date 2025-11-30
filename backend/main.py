import logging
from fastapi import FastAPI, Request
from time import time
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import statements, expenses, reimbursements, summary, auth
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("app")

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")
except Exception as e:
    logger.error(f"Failed to create tables: {e}")

app = FastAPI(title="ICICI Tracker")

# Get CORS origins from environment or use default
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
logger.info(f"CORS origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
# Support routes without '/api' prefix for compatibility
app.include_router(auth.router, prefix="/auth")
logger.info("Routers registered: /api/auth/* and /auth/*, plus expenses/reimbursements/statements/summary")
app.include_router(statements.router)
app.include_router(expenses.router)
app.include_router(reimbursements.router)
app.include_router(summary.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ICICI Tracker API"}

@app.on_event("startup")
def on_startup():
    # Confirm DB connection on app startup
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("Startup DB connectivity OK")
    except Exception as e:
        logger.error(f"Startup DB connectivity failed: {e}")

@app.get("/healthz")
def healthz():
    status = {"status": "ok", "db": "unknown"}
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        status["db"] = "ok"
    except Exception as e:
        status["status"] = "error"
        status["db"] = f"error: {e}"
        logger.error(f"Healthz DB check failed: {e}")
    return status

# Simple request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time()
    logger.info(f"Incoming {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        duration = (time() - start) * 1000
        logger.info(f"Completed {request.method} {request.url.path} -> {response.status_code} in {duration:.1f}ms")
        return response
    except Exception as e:
        duration = (time() - start) * 1000
        logger.error(f"Error {request.method} {request.url.path} after {duration:.1f}ms: {e}")
        raise
