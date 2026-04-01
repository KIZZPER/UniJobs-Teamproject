import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VacancyListPage from "./pages/VacancyListPage";
import VacancyDetailPage from "./pages/VacancyDetailPage";
import ApplyPage from "./pages/ApplyPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import CreateVacancyPage from "./pages/CreateVacancyPage";
import MyVacanciesPage from "./pages/MyVacanciesPage";
import VacancyApplicationsPage from "./pages/VacancyApplicationsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/vacancies" element={<VacancyListPage />} />
              <Route path="/vacancies/new" element={<CreateVacancyPage />} />
              <Route path="/vacancies/:id" element={<VacancyDetailPage />} />
              <Route path="/vacancies/:id/apply" element={<ApplyPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/my-vacancies" element={<MyVacanciesPage />} />
              <Route path="/my-vacancies/:id/applications" element={<VacancyApplicationsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
