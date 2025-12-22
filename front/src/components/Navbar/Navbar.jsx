import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import "./Navbar.css";

const API_URL = "http://127.0.0.1:8000";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/users/profile/`, {
                headers: { Authorization: `Token ${token}` },
            })
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(() => setUser(null));
        }
    }, [token]);

    // Hide navbar on login, register, and main pages
    const hiddenPages = ["/", "/login", "/register"];
    if (hiddenPages.includes(location.pathname) || !token) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setShowMenu(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <span className="navbar-username">{user?.username || "User"}</span>
                </div>
                
                <div className="navbar-right">
                    <button className="menu-toggle" onClick={() => setShowMenu(!showMenu)}>
                        ☰
                    </button>
                    
                    {showMenu && (
                        <div className="navbar-menu">
                            <button 
                                className="navbar-link"
                                onClick={() => {
                                    navigate("/profile");
                                    setShowMenu(false);
                                }}
                            >
                                {t("Profile")}
                            </button>
                            <button 
                                className="navbar-link"
                                onClick={() => {
                                    navigate("/finance");
                                    setShowMenu(false);
                                }}
                            >
                                {t("Finance")}
                            </button>
                            <button 
                                className="navbar-link"
                                onClick={() => {
                                    navigate("/analytics");
                                    setShowMenu(false);
                                }}
                            >
                                {t("Analytics")}
                            </button>
                            <button 
                                className="navbar-link"
                                onClick={() => {
                                    navigate("/ai-recommendations");
                                    setShowMenu(false);
                                }}
                            >
                                {t("AI Recommendations")}
                            </button>
                            <hr className="navbar-divider" />
                            <div className="language-selector">
                                <span className="language-label">{t("Language")}:</span>
                                <button 
                                    className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    EN
                                </button>
                                <button 
                                    className={`language-btn ${i18n.language === 'ru' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('ru')}
                                >
                                    RU
                                </button>
                            </div>
                            <hr className="navbar-divider" />
                            <button 
                                className="navbar-logout"
                                onClick={handleLogout}
                            >
                                {t("Logout")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
