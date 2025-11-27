from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth,users, groups, tasks
from database.engine import create_db

app = FastAPI()
app.add_middleware(
       CORSMiddleware,
    allow_origins=["*"],          # domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],            # toutes les méthodes (GET, POST, PUT, DELETE)
    allow_headers=["*"],            # tous les headers (Authorization, Content-Type, etc.)
)
create_db()


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(tasks.router)
