import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateFamily.css"; 

const API_URL = "http://127.0.0.1:8000";

export default function CreateFamilyPage() {
  const [familyName, setFamilyName] = useState("");
  const [localError, setLocalError] = useState(null); // Для вывода ошибок без alert
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleCreate = (e) => {
    e.preventDefault();
    setLocalError(null); // Сбрасываем старые ошибки

    fetch(`${API_URL}/api/families/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        family_name: familyName // Убедись, что на бэкенде поле называется так же
      }),
    })
      .then((res) => {
        if (res.ok) {
          // Никаких алертов, просто уходим в профиль
          navigate("/profile"); 
        } else {
          setLocalError("Error: This name might be taken or invalid.");
        }
      })
      .catch(() => setLocalError("Server connection error."));
  };

  return (
    <div className="family-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="search-section" style={{ marginTop: "100px" }}>
        <h2 style={{ fontFamily: 'Inika', fontSize: '2.5rem', textAlign: 'center', marginBottom: '30px' }}>
          Create New Family
        </h2>
        
        <form onSubmit={handleCreate} className="login-form"> 
          <div>
            <label>Name</label>
            <input 
              type="text" 
              placeholder="Family name..." 
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          {/* Вывод ошибки в стиле твоей страницы логина */}
          {localError && <p className="error" style={{marginTop: "10px"}}>{localError}</p>}

          <button type="submit" style={{ alignSelf: 'center', marginTop: '20px' }}>
            Create
          </button>
        </form>
      </div>
    </div>
  );
}