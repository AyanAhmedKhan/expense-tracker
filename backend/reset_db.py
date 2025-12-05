from database import engine, Base
import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reset_db")

def reset():
    print("WARNING: This will drop all tables in the database!")
    confirm = input("Are you sure? (y/n): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    logger.info("Dropping all tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("All tables dropped successfully.")
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        return

    logger.info("Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

if __name__ == "__main__":
    reset()
