from fastapi import APIRouter, Request, Depends
from sqlmodel import Session, select
from database.session import get_session
from models.group import Group
from models.task import Task
from utils.templates import templates
from utils.dependencies import get_current_user
from models.user import User

router = APIRouter()

@router.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/dashboard")
def dashboard(request: Request, current_user: User = Depends(get_current_user)):
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": current_user})

@router.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.get("/groups")
def groups_page(request: Request, current_user: User = Depends(get_current_user), session=Depends(get_session)):
    groups = session.exec(select(Group)).all()
    return templates.TemplateResponse("groups.html", {"request": request, "groups": groups})

@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.get("/tasks")
def tasks_page(request: Request, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    tasks = session.exec(select(Task).where(Task.owner_id == current_user.id)).all()
    return templates.TemplateResponse("tasks.html", {"request": request, "tasks": tasks})



