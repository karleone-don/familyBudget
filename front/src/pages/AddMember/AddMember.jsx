import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AddMember.css";

const API_URL = "http://127.0.0.1:8000";

export default function AddMemberPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const familyId = location.state?.familyId;

    useEffect(() => {
        if (!familyId) {
            navigate("/family-members");
        }
    }, [familyId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setMessage("Please enter an email address");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/api/families/${familyId}/invite/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Invitation sent to ${email}!`);
                setMessageType("success");
                setEmail("");
                setTimeout(() => {
                    navigate("/family-members", { state: { familyId } });
                }, 2000);
            } else {
                setMessage(data.error || "Failed to send invitation");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/family-members", { state: { familyId } });
    };

    if (!familyId) {
        return null;
    }

    return (
        <div className="add-member-container">
            <div className="add-member-card">
                <h2>Invite Member to Family</h2>
                
                <form onSubmit={handleSubmit} className="add-member-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter member's email"
                            disabled={loading}
                        />
                    </div>

                    {message && (
                        <div className={`message ${messageType}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="send-invite-btn"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Invitation"}
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
