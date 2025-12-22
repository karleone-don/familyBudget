import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvatar from "../../assets/profile.png";
import "./Family.css"; 

const API_URL = "http://127.0.0.1:8000";

export default function FamilyMembersPage() {
    const [members, setMembers] = useState([]);
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myUser, setMyUser] = useState(null);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [showInvites, setShowInvites] = useState(false);
    const [invitesLoading, setInvitesLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [roleChangeLoading, setRoleChangeLoading] = useState(false);
    
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

    // Fetch pending invitations for this family (admin only)
    const fetchPendingInvites = () => {
        if (!isFamilyAdmin) return;
        
        setInvitesLoading(true);
        fetch(`${API_URL}/api/families/${familyId}/pending_invites/`, {
            headers: { Authorization: `Token ${token}` },
        })
        .then(res => res.json())
        .then(data => setPendingInvites(data.invitations || []))
        .catch(() => setPendingInvites([]))
        .finally(() => setInvitesLoading(false));
    };

    // Change member role
    const handleChangeRole = (memberId, newRole) => {
        setRoleChangeLoading(true);
        fetch(`${API_URL}/api/families/${familyId}/set_role/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: memberId, role_name: newRole }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                // Update local state
                setMembers(members.map(m => 
                    m.user_id === memberId ? { ...m, role_name: newRole } : m
                ));
                setSelectedMember(null);
            }
        })
        .finally(() => setRoleChangeLoading(false));
    };

    // Delete member from family
    const handleDeleteMember = (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member from the family?")) return;
        
        fetch(`${API_URL}/api/families/${familyId}/remove_member/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: memberId }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                // Remove member from list
                setMembers(members.filter(m => m.user_id !== memberId));
                setSelectedMember(null);
            }
        });
    };

    // Accept or decline invitation
    const handleInviteResponse = (invitationId, accept) => {
        const action = accept ? "accept" : "decline";
        fetch(`${API_URL}/api/families/${familyId}/manage_invite/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ invitation_id: invitationId, action: action }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                // Remove from pending invites list
                setPendingInvites(pendingInvites.filter(i => i.invitation_id !== invitationId));
                // If accepted, refresh family members
                if (accept) {
                    fetch(`${API_URL}/api/families/${familyId}/`, {
                        headers: { Authorization: `Token ${token}` },
                    })
                    .then(res => res.json())
                    .then(data => setMembers(data.members || []));
                }
            }
        });
    };

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
                                    {isFamilyAdmin && selectedMember === member.user_id ? (
                                        // Admin role change UI
                                        <div className="role-selector">
                                            <select 
                                                value={member.role_name}
                                                onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                                                disabled={roleChangeLoading}
                                                className="role-dropdown"
                                            >
                                                <option value="family_member">Family Member</option>
                                                <option value="kid">Kid</option>
                                            </select>
                                            <button 
                                                className="delete-member-btn"
                                                onClick={() => handleDeleteMember(member.user_id)}
                                                disabled={roleChangeLoading}
                                            >
                                                Delete
                                            </button>
                                            <button 
                                                className="cancel-btn"
                                                onClick={() => setSelectedMember(null)}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`role-text-label ${member.role_name}`}>
                                                {member.role_name}
                                            </span>
                                            
                                            {/* Show edit button only for admin and not for themselves */}
                                            {isFamilyAdmin && member.user_id !== myUser?.user_id && (
                                                <button 
                                                    className="edit-role-btn"
                                                    onClick={() => setSelectedMember(member.user_id)}
                                                >
                                                    ⋮
                                                </button>
                                            )}
                                            
                                            {/* Передаем user_id в стейт для просмотра финансов члена семьи */}
                                            {member.role_name !== "kid" && (
                                                <button 
                                                    className="finance-view-btn"
                                                    onClick={() => navigate(`/finance`, { state: { userId: member.user_id, memberName: member.username } })}
                                                >
                                                    View Finance
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ФИКСИРОВАННЫЙ НИЗ */}
                <div className="bottom-actions">
                    {isFamilyAdmin && (
                        <>
                            <button className="add-member-btn" onClick={() => navigate("/add-member", { state: { familyId } })}>
                                Add Member
                            </button>
                            <button 
                                className="invites-btn"
                                onClick={() => {
                                    setShowInvites(!showInvites);
                                    if (!showInvites) fetchPendingInvites();
                                }}
                            >
                                Invites ({pendingInvites.length})
                            </button>
                        </>
                    )}
                    
                    {!isChild && (
                        <button className="family-finance-btn" onClick={() => navigate("/family-dashboard", { state: { familyId } })}>
                            Family Finance
                        </button>
                    )}
                </div>

                {/* Pending Invites Modal */}
                {showInvites && isFamilyAdmin && (
                    <div className="invites-modal">
                        <div className="invites-content">
                            <div className="invites-header-modal">
                                <h3>Pending Join Requests</h3>
                                <button className="close-btn" onClick={() => setShowInvites(false)}>✕</button>
                            </div>
                            {invitesLoading ? (
                                <p>Loading invites...</p>
                            ) : pendingInvites.length > 0 ? (
                                <div className="invites-list">
                                    {pendingInvites.map(invite => (
                                        <div key={invite.invitation_id} className="invite-item-modal">
                                            <span className="invite-email">{invite.invited_email}</span>
                                            <div className="invite-actions">
                                                <button 
                                                    className="accept-btn-modal"
                                                    onClick={() => handleInviteResponse(invite.invitation_id, true)}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="decline-btn-modal"
                                                    onClick={() => handleInviteResponse(invite.invitation_id, false)}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-invites">No pending invitations</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}