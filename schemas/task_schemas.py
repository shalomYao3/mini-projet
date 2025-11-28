from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    deadline: Optional[datetime] = None
    group_id: Optional[int] = None


class TaskRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    deadline: Optional[datetime] = None
    completed: bool
    group_id: Optional[int] = None

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    group_id: Optional[int] = None