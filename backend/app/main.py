from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .routers import auth, tasks, users, chat


def create_app() -> FastAPI:
    app = FastAPI(title="Task Management API", debug=settings.app_debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(tasks.router)
    app.include_router(chat.router)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()

# Create tables on startup (simple bootstrap)
Base.metadata.create_all(bind=engine)