import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../api/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { token, user, redirect } = await loginApi({ email, password });

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to role-specific dashboard or fallback to home
      navigate(redirect || "/");
    } catch (err) {
      setError(err.data?.non_field_errors?.[0] || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div>
        <label>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
