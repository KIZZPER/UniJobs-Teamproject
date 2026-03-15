from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Category 

class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# Vacancy 

class VacancyCreate(BaseModel):
    title: str
    description: str
    type: str  # internship / part_time / project
    salary: Optional[str] = None
    category_id: Optional[int] = None


class VacancyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    salary: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[int] = None


class EmployerShort(BaseModel):
    id: int
    company_name: str

    class Config:
        from_attributes = True


class VacancyResponse(BaseModel):
    id: int
    title: str
    description: str
    type: str
    salary: Optional[str] = None
    employer: EmployerShort
    category: Optional[CategoryResponse] = None
    created_at: datetime
    is_active: int

    class Config:
        from_attributes = True


class VacancyListResponse(BaseModel):
    items: list[VacancyResponse]
    total: int
    page: int
    per_page: int
