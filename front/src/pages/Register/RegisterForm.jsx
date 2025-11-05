import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      await registerApi({ username, email, password, password2 });
      // после удачной регистрации — перейти на страницу входа
      navigate("/login");
    } catch (err) {
      const msg = (err && err.data && (err.data.detail || err.data.error || JSON.stringify(err.data))) || "Ошибка регистрации";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div>
        <label>Логин</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label>Повтор пароля</label>
        <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
      </div>

      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>{loading ? "Регистрация..." : "Зарегистрироваться"}</button>
    </form>
  );
}
