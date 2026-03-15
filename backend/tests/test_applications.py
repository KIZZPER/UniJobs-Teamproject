# Тесты Applications API: 2 теста

from tests.conftest import auth_header


# Хелпер: создаёт вакансию и возвращает её id
def _create_vacancy(client, employer_token):
    resp = client.post(
        "/api/vacancies/",
        json={
            "title": "Стажёр-разработчик",
            "description": "Python backend",
            "type": "internship",
        },
        headers=auth_header(employer_token),
    )
    return resp.json()["id"]


# Студент подаёт заявку - 201 код, pending статус
def test_create_application(test_client, student_token, employer_token):
    vacancy_id = _create_vacancy(test_client, employer_token)
    resp = test_client.post(
        "/api/applications/",
        data={
            "vacancy_id": str(vacancy_id),
            "cover_letter": "Хочу пройти стажировку",
        },
        headers=auth_header(student_token),
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["vacancy_id"] == vacancy_id
    assert data["status"] == "pending"
    assert data["cover_letter"] == "Хочу пройти стажировку"


# Работодатель не может подавать заявки - 403 код
def test_employer_cannot_apply(test_client, employer_token):
    vacancy_id = _create_vacancy(test_client, employer_token)
    resp = test_client.post(
        "/api/applications/",
        data={
            "vacancy_id": str(vacancy_id),
            "cover_letter": "Попытка",
        },
        headers=auth_header(employer_token),
    )
    assert resp.status_code == 403
