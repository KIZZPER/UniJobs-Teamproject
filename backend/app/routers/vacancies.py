from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models.vacancy import Vacancy, VacancyType
from app.models.category import Category
from app.models.employer import Employer
from app.models.user import User, UserRole
from app.schemas.vacancy import (
    VacancyCreate,
    VacancyUpdate,
    VacancyResponse,
    VacancyListResponse,
    CategoryResponse,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/vacancies", tags=["Vacancies"])


# Categories 

categories_router = APIRouter(prefix="/api/categories", tags=["Categories"])


@categories_router.get("/", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@categories_router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_categories(db: Session = Depends(get_db)):
    """Заполнить справочник категорий начальными данными."""
    names = [
        "Ассистент преподавателя",
        "Администрация",
        "Исследовательский проект",
        "IT и разработка",
        "Маркетинг и PR",
        "Дизайн",
        "Библиотека",
        "Мероприятия",
    ]
    created = 0
    for name in names:
        if not db.query(Category).filter(Category.name == name).first():
            db.add(Category(name=name))
            created += 1
    db.commit()
    return {"detail": f"Создано {created} категорий"}


# Vacancies CRUD 

@router.get("/", response_model=VacancyListResponse)
def list_vacancies(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Vacancy).options(
        joinedload(Vacancy.employer),
        joinedload(Vacancy.category),
    ).filter(Vacancy.is_active == 1)

    if search:
        pattern = f"%{search}%"
        q = q.filter(Vacancy.title.ilike(pattern) | Vacancy.description.ilike(pattern))

    if category_id:
        q = q.filter(Vacancy.category_id == category_id)

    if type:
        q = q.filter(Vacancy.type == VacancyType(type))

    total = q.count()
    items = q.order_by(Vacancy.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return VacancyListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{vacancy_id}", response_model=VacancyResponse)
def get_vacancy(vacancy_id: int, db: Session = Depends(get_db)):
    vacancy = (
        db.query(Vacancy)
        .options(joinedload(Vacancy.employer), joinedload(Vacancy.category))
        .filter(Vacancy.id == vacancy_id)
        .first()
    )
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")
    return vacancy


@router.post("/", response_model=VacancyResponse, status_code=status.HTTP_201_CREATED)
def create_vacancy(
    data: VacancyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.employer:
        raise HTTPException(status_code=403, detail="Только работодатель может создавать вакансии")

    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Профиль работодателя не найден")

    if data.type not in ("internship", "part_time", "project"):
        raise HTTPException(status_code=400, detail="Недопустимый тип вакансии")

    if data.category_id:
        if not db.query(Category).filter(Category.id == data.category_id).first():
            raise HTTPException(status_code=400, detail="Категория не найдена")

    vacancy = Vacancy(
        title=data.title,
        description=data.description,
        type=VacancyType(data.type),
        salary=data.salary,
        employer_id=employer.id,
        category_id=data.category_id,
    )
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)

    # reload with relationships
    vacancy = (
        db.query(Vacancy)
        .options(joinedload(Vacancy.employer), joinedload(Vacancy.category))
        .filter(Vacancy.id == vacancy.id)
        .first()
    )
    return vacancy


@router.put("/{vacancy_id}", response_model=VacancyResponse)
def update_vacancy(
    vacancy_id: int,
    data: VacancyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")

    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer or vacancy.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Нет прав на редактирование этой вакансии")

    update_data = data.model_dump(exclude_unset=True)

    if "type" in update_data:
        if update_data["type"] not in ("internship", "part_time", "project"):
            raise HTTPException(status_code=400, detail="Недопустимый тип вакансии")
        update_data["type"] = VacancyType(update_data["type"])

    if "category_id" in update_data and update_data["category_id"] is not None:
        if not db.query(Category).filter(Category.id == update_data["category_id"]).first():
            raise HTTPException(status_code=400, detail="Категория не найдена")

    for key, value in update_data.items():
        setattr(vacancy, key, value)

    db.commit()
    db.refresh(vacancy)

    vacancy = (
        db.query(Vacancy)
        .options(joinedload(Vacancy.employer), joinedload(Vacancy.category))
        .filter(Vacancy.id == vacancy.id)
        .first()
    )
    return vacancy


@router.delete("/{vacancy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")

    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer or vacancy.employer_id != employer.id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление этой вакансии")

    db.delete(vacancy)
    db.commit()
