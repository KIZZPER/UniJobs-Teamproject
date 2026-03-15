# Тесты Vacancies API: 3 теста

from tests.conftest import auth_header


# Работодатель создаёт вакансию - 201 код
def test_create_vacancy(test_client, employer_token):
    resp = test_client.post(
        "/api/vacancies/",
        json={
            "title": "Ассистент преподавателя",
            "description": "Помощь с проверкой работ",
            "type": "part_time",
        },
        headers=auth_header(employer_token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Ассистент преподавателя"
    assert data["type"] == "part_time"
    assert data["is_active"] == 1


# Список вакансий без данных - пустой список, 200 код
def test_list_vacancies_empty(test_client):
    resp = test_client.get("/api/vacancies/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0


# Студент не может создавать вакансии - 403 код
def test_student_cannot_create_vacancy(test_client, student_token):
    resp = test_client.post(
        "/api/vacancies/",
        json={
            "title": "Запрещено",
            "description": "Студент пытается создать вакансию",
            "type": "internship",
        },
        headers=auth_header(student_token),
    )
    assert resp.status_code == 403
