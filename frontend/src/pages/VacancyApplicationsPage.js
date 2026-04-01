import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  pending: "Новая",
  reviewed: "Просмотрена",
  interview: "Собеседование",
  accepted: "Принята",
  rejected: "Отклонена",
};

const statusColors = {
  pending: "secondary",
  reviewed: "info",
  interview: "warning",
  accepted: "success",
  rejected: "danger",
};

const statusOptions = ["pending", "reviewed", "interview", "accepted", "rejected"];

function VacancyApplicationsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [vacancyTitle, setVacancyTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [modalLetter, setModalLetter] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "employer") {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/api/applications/vacancy/${id}`),
      api.get(`/api/vacancies/${id}`),
    ])
      .then(([appsRes, vacRes]) => {
        setApplications(appsRes.data.items);
        setVacancyTitle(vacRes.data.title);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleStatusChange = (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    api
      .patch(`/api/applications/${applicationId}/status`, { status: newStatus })
      .then((res) => {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? res.data : a))
        );
      })
      .catch(() => {})
      .finally(() => setUpdatingId(null));
  };

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <Link to="/login">Войдите</Link>, чтобы просматривать отклики.
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
      <div className="mb-4">
        <Link to="/my-vacancies" className="text-decoration-none">
          &larr; Мои вакансии
        </Link>
      </div>
      <h2 className="mb-4">Отклики на вакансию «{vacancyTitle}»</h2>

      {applications.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">На эту вакансию пока нет откликов</p>
        </div>
      ) : (
        <>
          {/* Мобильная версия — карточки */}
          <div className="d-md-none">
            {applications.map((app) => (
              <div className="card mb-3" key={app.id}>
                <div className="card-body">
                  <h6 className="card-title mb-1">
                    {app.student?.user?.full_name || `Студент #${app.student_id}`}
                  </h6>
                  <p className="text-muted small mb-2">
                    {app.student?.user?.email}
                  </p>
                  {app.cover_letter && (
                    <p className="small mb-2">
                      <strong>Сопроводительное:</strong>{" "}
                      {app.cover_letter.length > 120 ? (
                        <>
                          {app.cover_letter.slice(0, 120) + "… "}
                          <button
                            className="btn btn-link btn-sm p-0"
                            onClick={() => setModalLetter(app.cover_letter)}
                          >
                            Посмотреть полностью
                          </button>
                        </>
                      ) : (
                        app.cover_letter
                      )}
                    </p>
                  )}
                  {app.resume_path && (
                    <p className="small mb-2">
                      <a
                        href={`http://localhost:8000${app.resume_path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Скачать резюме
                      </a>
                    </p>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="text-muted small">
                      {new Date(app.created_at).toLocaleDateString("ru-RU")}
                    </span>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      disabled={updatingId === app.id}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Десктоп — таблица */}
          <div className="d-none d-md-block table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Кандидат</th>
                  <th>Сопроводительное</th>
                  <th>Резюме</th>
                  <th>Дата</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div>{app.student?.user?.full_name || `Студент #${app.student_id}`}</div>
                      <small className="text-muted">{app.student?.user?.email}</small>
                    </td>
                    <td>
                      {app.cover_letter ? (
                        app.cover_letter.length > 80 ? (
                          <>
                            {app.cover_letter.slice(0, 80) + "… "}
                            <button
                              className="btn btn-link btn-sm p-0"
                              onClick={() => setModalLetter(app.cover_letter)}
                            >
                              Посмотреть полностью
                            </button>
                          </>
                        ) : (
                          app.cover_letter
                        )
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {app.resume_path ? (
                        <a
                          href={`http://localhost:8000${app.resume_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Скачать
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString("ru-RU")}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {modalLetter && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setModalLetter(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Сопроводительное письмо</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalLetter(null)}
                ></button>
              </div>
              <div className="modal-body" style={{ whiteSpace: "pre-wrap" }}>
                {modalLetter}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VacancyApplicationsPage;
