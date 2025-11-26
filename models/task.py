from sqlmodel import SQLModel, Field
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = False
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    group_id: Optional[int] = Field(default=None, foreign_key="group.id")