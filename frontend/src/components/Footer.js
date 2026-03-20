import React from "react";

function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-4">
      <div className="container text-center">
        <small>UniJobs &copy; {new Date().getFullYear()} &mdash; Платформа поиска работы и стажировок</small>
      </div>
    </footer>
  );
}

export default Footer;
