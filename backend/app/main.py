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
        - CORS origins are configured from environment variables.
        - Includes auth, users, tasks, and chat routers.
    """
    app = FastAPI(title="Task Management API", debug=settings.app_debug)

    # Get allowed origins from settings
    allowed_origins = settings.get_cors_origins()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "User-Agent",
        ],
        max_age=600,  # Cache preflight requests for 10 minutes
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