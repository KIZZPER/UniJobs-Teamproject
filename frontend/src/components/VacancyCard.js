import React from "react";
import { Link } from "react-router-dom";

const typeLabels = {
  internship: "Стажировка",
  part_time: "Подработка",
  project: "Проект",
};

function VacancyCard({ vacancy }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{vacancy.title}</h5>
        <p className="text-muted small mb-1">
          {vacancy.employer?.company_name}
        </p>
        <div className="mb-2">
          <span className="badge bg-info me-1">
            {typeLabels[vacancy.type] || vacancy.type}
          </span>
          {vacancy.category && (
            <span className="badge bg-secondary">{vacancy.category.name}</span>
          )}
        </div>
        <p className="card-text flex-grow-1">
          {vacancy.description?.length > 120
            ? vacancy.description.slice(0, 120) + "..."
            : vacancy.description}
        </p>
        {vacancy.salary && (
          <p className="fw-semibold text-success mb-2">{vacancy.salary}</p>
        )}
        <Link
          to={`/vacancies/${vacancy.id}`}
          className="btn btn-outline-primary btn-sm mt-auto"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}

export default VacancyCard;
