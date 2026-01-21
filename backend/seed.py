import uvicorn
from app.db import SessionLocal, Base, engine
from app.seed import seed_users


def run_seed():
    # Create tables first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_users(db)
        print("Seed completed")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()