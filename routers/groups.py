from datetime import datetime, timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from models.group import Group
from models.invite import InvitationToken
from schemas.group_schemas import GroupCreate, GroupRead
from utils.dependencies import get_current_user
from database.session import get_session
from models.user import User

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupRead)
def create_group(group: GroupCreate, current_user: User = Depends(get_current_user), session:Session = Depends(get_session)):
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

@router.post("/{group_id}/invite")
def generate_invite_link(
    group_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cette fonction vérifie que le groupe existe, que l'utilisateur est le propriétaire du groupe et génère un token sécurisé"""

    
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")

    
    if group.owner_id != current_user.id:
        raise HTTPException(403, "Not allowed")

    
    token = secrets.token_urlsafe(32)

    invite = InvitationToken(
        token=token,
        group_id=group.id
    )

    session.add(invite)
    session.commit()

    link = f"http://localhost:8000/groups/join/{token}"

    return {"invite_link": link}


@router.get("/join/{token}")
def accept_invite(
    token: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Cette fonction a pour but de gérer l’expiration, Vérifier si l'utilisateur est déjà membre, Ajouter l’utilisateur au groupe et de On peut supprimer le token après usage"""

    statement = select(InvitationToken).where(InvitationToken.token == token)
    invite = session.exec(statement).first()

    if not invite:
        raise HTTPException(404, "Invalid or expired invitation token")

    
    expiry_time = invite.created_at + timedelta(hours=invite.expires_in_hours)
    if datetime.now() > expiry_time:
        raise HTTPException(403, "Invitation link expired")

     
    from models.group_members import GroupMember  

    existing = session.exec(
        select(GroupMember).where(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == invite.group_id
        )
    ).first()

    if existing:
        return {"detail": "Already a member of this group"}

    
    membership = GroupMember(user_id=current_user.id, group_id=invite.group_id)
    session.add(membership)

    
    session.delete(invite)

    session.commit()

    return {"detail": "You have joined the group successfully"}

@router.get("/", response_model=list[GroupRead])
def list_groups(session:Session = Depends(get_session)):
    groups = session.exec(select(Group)).all()
    return groups
