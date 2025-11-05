const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

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
    credentials: "include",
  });
  
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const error = new Error(data.non_field_errors?.[0] || "Login failed");
    error.data = data;
    throw error;
  }
  
  return {
    token: data.token,
    user: data.user,
    redirect: data.redirect_url
  };
}

export async function registerApi({ username, email, password, password2, age }) {
  const res = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      password2,
      age,
      role_name: "solo" // default role
    }),
    credentials: "include",
  });
  
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const error = new Error("Registration failed");
    error.data = data;
    throw error;
  }
  
  return {
    token: data.token,
    user: data.user,
    redirect: data.redirect_url
  };
}