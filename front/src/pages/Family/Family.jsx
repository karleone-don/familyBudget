import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../../assets/profile.png";
import "./Family.css"; 

const API_URL = "http://127.0.0.1:8000";

export default function FamilyMembersPage() {
    const [members, setMembers] = useState([]);
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myUser, setMyUser] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const familyId = location.state?.familyId;

    useEffect(() => {
        if (!familyId) {
            navigate("/profile");
            return;
        }

        // 1. Данные семьи
        fetch(`${API_URL}/api/families/${familyId}/`, {
            headers: { Authorization: `Token ${token}` },
        })
        .then(res => res.json())
        .then(data => {
            setFamilyData(data);
            setMembers(data.members || []);
            setLoading(false);
        })
        .catch(() => setLoading(false));

        // 2. Данные текущего юзера (для проверки ролей)
        fetch(`${API_URL}/api/users/profile/`, {
            headers: { Authorization: `Token ${token}` },
        })
        .then(res => res.json())
        .then(setMyUser);
    }, [token, familyId, navigate]);

    // Проверки доступа
    const isFamilyAdmin = familyData?.admin?.user_id === myUser?.user_id;
    const isChild = myUser?.role_name === 'kid'; // согласно твоему бэкенду 'kid'

    return (
        <div className="family-page">
            <div className="family-content">
                
                {/* ФИКСИРОВАННАЯ ШАПКА */}
                <div className="family-header-area">
                    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                    <h1 className="family-title">{familyData?.family_name || "Family"}</h1>
                    <h2 className="members-subtitle">Family Members</h2>
                    <hr className="separator-line" />
                </div>

                {/* СКРОЛЛЯЩИЙСЯ СПИСОК (как список транзакций) */}
                <div className="members-list">
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : (
                        members.map(member => (
                            <div key={member.user_id} className="member-card">
                                <div className="member-left">
                                    <img 
                                        src={member.avatar ? `${API_URL}${member.avatar}` : defaultAvatar} 
                                        alt="avatar" 
                                        className="member-avatar-small"
                                    />
                                    <span className="member-name">{member.username}</span>
                                </div>

                                <div className="member-right">
                                    <span className={`role-text-label ${member.role_name}`}>
                                        {member.role_name}
                                    </span>
                                    
                                    {/* Передаем user_id в стейт, чтобы на странице финансов сделать запрос ?user_id=... */}
                                    {member.role_name !== "kid" && (
                                        <button 
                                            className="finance-view-btn"
                                            onClick={() => navigate(`/finance-detail`, { state: { userId: member.user_id } })}
                                        >
                                            View Finance
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ФИКСИРОВАННЫЙ НИЗ */}
                <div className="bottom-actions">
                    {isFamilyAdmin && (
                        <button className="add-member-btn" onClick={() => navigate("/family/add-member", { state: { familyId } })}>
                            Add Member
                        </button>
                    )}
                    
                    {!isChild && (
                        <button className="family-finance-btn" onClick={() => navigate("/family-finance", { state: { familyId } })}>
                            Family Finance
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}