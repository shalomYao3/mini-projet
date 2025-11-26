from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from models.group import Group
from schemas.group_schemas import GroupCreate, GroupRead
from utils.dependencies import get_current_user
from database.session import get_session
from models.user import User

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupRead)
def create_group(group: GroupCreate, current_user: User = Depends(get_current_user), session=Depends(get_session)):
    existing_group = session.exec(select(Group).where(Group.name == group.name)).first()
    if existing_group:
        raise HTTPException(status_code=400, detail="Le nom de ce groupe a déjà été utilisé")

    new_group = Group(
        name=group.name,
        description=group.description,
        owner_id=current_user.id
    )
    session.add(new_group)
    session.commit()
    session.refresh(new_group)
    return new_group

@router.get("/", response_model=list[GroupRead])
def list_groups(session=Depends(get_session)):
    groups = session.exec(select(Group)).all()
    return groups
