import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./FamilySearch.css";

const API_URL = "http://127.0.0.1:8000";

export default function FamilySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [families, setFamilies] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null); // Состояние для выделения
  const [hasSearched, setHasSearched] = useState(false); // Чтобы не показывать "Not found" до первого поиска

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchInvites = useCallback(() => {
    fetch(`${API_URL}/api/family/invites/`, {
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

    fetch(`${API_URL}/api/family/search/?name=${searchQuery}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFamilies(data);
        setHasSearched(true);
        setSelectedFamilyId(null); // Сбрасываем выделение при новом поиске
      })
      .catch(() => {
        setFamilies([]);
        setHasSearched(true);
      });
  };

  const sendJoinRequest = (familyId) => {
    fetch(`${API_URL}/api/family/join-request/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ family_id: familyId }),
    }).then((res) => {
      if (res.ok) alert("Request sent successfully!");
      else alert("Error sending request");
    });
  };

  return (
    <div className="family-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

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
                  <button className="accept-btn">Accept</button>
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
          />
          <button type="submit">Search</button>
        </form>

        <div className="results">
          {families.length > 0 ? (
            families.map((f) => (
              <div 
                key={f.id} 
                /* Добавляем класс 'selected' если ID совпадает */
                className={`family-result-card clickable ${selectedFamilyId === f.id ? "selected" : ""}`}
                onClick={() => setSelectedFamilyId(f.id)}
              >
                <span>{f.name}</span>
                {selectedFamilyId === f.id && (
                  <button 
                    className="send-request-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Чтобы не срабатывал onClick контейнера
                      sendJoinRequest(f.id);
                    }}
                  >
                    Send Join Request
                  </button>
                )}
              </div>
            ))
          ) : (
            /* Показываем текст, только если поиск уже был произведен */
            hasSearched && <p className="not-found-text">No families found with that name.</p>
          )}
        </div>
      </div>

      <div className="create-section">
        <button className="create-family-btn" onClick={() => navigate("/family/create")}>
          Create Family
        </button>
      </div>
    </div>
  );
}