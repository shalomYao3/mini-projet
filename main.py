from fastapi import FastAPI
from routers import auth, users, groups, tasks
from database.engine import create_db

app = FastAPI()
create_db()


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(tasks.router)