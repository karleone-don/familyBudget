import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi, saveToken } from "../../api/auth";
import { useTranslation } from 'react-i18next';
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== password2) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    try {
      const { token, user, redirect } = await registerApi({
        username,
        email,
        password,
        password2,
        role_name: "solo",
      });

      if (token) saveToken(token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate(redirect || "/login");
    } catch (err) {
      const msg =
        err?.data?.email?.[0] ||
        err?.data?.username?.[0] ||
        err?.data?.password?.[0] ||
        err?.data?.non_field_errors?.[0] ||
        err?.message ||
        "Ошибка регистрации";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      <form className="register-form" onSubmit={handleSubmit}>
        <div>
          <label>{t("Email")}</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            placeholder="aa@gmail.com"
          />
        </div>

        <div>
          <label>{t("username")}</label>
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="New1User"
          />
        </div>

        <div>
          <label>{t("password")}</label>
          <input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Password123"
          />
        </div>

        <div>
          <label>{t("password confirm")}</label>
          <input 
            type="password" 
            value={password2} 
            onChange={(e) => setPassword2(e.target.value)} 
            required 
            placeholder="Password123"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? t("Signing up...") : t("Sign up")}
          </button>

          <div className="register-links">
            <Link to="/login" className="link">{t("Log in")}</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
