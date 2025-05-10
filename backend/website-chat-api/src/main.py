
# import os
# import sys
# import logging
# from fastapi import FastAPI, HTTPException, Depends, status
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from fastapi.middleware.cors import CORSMiddleware
# from models import URLRequest, QueryRequest
# from crawler import crawl_website, knowledge_base
# from llm import query_website
# from urllib.parse import urlparse, urlunparse
# from passlib.context import CryptContext
# from jose import JWTError, jwt
# from datetime import datetime, timedelta
# from typing import Optional
# from pydantic import BaseModel, EmailStr
# from database import init_db, add_user, get_user_by_email
# from dotenv import load_dotenv

# # Add src/ to Python path
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# # Load environment variables
# load_dotenv()

# # Configure logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Initialize FastAPI app
# app = FastAPI(title="WebChat API", version="1.0.0")

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
#     allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
# )

# # Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # JWT settings
# SECRET_KEY = os.getenv("SECRET_KEY")
# if not SECRET_KEY:
#     logger.error("SECRET_KEY not set in .env")
#     raise ValueError("SECRET_KEY environment variable is not set")
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# # OAuth2 scheme
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# # Pydantic models for user
# class User(BaseModel):
#     email: EmailStr
#     password: str

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# # Helper functions
# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)

# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)

# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=15)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt

# async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         email: str = payload.get("sub")
#         if email is None:
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception
#     user = await get_user_by_email(email)
#     if user is None:
#         raise credentials_exception
#     return user

# # Initialize database on startup
# @app.on_event("startup")
# async def startup_event():
#     try:
#         await init_db()
#     except Exception as e:
#         logger.error(f"Failed to initialize database: {str(e)}")
#         raise

# # Routes
# @app.post("/signup")
# async def signup(user: User):
#     """Sign up a new user."""
#     try:
#         if len(user.password) < 8:
#             raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
#         existing_user = await get_user_by_email(user.email)
#         if existing_user:
#             raise HTTPException(status_code=400, detail="Email already registered")
#         hashed_password = get_password_hash(user.password)
#         user_data = {"email": user.email, "hashed_password": hashed_password}
#         new_user = await add_user(user_data)
#         logger.info(f"User signed up: {user.email}")
#         return {"message": "User created successfully", "user": new_user}
#     except Exception as e:
#         logger.error(f"Error signing up user: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error signing up user: {str(e)}")

# @app.post("/login", response_model=Token)
# async def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     """Log in a user and return a JWT token."""
#     try:
#         user = await get_user_by_email(form_data.username)  # form_data.username is the email
#         if not user:
#             raise HTTPException(status_code=400, detail="Incorrect email or password")
#         if not verify_password(form_data.password, user["hashed_password"]):
#             raise HTTPException(status_code=400, detail="Incorrect email or password")
#         access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         access_token = create_access_token(
#             data={"sub": user["email"]}, expires_delta=access_token_expires
#         )
#         logger.info(f"User logged in: {user['email']}")
#         return {"access_token": access_token, "token_type": "bearer"}
#     except Exception as e:
#         logger.error(f"Error logging in user: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error logging in user: {str(e)}")

# @app.post("/crawl")
# async def crawl_endpoint(request: URLRequest, current_user: dict = Depends(get_current_user)):
#     """Crawl a website and store its content."""
#     try:
#         parsed = urlparse(str(request.url))
#         normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
#         await crawl_website(request.url)
#         logger.info(f"Successfully crawled {normalized_url} by user {current_user['email']}")
#         return {"message": f"Successfully crawled {normalized_url}", "url": normalized_url}
#     except Exception as e:
#         logger.error(f"Error crawling {request.url}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error crawling website: {str(e)}")

# @app.post("/query")
# async def query_endpoint(request: QueryRequest, current_user: dict = Depends(get_current_user)):
#     """Query the LLM based on crawled website content."""
#     try:
#         url_str = str(request.url)
#         parsed = urlparse(url_str)
#         normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
#         response = await query_website(normalized_url, request.query)
#         logger.info(f"Query processed for {normalized_url} by user {current_user['email']}")
#         return {"response": response, "url": normalized_url}
#     except ValueError as e:
#         logger.warning(f"Query error for {url_str}: {str(e)}")
#         raise HTTPException(status_code=404, detail=str(e))
#     except Exception as e:
#         logger.error(f"Error processing query for {url_str}: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# @app.get("/")
# async def root(current_user: dict = Depends(get_current_user)):
#     """Root endpoint with API information."""
#     try:
#         return {
#             "message": "Welcome to the WebChat API",
#             "version": "1.0.0",
#             "endpoints": {
#                 "/crawl": "POST - Crawl a website and store its content (provide 'url' in body)",
#                 "/query": "POST - Query the LLM using crawled content (provide 'url' and 'query' in body)",
#                 "/knowledge": "GET - Retrieve the current knowledge base"
#             },
#             "user": current_user["email"]
#         }
#     except Exception as e:
#         logger.error(f"Error accessing root endpoint: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error accessing root: {str(e)}")

# @app.get("/knowledge")
# async def get_knowledge_base(current_user: dict = Depends(get_current_user)):
#     """Retrieve the current knowledge base."""
#     try:
#         return {"knowledge_base": {url: content[:200] + "..." if len(content) > 200 else content for url, content in knowledge_base.items()}}
#     except Exception as e:
#         logger.error(f"Error retrieving knowledge base: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error retrieving knowledge base: {str(e)}")

import os
import sys
import logging
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from src.models import URLRequest, QueryRequest
from src.crawler import crawl_website, knowledge_base
from src.llm import query_website
from urllib.parse import urlparse, urlunparse
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
from src.database import init_db, add_user, get_user_by_email
from dotenv import load_dotenv

# Add src/ to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="WebChat API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    logger.error("SECRET_KEY not set in .env")
    raise ValueError("SECRET_KEY environment variable is not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Pydantic models for user
class User(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

# Routes
@app.post("/signup")
async def signup(user: User):
    """Sign up a new user."""
    try:
        if len(user.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        existing_user = await get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = get_password_hash(user.password)
        user_data = {"email": user.email, "hashed_password": hashed_password}
        new_user = await add_user(user_data)
        logger.info(f"User signed up: {user.email}")
        return {"message": "User created successfully", "user": new_user}
    except Exception as e:
        logger.error(f"Error signing up user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error signing up user: {str(e)}")

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Log in a user and return a JWT token."""
    try:
        user = await get_user_by_email(form_data.username)  # form_data.username is the email
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        logger.info(f"User logged in: {user['email']}")
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error logging in user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error logging in user: {str(e)}")

@app.post("/crawl")
async def crawl_endpoint(request: URLRequest, current_user: dict = Depends(get_current_user)):
    """Crawl a website and store its content."""
    try:
        parsed = urlparse(str(request.url))
        normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
        await crawl_website(request.url)
        logger.info(f"Successfully crawled {normalized_url} by user {current_user['email']}")
        return {"message": f"Successfully crawled {normalized_url}", "url": normalized_url}
    except Exception as e:
        logger.error(f"Error crawling {request.url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error crawling website: {str(e)}")

@app.post("/query")
async def query_endpoint(request: QueryRequest, current_user: dict = Depends(get_current_user)):
    """Query the LLM based on crawled website content."""
    try:
        url_str = str(request.url)
        parsed = urlparse(url_str)
        normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
        response = await query_website(normalized_url, request.query)
        logger.info(f"Query processed for {normalized_url} by user {current_user['email']}")
        return {"response": response, "url": normalized_url}
    except ValueError as e:
        logger.warning(f"Query error for {url_str}: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing query for {url_str}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/")
async def root(current_user: dict = Depends(get_current_user)):
    """Root endpoint with API information."""
    try:
        return {
            "message": "Welcome to the WebChat API",
            "version": "1.0.0",
            "endpoints": {
                "/crawl": "POST - Crawl a website and store its content (provide 'url' in body)",
                "/query": "POST - Query the LLM using crawled content (provide 'url' and 'query' in body)",
                "/knowledge": "GET - Retrieve the current knowledge base"
            },
            "user": current_user["email"]
        }
    except Exception as e:
        logger.error(f"Error accessing root endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error accessing root: {str(e)}")

@app.get("/knowledge")
async def get_knowledge_base(current_user: dict = Depends(get_current_user)):
    """Retrieve the current knowledge base."""
    try:
        return {"knowledge_base": {url: content[:200] + "..." if len(content) > 200 else content for url, content in knowledge_base.items()}}
    except Exception as e:
        logger.error(f"Error retrieving knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving knowledge base: {str(e)}")