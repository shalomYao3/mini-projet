from fastapi import FastAPI
from routers import auth, pages, users, groups, tasks
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from database.engine import create_db

app = FastAPI()
create_db()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(tasks.router)
app.include_router(pages.router)