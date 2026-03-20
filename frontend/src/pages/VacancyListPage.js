import React, { useState, useEffect } from "react";
import api from "../api/client";
import VacancyCard from "../components/VacancyCard";

const typeOptions = [
  { value: "", label: "Все типы" },
  { value: "internship", label: "Стажировка" },
  { value: "part_time", label: "Подработка" },
  { value: "project", label: "Проект" },
];

function VacancyListPage() {
  const [vacancies, setVacancies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const perPage = 9;

  useEffect(() => {
    api.get("/api/categories/").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: perPage };
    if (search) params.search = search;
    if (type) params.type = type;
    if (categoryId) params.category_id = categoryId;

    api
      .get("/api/vacancies/", { params })
      .then((res) => {
        setVacancies(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, type, categoryId]);

  const totalPages = Math.ceil(total / perPage);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Вакансии</h2>

      <form onSubmit={handleSearch} className="row g-2 mb-4">
        <div className="col-12 col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : vacancies.length === 0 ? (
        <p className="text-muted">Ничего не найдено</p>
      ) : (
        <>
          <div className="row g-4">
            {vacancies.map((v) => (
              <div key={v.id} className="col-12 col-md-6 col-lg-4">
                <VacancyCard vacancy={v} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(p)}>
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default VacancyListPage;
