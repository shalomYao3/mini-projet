from pydantic import BaseModel
from typing import Optional

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True  
