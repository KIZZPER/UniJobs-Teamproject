import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.user import User as UserModel
from app.models.vacancy import Vacancy
from app.models.application import Application, ApplicationStatus
from app.models.resume import Resume
from app.schemas.application import (
    ApplicationResponse,
    ApplicationListResponse,
    ApplicationStatusUpdate,
)

router = APIRouter(prefix="/api/applications", tags=["applications"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    vacancy_id: int = Form(...),
    cover_letter: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут подавать заявки")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")

    existing = (
        db.query(Application)
        .filter(Application.vacancy_id == vacancy_id, Application.student_id == student.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже подали заявку на эту вакансию")

    resume_path = None
    if resume:
        ext = os.path.splitext(resume.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(resume.file.read())
        resume_path = f"/uploads/{filename}"

        db_resume = Resume(
            student_id=student.id,
            file_path=resume_path,
            original_filename=resume.filename,
        )
        db.add(db_resume)

    application = Application(
        vacancy_id=vacancy_id,
        student_id=student.id,
        cover_letter=cover_letter,
        resume_path=resume_path,
        status=ApplicationStatus.pending,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    application = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.id == application.id)
        .first()
    )
    return application


@router.get("/my", response_model=ApplicationListResponse)
def get_my_applications(
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=403, detail="Только студенты могут просматривать свои заявки")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    query = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.student_id == student.id)
        .order_by(Application.created_at.desc())
    )

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return ApplicationListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/vacancy/{vacancy_id}", response_model=ApplicationListResponse)
def get_vacancy_applications(
    vacancy_id: int,
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vacancy = db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Вакансия не найдена")

    if current_user.role != UserRole.employer or vacancy.employer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к заявкам этой вакансии")

    query = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.vacancy_id == vacancy_id)
        .order_by(Application.created_at.desc())
    )

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return ApplicationListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    is_student_owner = (
        current_user.role == UserRole.student
        and application.student.user_id == current_user.id
    )
    is_employer_owner = (
        current_user.role == UserRole.employer
        and application.vacancy.employer.user_id == current_user.id
    )
    if not is_student_owner and not is_employer_owner:
        raise HTTPException(status_code=403, detail="Нет доступа к этой заявке")

    return application


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.id == application_id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    if current_user.role != UserRole.employer or application.vacancy.employer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Только работодатель может менять статус заявки")

    valid_statuses = [s.value for s in ApplicationStatus]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Недопустимый статус. Допустимые: {valid_statuses}")

    application.status = data.status
    db.commit()
    db.refresh(application)

    application = (
        db.query(Application)
        .options(joinedload(Application.vacancy), joinedload(Application.student).joinedload(Student.user))
        .filter(Application.id == application.id)
        .first()
    )
    return application
