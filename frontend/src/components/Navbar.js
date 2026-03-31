import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          UniJobs
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/vacancies" onClick={closeMenu}>
                Вакансии
              </Link>
            </li>
            {user && user.role === "student" && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-applications" onClick={closeMenu}>
                  Мои заявки
                </Link>
              </li>
            )}
            {user && user.role === "employer" && (
              <li className="nav-item">
                <Link className="nav-link" to="/vacancies/new" onClick={closeMenu}>
                  Создать вакансию
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light">
                    {user.full_name}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm mt-1"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeMenu}>
                    Войти
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={closeMenu}>
                    Регистрация
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
