from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool

    class Config:
        orm_mode = True
