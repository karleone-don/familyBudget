import { Link } from "react-router-dom";
import "./Main.css";

export default function Main() {
  return (
    <div className="main-page">
      <h1>Добро пожаловать!</h1>
      <p>Это главная страница твоего приложения.</p>
      <p>Здесь можно рассказать кратко, что делает проект.</p>

      <Link to="/login" className="btn-main">Перейти к авторизации</Link>
    </div>
  );
}
