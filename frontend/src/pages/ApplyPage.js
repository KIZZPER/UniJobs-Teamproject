import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function ApplyPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/api/vacancies/${id}`)
      .then((res) => setVacancy(res.data))
      .catch(() => setError("Вакансия не найдена"));
  }, [id]);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <Link to="/login">Войдите</Link>, чтобы подать заявку.
        </div>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Подавать заявки могут только студенты.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("vacancy_id", id);
    if (coverLetter) formData.append("cover_letter", coverLetter);
    if (resume) formData.append("resume", resume);

    try {
      await api.post("/api/applications/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/my-applications");
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при подаче заявки");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Link
            to={`/vacancies/${id}`}
            className="btn btn-outline-secondary btn-sm mb-3"
          >
            &larr; Назад к вакансии
          </Link>

          <h2 className="mb-1">Подать заявку</h2>
          {vacancy && (
            <p className="text-muted mb-4">на вакансию: {vacancy.title}</p>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Сопроводительное письмо</label>
              <textarea
                className="form-control"
                rows="5"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Расскажите, почему вас заинтересовала эта позиция..."
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Резюме (PDF, DOC)</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting}
            >
              {submitting ? "Отправка..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyPage;
