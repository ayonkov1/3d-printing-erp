from datetime import datetime, timedelta, timezone
from typing import Optional
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, TokenData
from app.database import get_db

# Configure auth logger
auth_logger = logging.getLogger("authentication")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with proper claims.
    
    Best practices implemented:
    1. Include essential claims (sub, iat, exp)
    2. Add role for authorization decisions
    3. Use timezone-aware datetime
    4. Pin the algorithm explicitly
    """
    to_encode = data.copy()
    now = datetime.now(tz=timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Standard JWT claims + custom claims for authorization
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": settings.APP_NAME,  # Issuer
        "type": "access",  # Token type for future refresh token support
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM  # Explicitly pin algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT token.
    
    Best practices implemented:
    1. Explicitly specify allowed algorithms (prevent algorithm confusion attacks)
    2. Validate required claims exist
    3. Log authentication failures (without exposing token)
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],  # Only accept our algorithm
            options={
                "require_exp": True,
                "require_iat": True,
            }
        )
        
        user_id = payload.get("user_id")
        if user_id is None:
            auth_logger.warning("Token missing user_id claim")
            return None
        
        # Extract role from token if present (for faster authz checks)
        role = payload.get("role")
        
        return TokenData(user_id=user_id, role=role)
        
    except JWTError as e:
        # Log the error type but never the token itself
        auth_logger.warning(f"JWT validation failed: {type(e).__name__}")
        return None


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user with role."""
        # Check if user already exists
        existing_user = self.user_repo.find_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Hash password and create user with role
        hashed_password = get_password_hash(user_data.password)
        
        # Use the role enum directly - values now match DB (uppercase)
        role = UserRole[user_data.role.name] if user_data.role else UserRole.USER
        
        user = self.user_repo.create_user(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=role,
        )
        
        auth_logger.info(f"New user registered: {user.email} with role {role.value}")
        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password"""
        user = self.user_repo.find_by_email(email)
        if not user:
            auth_logger.warning(f"Login failed: user not found ({email})")
            return None
        if not verify_password(password, user.hashed_password):
            auth_logger.warning(f"Login failed: invalid password ({email})")
            return None
        auth_logger.info(f"User logged in: {email}")
        return user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by their ID"""
        return self.user_repo.get_by_id(user_id)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    
    Best practices:
    1. Clear separation of 401 (auth failed) vs 403 (not authorized)
    2. Log authentication events
    3. Verify token is valid before any authorization checks
    """
    # 401 = Authentication failed (invalid/missing token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = decode_token(token)
    if token_data is None or token_data.user_id is None:
        auth_logger.warning("Authentication failed: invalid token")
        raise credentials_exception

    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(token_data.user_id)
    
    if user is None:
        auth_logger.warning(f"Authentication failed: user not found (id={token_data.user_id})")
        raise credentials_exception

    if not user.is_active:
        auth_logger.warning(f"Authentication failed: inactive user (id={user.id})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,  # 403 = user exists but not allowed
            detail="User account is deactivated"
        )

    auth_logger.info(f"User authenticated successfully (id={user.id})")
    return user


def redact_auth_header(headers: dict) -> dict:
    """
    Utility to redact authorization headers from logs.
    
    Best practice: Never log raw tokens - they can leak to log aggregators,
    monitoring tools, and become permanent security risks.
    """
    h = dict(headers)
    if "authorization" in h:
        h["authorization"] = "Bearer [REDACTED]"
    if "Authorization" in h:
        h["Authorization"] = "Bearer [REDACTED]"
    return h
