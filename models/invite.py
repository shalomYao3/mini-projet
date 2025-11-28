from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class InvitationToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    group_id: int = Field(foreign_key="group.id")
    created_at: datetime = Field(default_factory=datetime.now)
    expires_in_hours: int = 48  # expiration optionnelle
