import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, saveToken } from "../../api/auth";
import "./Login.css";

export default function Login() {
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

      if (token) saveToken(token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      navigate(redirect || "/");
    } catch (err) {
      const msg =
        err?.data?.non_field_errors?.[0] ||
        err?.data?.detail ||
        err?.data?.error ||
        err?.message ||
        "Invalid email or password";

      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="aa@gmail.com"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password123"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Sign ining..." : "Sign in"}
          </button>
          <div className="links">
            <Link to="/register" className="link">Join now</Link>
          </div>
        </div>
      </form>

      
    </div>
  );
}
