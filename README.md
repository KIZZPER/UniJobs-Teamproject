# UniJobs

Платформа поиска временной работы и стажировок в университете
Студенты ищут вакансии, подают заявки с резюме и отслеживают статус. Работодатели размещают вакансии и управляют откликами.

## Реализация

В проекте реализован полноценный ключевой сценарий:

Главная страница -> Список вакансий (поиск, фильтры по типу и категории) -> Карточка вакансии (название, имя работодателя, тип, заработная плата, дата)

- **Студент:** Авторизация / Регистрация -> Подача заявки (резюме + сопроводительное письмо) -> Мои заявки (отслеживание статуса)
- **Работодатель:** Авторизация / Регистрация -> Создание вакансии (название, описание, тип, категория, заработная плата) -> Мои вакансии -> Отклики (изменеие статуса заявки)

## Стек

- **Бэкенд:** Python 3.11 / FastAPI / SQLAlchemy 2.0 / SQLite
- **Фронтенд:** React 18 / Bootstrap 5 / React Router v6 / Axios
- **Тесты:** pytest + httpx (FastAPI TestClient, SQLite in-memory)
- **Авторизация:** JWT (python-jose) + bcrypt (passlib)

## База данных

11 сущностей, связанных между собой (1:1, 1:M, M2M):

| Таблица | Описание | Связи |
|---|---|---|
| **users** | Аккаунты (email, пароль, роль: student/employer/admin) | students, employers, reviews, notifications |
| **students** | Профиль студента (университет, факультет, курс, био) | 1:1 с users |
| **employers** | Профиль работодателя (компания, описание, сайт) | 1:1 с users |
| **categories** | Справочник категорий вакансий | vacancies |
| **vacancies** | Вакансии (название, описание, тип, зарплата, активность) | applications, favorites; принадлежит employer, category |
| **applications** | Заявки студентов (сопроводительное письмо, резюме, статус) | принадлежит student, vacancy; interviews |
| **resumes** | Загруженные файлы резюме (путь, оригинальное имя) | принадлежит student |
| **reviews** | Отзывы между пользователями (рейтинг, текст) | author users, target users |
| **notifications** | Уведомления (заголовок, сообщение, прочитано/нет) | принадлежит user |
| **favorites** | Избранные вакансии студента | student <-> vacancy (M2M) |
| **interviews** | Собеседование (дата, место, заметки) | 1:1 с application |

Статусы заявок: `pending`-> `reviewed`-> `interview`-> `accepted` / `rejected`

Визуализация схемы БД — `db_diagram.png` (создана через dbdiagram.io)

> [!NOTE]
> Данные хранятся в файле `unijobs.db` (SQLite). Если файла нет, он создаётся автоматически при первом запуске бэкенда.

# Индивидуальное задание. Тесты API

9 автотестов проверяют три модуля: авторизацию, вакансии и заявки. Покрыты не только успешные сценарии, но и сценарии с ошибками (валидация данных, проверка прав доступа)

- **conftest.py (инфраструктура)** — SQLite in-memory, таблицы пересоздаются перед каждым тестом, фикстуры генерируют JWT-токены студента и работодателя
- **test_auth.py** (4 теста) — регистрация студента (201), дубликат email (400), успешный логин (200), неверный пароль (401)
- **test_vacancies.py** (3 теста) — создание вакансии работодателем (201), пустой список (200), запрет создания студентом (403)
- **test_applications.py** (2 теста) — подача заявки студентом (201, статус pending), запрет подачи работодателем (403)

Запуск: `cd backend && pytest -v`


## Структура проекта

```
backend/
  app/
    main.py              — точка входа FastAPI, CORS, подключение роутеров
    config.py            — настройки (DATABASE_URL, SECRET_KEY, ALGORITHM)
    database.py          — SQLAlchemy engine, SessionLocal, Base
    dependencies.py      — get_current_user (OAuth2 + JWT)
    models/              — 11 ORM-моделей
    schemas/             — Pydantic-схемы (user, vacancy, application)
    routers/             — API эндпоинты (auth, vacancies, applications)
    services/auth.py     — хэширование паролей, создание/верификация JWT
    uploads/             — загруженные файлы резюме
  tests/                 — 9 автотестов
  requirements.txt       — список зависимостей

frontend/
  src/
    App.js                    — роутинг (React Router v6)
    api/client.js              — axios instance + JWT interceptor
    context/AuthContext.js     — контекст авторизации (login, register, logout)
    components/
      Navbar.js               — адаптивная навигация (роли, toggle меню)
      VacancyCard.js           — карточка вакансии
      Footer.js                — футер
    pages/
      HomePage.js              — главный баннер + последние вакансии
      LoginPage.js             — форма входа
      RegisterPage.js          — форма регистрации (студент/работодатель)
      VacancyListPage.js       — список вакансий (поиск, фильтры, пагинация)
      VacancyDetailPage.js     — детальная карточка вакансии
      ApplyPage.js             — подача заявки (резюме + письмо)
      MyApplicationsPage.js    — заявки студента (статусы)
      CreateVacancyPage.js     — создание вакансии (работодатель)
      MyVacanciesPage.js       — вакансии работодателя
      VacancyApplicationsPage.js — отклики на вакансию (смена статуса)
README.md
db_diagram.png
```

## Запуск

```bash
# Бэкенд
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://localhost:8000

# Фронтенд
cd frontend
npm install
npm start                              # http://localhost:3000
```