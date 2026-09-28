import logging
from sqlalchemy import inspect, text

logger = logging.getLogger("skillloop.db.schema")


def upgrade_user_columns(engine):
    """
    Idempotent schema upgrade helper:
    Inspects the `users` table and runs ALTER TABLE ADD COLUMN for any missing
    personalization columns, ensuring existing SQLite databases upgrade in-place without data loss.
    """
    try:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            existing_columns = {col["name"] for col in inspector.get_columns("users")}
            
            new_columns = [
                ("avatar_url", "VARCHAR"),
                ("headline", "VARCHAR(80)"),
                ("interests", "JSON"),
                ("links", "JSON"),
                ("availability", "VARCHAR(100)"),
                ("favorite_quote", "VARCHAR(120)"),
            ]
            
            with engine.connect() as conn:
                for col_name, col_type in new_columns:
                    if col_name not in existing_columns:
                        logger.info(f"Adding missing column '{col_name}' to users table...")
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        logger.info(f"Successfully added column '{col_name}'.")
    except Exception as e:
        logger.warning(f"Note on schema upgrade check: {e}")
