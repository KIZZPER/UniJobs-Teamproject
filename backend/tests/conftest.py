import os
import pytest

# SQLite для тестов 
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Создание таблицы перед каждым тестом и ее удаление после
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def test_client():
    return client


def _register(c, email, password, full_name, role="student"):
    return c.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role,
    })


# Регистрирует студента и возвращает JWT-токен
@pytest.fixture
def student_token(test_client):
    resp = _register(test_client, "student@test.com", "pass1234", "Иван Иванов", "student")
    return resp.json()["access_token"]


# Регистрирует работодателя и возвращает JWT-токен
@pytest.fixture
def employer_token(test_client):
    resp = _register(test_client, "employer@test.com", "pass1234", "ООО Тест", "employer")
    return resp.json()["access_token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}
