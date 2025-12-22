import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/profile.png";
import { useNavigate } from "react-router-dom";
import './Profile.css';

const API_URL = "http://127.0.0.1:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Нет токена. Пользователь не авторизован.");
      return;
    }

    fetch(`${API_URL}/api/users/profile/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Ошибка загрузки профиля");
        return res.json();
      })
      .then(setProfile)
      .catch(err => setError(err.message));
  }, [token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>Загрузка профиля...</p>;

  const avatarUrl = profile.avatar
    ? `${API_URL}${profile.avatar}`
    : defaultAvatar;

  return (
    <div className="profile-container">
      <div className="profile-main">
        <img src={avatarUrl} className="avatar" alt="avatar" />
        <div className="profile-info">
        <div className="username">{profile.username}</div>

        <div className="family-row">
            <div>{profile.family?.family_name ?? "No family"}</div>
            {!profile.family && (
            <button className="find-family-btn">Find family</button>
            )}
        </div>

        <div className="age"> {profile.age+" age" ?? ""}</div>
      </div>
    </div>

    <div className="email">{profile.email}</div>
    <div className="buttons"> 
        <button className="change-data-btn">Change Data</button>
        <button className="finance-tracker-btn" onClick={() => navigate("/finance")}>Finance tracker</button>
    </div>
  </div>
  );
}
