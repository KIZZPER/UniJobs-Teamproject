import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const typeLabels = {
  internship: "Стажировка",
  part_time: "Подработка",
  project: "Проект",
};

function MyVacanciesPage() {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "employer") {
      api
        .get("/api/vacancies/my")
        .then((res) => setVacancies(res.data.items))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <Link to="/login">Войдите</Link>, чтобы увидеть свои вакансии.
        </div>
      </div>
    );
  }

  if (user.role !== "employer") {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Этот раздел доступен только работодателям.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Мои вакансии</h2>
        <Link to="/vacancies/new" className="btn btn-primary">
          + Создать вакансию
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">У вас пока нет вакансий</p>
          <Link to="/vacancies/new" className="btn btn-primary">
            Создать первую вакансию
          </Link>
        </div>
      ) : (
        <>
          {/* Мобильная версия — карточки */}
          <div className="d-md-none">
            {vacancies.map((v) => (
              <div className="card mb-3" key={v.id}>
                <div className="card-body">
                  <h6 className="card-title mb-1">
                    <Link to={`/vacancies/${v.id}`}>{v.title}</Link>
                  </h6>
                  <p className="text-muted small mb-2">
                    {typeLabels[v.type] || v.type}
                    {v.category && ` · ${v.category.name}`}
                    {v.salary && ` · ${v.salary}`}
                  </p>
                  <span className="text-muted small">
                    {new Date(v.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Десктоп — таблица */}
          <div className="d-none d-md-block table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Категория</th>
                  <th>Зарплата</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link to={`/vacancies/${v.id}`}>{v.title}</Link>
                    </td>
                    <td>{typeLabels[v.type] || v.type}</td>
                    <td>{v.category?.name || "—"}</td>
                    <td>{v.salary || "—"}</td>
                    <td>{new Date(v.created_at).toLocaleDateString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MyVacanciesPage;
