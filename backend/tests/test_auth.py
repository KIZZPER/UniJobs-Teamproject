# Тесты Auth API: 4 теста

from tests.conftest import auth_header


# Регистрация студента - 201 код, возвращается токен
def test_register_student(test_client):
    resp = test_client.post("/api/auth/register", json={
        "email": "new_student@test.com",
        "password": "secret123",
        "full_name": "Пётр Петров",
        "role": "student",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


# Повторная регистрация с тем же email - 400 код
def test_register_duplicate_email(test_client):
    payload = {
        "email": "dup@test.com",
        "password": "secret123",
        "full_name": "Дубликат",
        "role": "student",
    }
    test_client.post("/api/auth/register", json=payload)
    resp = test_client.post("/api/auth/register", json=payload)
    assert resp.status_code == 400
    assert "уже зарегистрирован" in resp.json()["detail"]


# Логин с верными данными - 200 код, возвращается токен
def test_login_success(test_client):
    test_client.post("/api/auth/register", json={
        "email": "login@test.com",
        "password": "mypass",
        "full_name": "Тест",
        "role": "student",
    })
    resp = test_client.post("/api/auth/login", data={
        "username": "login@test.com",
        "password": "mypass",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()

# Логин с неверным паролем - 401 код
def test_login_wrong_password(test_client):
    test_client.post("/api/auth/register", json={
        "email": "wrong@test.com",
        "password": "correct",
        "full_name": "Тест",
        "role": "student",
    })
    resp = test_client.post("/api/auth/login", data={
        "username": "wrong@test.com",
        "password": "incorrect",
    })
    assert resp.status_code == 401
    assert "Неверный" in resp.json()["detail"]
