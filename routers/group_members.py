from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from database.session import get_session
from models.group import Group
from models.group_members import GroupMember
from models.user import User
import routers
from utils.dependencies import get_current_user

@routers.post("/{group_id}/join")
def join_group(group_id: int, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    """Vérifie si le groupe existe déjà et s'il y a déjà un membre"""
    group = session.exec(select(Group).where(Group.id == group_id)).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id)
    ).first()
    if membership:
        raise HTTPException(status_code=400, detail="Already a member")

    new_member = GroupMember(user_id=current_user.id, group_id=group_id)
    session.add(new_member)
    session.commit()
    session.refresh(new_member)
    return {"detail": f"User {current_user.username} joined group {group.name}"}


@routers.delete("/{group_id}/leave")
def leave_group(group_id: int, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    """Permet à un utilisateur connecté de quitter le groupe dans lequel il est adhéré"""
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Not a member of this group")

    session.delete(membership)
    session.commit()
    return {"detail": f"User {current_user.username} left group {group_id}"}
