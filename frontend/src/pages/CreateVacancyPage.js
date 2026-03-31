import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const typeOptions = [
  { value: "internship", label: "Стажировка" },
  { value: "part_time", label: "Подработка" },
  { value: "project", label: "Проект" },
];

function CreateVacancyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("internship");
  const [salary, setSalary] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/api/categories/")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <Link to="/login">Войдите</Link>, чтобы создать вакансию.
        </div>
      </div>
    );
  }

  if (user.role !== "employer") {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Создавать вакансии могут только работодатели.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Заполните название и описание вакансии.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        salary: salary.trim() || null,
        category_id: categoryId ? parseInt(categoryId) : null,
      };
      const res = await api.post("/api/vacancies/", payload);
      navigate(`/vacancies/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при создании вакансии");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Link
            to="/vacancies"
            className="btn btn-outline-secondary btn-sm mb-3"
          >
            &larr; К списку вакансий
          </Link>

          <h2 className="mb-4">Новая вакансия</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Название *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Ассистент преподавателя по математике"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Описание *</label>
              <textarea
                className="form-control"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите обязанности, требования и условия работы..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Тип</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Категория</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Без категории</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">Зарплата</label>
              <input
                type="text"
                className="form-control"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Например: 15 000 ₽/мес"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting}
            >
              {submitting ? "Создание..." : "Создать вакансию"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateVacancyPage;
