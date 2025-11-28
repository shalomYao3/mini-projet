from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import session
from models.task import Task
from schemas.task_schemas import TaskCreate, TaskRead, TaskUpdate
from utils.dependencies import get_current_user
from database.session import get_session
from models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskRead)
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    new_task = Task(
        title=task.title,
        description=task.description,
        status=task.status or "todo",
        deadline=task.deadline,
        group_id=task.group_id,
        owner_id=current_user.id
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    return new_task

@router.get("/", response_model=list[TaskRead])
def list_my_tasks(current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    statement = select(Task).where(Task.owner_id == current_user.id)
    tasks = session.exec(statement).all()
    return tasks

@router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task: TaskUpdate, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.title is not None:
        db_task.title = task.title

    if task.description is not None:
        db_task.description = task.description

    
    if task.group_id is not None:
        db_task.group_id = task.group_id

    session.ad(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), session:Session=Depends(get_session)):
    statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    db_task = session.exec(statement).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Aucune tâche trouvée")

    session.delete(db_task)
    session.commit()
    return {"detail": "Tâche supprimée avec succès"}