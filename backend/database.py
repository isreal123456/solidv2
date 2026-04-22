import json
import os

from dotenv import load_dotenv
from sqlalchemy import MetaData, create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv(override=True)


DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("NEON_DATABASE_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
)

if not DATABASE_URL:
    raise RuntimeError(
        "Set DATABASE_URL, NEON_DATABASE_URL, or SUPABASE_DATABASE_URL to a valid Postgres connection string."
    )


engine: Engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base(metadata=MetaData())


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except OperationalError as exc:
        raise RuntimeError(
            "Postgres is not reachable. Check DATABASE_URL/NEON_DATABASE_URL and verify the host, credentials, and network access."
        ) from exc

    from models import AuthToken, Drink, LogEntry, Sale, Setting, Staff

    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS \"customerName\" VARCHAR"))
        connection.execute(text("ALTER TABLE drinks ADD COLUMN IF NOT EXISTS \"isActive\" BOOLEAN DEFAULT TRUE"))

    db = SessionLocal()
    try:
        if db.query(Staff).count() == 0:
            db.add_all(
                [
                    Staff(id="staff-aisha", name="Aisha", pin="1234", role="staff"),
                    Staff(id="staff-granny", name="Granny", pin="0000", role="admin"),
                ]
            )

        if db.query(Drink).count() == 0:
            db.add_all(
                [
                    Drink(
                        id="drink-1",
                        name="Coca Cola",
                        category="Soft Drink",
                        price=300,
                        stock=50,
                        alertLevel=10,
                    ),
                    Drink(
                        id="drink-2",
                        name="Fanta",
                        category="Soft Drink",
                        price=300,
                        stock=35,
                        alertLevel=10,
                    ),
                ]
            )

        if db.query(Sale).count() == 0:
            db.add(
                Sale(
                    id="sale-1",
                    staffId="staff-aisha",
                    staffName="Aisha",
                    customerName="Walk-in",
                    drinkId="drink-1",
                    drinkName="Coca Cola",
                    quantity=3,
                    price=300,
                    total=900,
                    date="2026-04-20",
                    time="09:10 AM",
                )
            )

        if db.query(LogEntry).count() == 0:
            db.add(
                LogEntry(
                    id="log-1",
                    staffName="Aisha",
                    action="sale.create",
                    details="Sold 3 x Coca Cola",
                    date="2026-04-20",
                    time="09:10 AM",
                )
            )

        if db.query(Setting).count() == 0:
            db.add_all(
                [
                    Setting(key="shopName", value="Granny's Shop"),
                    Setting(key="categories", value=json.dumps(["Soft Drink", "Malt", "Beer", "Water"])),
                ]
            )

        db.query(AuthToken).delete()
        db.commit()
    finally:
        db.close()
