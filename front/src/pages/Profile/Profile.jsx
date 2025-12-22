import { useEffect, useState } from "react";
import defaultAvatar from "../../assets/profile.png";
import { useNavigate } from "react-router-dom";
import { updateProfileApi, fetchInvitationsApi } from "../../api/auth.js";
import InvitationsModal from "../../components/InvitationsModal/InvitationsModal.jsx";
import { useTranslation } from 'react-i18next';
import './Profile.css';

const API_URL = "http://127.0.0.1:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError(t("Нет токена. Пользователь не авторизован."));
      return;
    }

    fetch(`${API_URL}/api/users/profile/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(t("Ошибка загрузки профиля"));
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setEditedProfile(data);
      })
      .catch(err => setError(err.message));

    // Fetch invitations count
    fetchInvitationsApi()
      .then(invitations => {
        setInvitationsCount(invitations.length);
      })
      .catch(err => {
        // Silently handle error for invitations count
        console.log("Could not fetch invitations:", err);
      });
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
      setError(t("Ошибка при сохранении профиля: ") + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>{t("Загрузка профиля...")}</p>;

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
                placeholder={t("Имя пользователя")}
                className="edit-input"
              />
              <input
                type="email"
                value={editedProfile.email || ""}
                onChange={(e) => handleEditChange("email", e.target.value)}
                placeholder={t("Email")}
                className="edit-input"
              />
              <input
                type="number"
                value={editedProfile.age || ""}
                onChange={(e) => handleEditChange("age", e.target.value)}
                placeholder={t("Возраст")}
                className="edit-input"
              />
              <div className="edit-buttons">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? t("Сохранение...") : t("Сохранить")}
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {t("Отмена")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="username">{profile.username}</div>

              <div className="family-row">
                {profile.family ? (
                    // Если семья есть, показываем название и кнопку перехода к списку участников
                    <div className="family-active">
                        <span className="family-name">{profile.family_name}</span>
                        <button 
                            className="view-family-btn" 
                            onClick={() => navigate("/family-members", { state: { familyId: profile.family } })}
                        >
                            {t("Family")}
                        </button>
                    </div>
                ) : (
                    // Если семьи нет, показываем кнопку поиска
                    <div className="family-active">
                        <span className="family-name">{t("No family")}</span>
                        <button 
                            className="find-family-btn" 
                            onClick={() => navigate("/family-search")}
                        >
                            {t("Find family")}
                        </button>
                    </div>
                )}
              </div>

              <div className="email">{profile.email}</div>
              <div className="buttons">
                {!isEditing && (
                  <>
                    <button 
                      className="invitations-btn" 
                      onClick={() => setShowInvitationsModal(true)}
                    >
                      {t("Invitations")} {invitationsCount > 0 && `(${invitationsCount})`}
                    </button>
                    <button className="change-data-btn" onClick={() => setIsEditing(true)}>
                      {t("Change Data")}
                    </button>
                  </>
                )}
                <button className="finance-tracker-btn" onClick={() => navigate("/finance")}>
                  {t("Finance tracker")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <InvitationsModal
        isOpen={showInvitationsModal}
        onClose={() => setShowInvitationsModal(false)}
        token={token}
      />
    </div>
  );
}
