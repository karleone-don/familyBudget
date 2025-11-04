import { Link } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import "./Register.css";

export default function Register() {
  return (
    <div className="register-page">
      <h2 className="register-title">Регистрация</h2>
      <RegisterForm />

      <div className="links">
        <Link to="/" className="link">На главную</Link>
        <Link to="/login" className="link">Авторизация</Link>
      </div>
    </div>
  );
}
