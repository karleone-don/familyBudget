const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/** Без credentials: backend должен корректно отдавать CORS заголовки.
 *  Используются поля, которые ожидает бэкенд: email, password и для регистрации
 *  username, email, password, password2, age, role_name (role_name опционально).
 */
async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function loginApi({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error("Login failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { token: data.token, user: data.user, redirect: data.redirect_url, raw: data };
}

export async function registerApi({ username, email, password, password2, age, role_name }) {
  const payload = { username, email, password, password2 };
  if (age !== undefined) payload.age = age;
  if (role_name) payload.role_name = role_name;
  const res = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error("Register failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { token: data.token, user: data.user, redirect: data.redirect_url, raw: data };
}

export function saveToken(token) {
  if (token) localStorage.setItem("token", token);
}
export function getToken() {
  return localStorage.getItem("token");
}
export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Token ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}