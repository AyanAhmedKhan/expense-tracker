import logging
from fastapi import APIRouter, Depends, HTTPException, status
import os
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    # dotenv optional; ignore if not installed
    pass
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import schemas, models, crud
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("auth")

# Security config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    # bcrypt accepts max 72 bytes; truncate to avoid ValueError
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/signup", response_model=schemas.Token)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for {user_data.email}")
    # Check if user exists
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        logger.warning(f"Signup failed: email already registered {user_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"User created: id={user.id} email={user.email}")
    
    # Generate token
    token = create_access_token({"sub": user.email})
    logger.info(f"Signup success token issued for {user.email}")
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for {credentials.email}")
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not user.password_hash:
        logger.warning(f"Login failed for {credentials.email}: no user or no password")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Login failed for {credentials.email}: bad password")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email})
    logger.info(f"Login success token issued for {user.email}")
    return {"access_token": token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
def google_login(google_data: schemas.GoogleLogin, db: Session = Depends(get_db)):
    logger.info("Google login attempt")
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests

        # Verify the Google token; enforce audience when CLIENT_ID is set
        request = requests.Request()
        if GOOGLE_CLIENT_ID:
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_data.token,
                    request,
                    GOOGLE_CLIENT_ID,
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Token audience mismatch or invalid: {e}")
        else:
            idinfo = id_token.verify_oauth2_token(
                google_data.token,
                request,
            )
        
        # Extract user info from verified token
        email = idinfo.get('email')
        name = idinfo.get('name', email.split('@')[0])
        google_id = idinfo.get('sub')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if user:
            # Update google_id if not set
            if not user.google_id:
                user.google_id = google_id
                db.commit()
            logger.info(f"Google login existing user {email}")
        else:
            # Create new user
            user = models.User(
                name=name,
                email=email,
                google_id=google_id,
                password_hash=None  # No password for Google users
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Google login created user {email}")
        
        # Generate JWT token
        token = create_access_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Google login invalid token: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {e}")
    except Exception as e:
        logger.error(f"Google auth failed: {e}")
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {e}")

@router.get("/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(get_current_user)):
    logger.info(f"Get me for {current_user.email}")
    return current_user
