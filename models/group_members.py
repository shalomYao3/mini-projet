from sqlmodel import SQLModel, Field
from typing import Optional

class GroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    group_id: int
