import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./FamilySearch.css";

const API_URL = "http://127.0.0.1:8000";

export default function FamilySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [families, setFamilies] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchInvites = useCallback(() => {
    fetch(`${API_URL}/api/families/invites/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then(setInvites)
      .catch(() => console.error("Failed to fetch invites"));
  }, [token]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    fetch(`${API_URL}/api/families/search/?name=${searchQuery}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFamilies(data);
        setHasSearched(true);
        setSelectedFamilyId(null);
        setMessage("");
      })
      .catch(() => {
        setFamilies([]);
        setHasSearched(true);
        setMessage("Error searching families");
      })
      .finally(() => setLoading(false));
  };

  const sendJoinRequest = (familyId) => {
    setLoading(true);
    fetch(`${API_URL}/api/families/join_request/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ family_id: familyId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setMessage("✓ Join request sent! Waiting for admin approval...");
          setFamilies([]);
          setSearchQuery("");
          setHasSearched(false);
          setTimeout(() => navigate("/family-members"), 2500);
        } else {
          setMessage(data.error || "Error sending request");
        }
      })
      .catch(() => {
        setMessage("Error sending request");
      })
      .finally(() => setLoading(false));
  };

  const acceptInvitation = (invitationId) => {
    setLoading(true);
    fetch(`${API_URL}/api/families/accept_invitation/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invitation_id: invitationId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setMessage("Invitation accepted!");
          fetchInvites();
          setTimeout(() => navigate("/family-members"), 1500);
        } else {
          setMessage("Error accepting invitation");
        }
      })
      .catch(() => {
        setMessage("Error accepting invitation");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="family-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {message && <div className="message-banner">{message}</div>}

      <div className="invites-header">
        <button className="invites-toggle" onClick={() => setShowInvites(!showInvites)}>
          Invites ({invites.length})
        </button>
        {showInvites && (
          <div className="invites-dropdown">
            {invites.length > 0 ? (
              invites.map((inv) => (
                <div key={inv.id} className="invite-item">
                  <span>{inv.family_name} invited you</span>
                  <button
                    className="accept-btn"
                    onClick={() => acceptInvitation(inv.id)}
                    disabled={loading}
                  >
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data-text">No pending invites</p>
            )}
          </div>
        )}
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Enter family name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="results">
          {families.length > 0 ? (
            families.map((f) => (
              <div 
                key={f.family_id} 
                className={`family-result-card clickable ${selectedFamilyId === f.family_id ? "selected" : ""}`}
                onClick={() => setSelectedFamilyId(f.family_id)}
              >
                <span>{f.family_name}</span>
                {selectedFamilyId === f.family_id && (
                  <button 
                    className="send-request-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendJoinRequest(f.family_id);
                    }}
                    disabled={loading}
                  >
                    Send Join Request
                  </button>
                )}
              </div>
            ))
          ) : (
            hasSearched && <p className="not-found-text">No families found with that name.</p>
          )}
        </div>
      </div>

      <div className="create-section">
        <button
          className="create-family-btn"
          onClick={() => navigate("/family/create")}
          disabled={loading}
        >
          Create Family
        </button>
      </div>
    </div>
  );
}