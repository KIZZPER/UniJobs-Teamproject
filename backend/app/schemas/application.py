from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    vacancy_id: int
    cover_letter: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str  # reviewed / interview / accepted / rejected


class VacancyShort(BaseModel):
    id: int
    title: str
    type: str

    class Config:
        from_attributes = True


class StudentShort(BaseModel):
    id: int
    university: Optional[str] = None
    faculty: Optional[str] = None
    course: Optional[int] = None

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: int
    vacancy_id: int
    student_id: int
    cover_letter: Optional[str] = None
    resume_path: Optional[str] = None
    status: str
    created_at: datetime
    vacancy: VacancyShort
    student: StudentShort

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int
    page: int
    per_page: int
