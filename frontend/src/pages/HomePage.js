import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import VacancyCard from "../components/VacancyCard";

function HomePage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/vacancies/", { params: { per_page: 6 } })
      .then((res) => setVacancies(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-primary text-white py-5">
        <div className="container text-center">
          <h1 className="display-5 fw-bold">UniJobs</h1>
          <p className="lead mb-4">
            Найди работу или стажировку прямо в своём университете
          </p>
          <Link to="/vacancies" className="btn btn-light btn-lg">
            Смотреть вакансии
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="mb-4">Новые вакансии</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        ) : vacancies.length === 0 ? (
          <p className="text-muted">Пока нет вакансий</p>
        ) : (
          <div className="row g-4">
            {vacancies.map((v) => (
              <div key={v.id} className="col-12 col-md-6 col-lg-4">
                <VacancyCard vacancy={v} />
              </div>
            ))}
          </div>
        )}
        {vacancies.length > 0 && (
          <div className="text-center mt-4">
            <Link to="/vacancies" className="btn btn-outline-primary">
              Все вакансии
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
