import { useState } from "react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError("Заполни все поля!");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Пароли не совпадают!");
      return;
    }

    console.log("Отправляем:", form);
    setSuccess("Регистрация успешна! 🎉");
    setForm({ username: "", email: "", password: "", confirm: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <input
        type="text"
        name="username"
        placeholder="Логин"
        value={form.username}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={form.password}
        onChange={handleChange}
      />

      <input
        type="password"
        name="confirm"
        placeholder="Повторите пароль"
        value={form.confirm}
        onChange={handleChange}
      />

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <button type="submit">Зарегистрироваться</button>
    </form>
  );
}
