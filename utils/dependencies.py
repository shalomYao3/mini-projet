from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from security.jwt_handler import decode_token
from database.session import get_session
from models.user import User
from sqlmodel import select


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session=Depends(get_session)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
