import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/profile.png";
import { useNavigate } from "react-router-dom";
import { updateProfileApi } from "../../api/auth.js";
import './Profile.css';

const API_URL = "http://127.0.0.1:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isSaving, setIsSaving] = useState(false);
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
      .then(data => {
        setProfile(data);
        setEditedProfile(data);
      })
      .catch(err => setError(err.message));
  }, [token]);

  const handleEditChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToUpdate = {
        username: editedProfile.username,
        email: editedProfile.email,
        age: editedProfile.age
      };
      const updatedProfile = await updateProfileApi(dataToUpdate);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Ошибка при сохранении профиля: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

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
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editedProfile.username || ""}
                onChange={(e) => handleEditChange("username", e.target.value)}
                placeholder="Имя пользователя"
                className="edit-input"
              />
              <input
                type="email"
                value={editedProfile.email || ""}
                onChange={(e) => handleEditChange("email", e.target.value)}
                placeholder="Email"
                className="edit-input"
              />
              <input
                type="number"
                value={editedProfile.age || ""}
                onChange={(e) => handleEditChange("age", e.target.value)}
                placeholder="Возраст"
                className="edit-input"
              />
              <div className="edit-buttons">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="username">{profile.username}</div>

              <div className="family-row">
                <div>{profile.family?.family_name ?? "No family"}</div>
                {!profile.family && (
                  <button className="find-family-btn">Find family</button>
                )}
              </div>

              <div className="age">{profile.age ? profile.age + " age" : ""}</div>
            </>
          )}
        </div>
      </div>

      <div className="email">{profile.email}</div>
      <div className="buttons">
        {!isEditing && (
          <button className="change-data-btn" onClick={() => setIsEditing(true)}>
            Change Data
          </button>
        )}
        <button className="finance-tracker-btn" onClick={() => navigate("/finance")}>
          Finance tracker
        </button>
      </div>
    </div>
  );
}
