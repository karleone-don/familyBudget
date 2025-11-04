import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-page">
      <h2 className="login-title">Авторизация</h2>
      <LoginForm />

      <div className="links">
        <Link to="/" className="link">На главную</Link>
        <Link to="/register" className="link">Регистрация</Link>
      </div>
    </div>
  );
}
