from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import session
from database.session import get_session
from models.user import User
from schemas.user_schemas import UserCreate, UserLogin, UserRead
from security.hashing import Hash
from security.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, session:Session = Depends(get_session)):
    statement = select(User).where(User.username == user.username)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = Hash.hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pw)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: UserLogin, session:Session=Depends(get_session)):
    statement = select(User).where(User.username == user.username)
    db_user = session.exec(statement).first()
    if not db_user or not Hash.verify(db_user.hashed_password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}
