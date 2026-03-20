import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const typeLabels = {
  internship: "Стажировка",
  part_time: "Подработка",
  project: "Проект",
};

function VacancyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/vacancies/${id}`)
      .then((res) => setVacancy(res.data))
      .catch(() => setError("Вакансия не найдена"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/vacancies" className="btn btn-outline-primary">
          Назад к вакансиям
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/vacancies" className="btn btn-outline-secondary btn-sm mb-3">
        &larr; Назад
      </Link>

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{vacancy.title}</h2>
          <p className="text-muted mb-2">
            {vacancy.employer?.company_name}
          </p>

          <div className="mb-3">
            <span className="badge bg-info me-2">
              {typeLabels[vacancy.type] || vacancy.type}
            </span>
            {vacancy.category && (
              <span className="badge bg-secondary">
                {vacancy.category.name}
              </span>
            )}
          </div>

          {vacancy.salary && (
            <p className="fs-5 fw-semibold text-success">{vacancy.salary}</p>
          )}

          <hr />
          <p style={{ whiteSpace: "pre-wrap" }}>{vacancy.description}</p>
          <hr />

          <p className="text-muted small">
            Опубликовано:{" "}
            {new Date(vacancy.created_at).toLocaleDateString("ru-RU")}
          </p>

          {user && user.role === "student" ? (
            <Link
              to={`/vacancies/${vacancy.id}/apply`}
              className="btn btn-primary"
            >
              Откликнуться
            </Link>
          ) : !user ? (
            <Link to="/login" className="btn btn-outline-primary">
              Войдите, чтобы откликнуться
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VacancyDetailPage;
