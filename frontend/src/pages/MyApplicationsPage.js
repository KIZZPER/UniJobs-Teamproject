import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  pending: { text: "На рассмотрении", cls: "bg-warning text-dark" },
  reviewed: { text: "Просмотрено", cls: "bg-info" },
  interview: { text: "Собеседование", cls: "bg-primary" },
  accepted: { text: "Принят", cls: "bg-success" },
  rejected: { text: "Отказ", cls: "bg-danger" },
};

function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "student") {
      api
        .get("/api/applications/my")
        .then((res) => setApplications(res.data.items))
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
          <Link to="/login">Войдите</Link>, чтобы увидеть заявки.
        </div>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Этот раздел доступен только студентам.</div>
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
      <h2 className="mb-4">Мои заявки</h2>

      {applications.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">У вас пока нет заявок</p>
          <Link to="/vacancies" className="btn btn-primary">
            Найти вакансию
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Вакансия</th>
                <th className="d-none d-md-table-cell">Тип</th>
                <th>Статус</th>
                <th className="d-none d-md-table-cell">Дата</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const st = statusLabels[app.status] || {
                  text: app.status,
                  cls: "bg-secondary",
                };
                return (
                  <tr key={app.id}>
                    <td>
                      <Link to={`/vacancies/${app.vacancy_id}`}>
                        {app.vacancy?.title || `#${app.vacancy_id}`}
                      </Link>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {app.vacancy?.type}
                    </td>
                    <td>
                      <span className={`badge ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {new Date(app.created_at).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
