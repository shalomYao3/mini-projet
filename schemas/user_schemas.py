from pydantic import BaseModel

class UserRead(BaseModel):
    id: int
    username: str

class config:
    orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str