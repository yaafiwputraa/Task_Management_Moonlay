"""FastAPI application factory and startup configuration.

This module creates and configures the FastAPI application instance,
including CORS middleware, routers, and database initialization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .routers import auth, chat, tasks, users


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application instance.

    Note:
        - CORS is enabled for all origins (development mode).
        - Includes auth, users, tasks, and chat routers.
    """
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
    def health() -> dict:
        """Health check endpoint.

        Returns:
            dict: Status response indicating the API is running.
        """
        return {"status": "ok"}

    return app


app = create_app()

# Create tables on startup (simple bootstrap)
Base.metadata.create_all(bind=engine)