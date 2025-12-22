import React, { useEffect, useState } from "react";
import "./InvitationsModal.css";

const API_URL = "http://127.0.0.1:8000";

export default function InvitationsModal({ isOpen, onClose, token }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users/invites/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch invitations");
      const data = await response.json();
      setInvitations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/api/users/accept_invitation/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ invitation_id: invitationId }),
        }
      );
      if (!response.ok) throw new Error("Failed to accept invitation");
      const data = await response.json();
      setSuccessMessage(data.message);
      setInvitations(
        invitations.filter((inv) => inv.invitation_id !== invitationId)
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (invitationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/api/users/decline_invitation/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ invitation_id: invitationId }),
        }
      );
      if (!response.ok) throw new Error("Failed to decline invitation");
      const data = await response.json();
      setSuccessMessage(data.message);
      setInvitations(
        invitations.filter((inv) => inv.invitation_id !== invitationId)
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Family Invitations</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="modal-body">
          {loading ? (
            <p className="loading">Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p className="no-invitations">You have no pending invitations</p>
          ) : (
            <div className="invitations-list">
              {invitations.map((invitation) => (
                <div key={invitation.invitation_id} className="invitation-card">
                  <div className="invitation-info">
                    <h3>{invitation.family_name}</h3>
                    <p className="invitation-email">
                      Invited by: {invitation.invited_by_name || "Unknown"}
                    </p>
                    <p className="invitation-date">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="invitation-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleAccept(invitation.invitation_id)}
                      disabled={loading}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleDecline(invitation.invitation_id)}
                      disabled={loading}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
