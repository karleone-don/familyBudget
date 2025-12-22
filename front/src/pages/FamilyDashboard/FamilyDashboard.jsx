import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MemberDashboard from "../../components/MemberDashboard/MemberDashboard";
import "./FamilyDashboard.css";

const API_URL = "http://127.0.0.1:8000";

export default function FamilyDashboard() {
  const [familyData, setFamilyData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const [familyFinance, setFamilyFinance] = useState(null);
  const [familyTransactions, setFamilyTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch family finance data
  const fetchFamilyFinance = useCallback(() => {
    if (!myUser?.family) return;
    setTransactionsLoading(true);
    
    Promise.all([
      fetch(`${API_URL}/api/families/${myUser.family}/finance/summary/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .catch(() => null),
      fetch(`${API_URL}/api/families/${myUser.family}/transactions/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .catch(() => ({ results: [] })),
    ])
      .then(([financeData, transData]) => {
        if (financeData) setFamilyFinance(financeData);
        const transactions = transData.results || transData || [];
        // Sort by date descending and limit to 10 most recent
        const sorted = Array.isArray(transactions)
          ? transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
          : [];
        setFamilyTransactions(sorted);
        setTransactionsLoading(false);
      })
      .catch(() => {
        setTransactionsLoading(false);
      });
  }, [myUser?.family, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user profile
    fetch(`${API_URL}/api/users/profile/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMyUser(data);
        if (data.family) {
          return fetch(`${API_URL}/api/families/${data.family}/`, {
            headers: { Authorization: `Token ${token}` },
          });
        } else {
          setError("No family associated with this user");
          setLoading(false);
          return Promise.reject("No family");
        }
      })
      .then(res => res.json())
      .then(data => {
        setFamilyData(data);
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(err => {
        if (err !== "No family") {
          setError("Failed to load family data");
        }
        setLoading(false);
      });
  }, [token, navigate]);

  // Fetch family finance data when myUser is available
  useEffect(() => {
    if (myUser?.family) {
      fetchFamilyFinance();
    }
  }, [myUser?.family, fetchFamilyFinance]);

  if (loading) {
    return (
      <div className="family-dashboard">
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="family-dashboard">
        <div className="dashboard-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="family-dashboard">
      <div className="dashboard-container">
        {/* Family Summary Section */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">{familyData?.family_name || "Family"}</h1>
          <div className="family-summary">
            <div className="summary-card">
              <span className="summary-label">Members:</span>
              <span className="summary-value">{members.length}</span>
            </div>
            {familyData?.admin && (
              <div className="summary-card">
                <span className="summary-label">Admin:</span>
                <span className="summary-value">
                  {familyData.admin.first_name || familyData.admin.username}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Family Finance Overview Section */}
        <div className="finance-section">
          <h2 className="finance-title">Family Finance Overview</h2>
          <div className="separator-line"></div>

          {transactionsLoading ? (
            <div className="finance-loading">Loading finance data...</div>
          ) : (
            <>
              {/* Finance Summary Cards */}
              <div className="finance-summary">
                {familyFinance && (
                  <>
                    <div className="finance-card">
                      <span className="finance-label">Total Income</span>
                      <span className="finance-amount income">
                        ${typeof familyFinance.total_income === 'number' 
                          ? familyFinance.total_income.toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                    <div className="finance-card">
                      <span className="finance-label">Total Expenses</span>
                      <span className="finance-amount expense">
                        ${typeof familyFinance.total_expenses === 'number' 
                          ? familyFinance.total_expenses.toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                    <div className="finance-card">
                      <span className="finance-label">Balance</span>
                      <span className={`finance-amount ${
                        (familyFinance.total_balance || 0) >= 0 
                          ? 'balance-positive' 
                          : 'balance-negative'
                      }`}>
                        ${typeof familyFinance.total_balance === 'number' 
                          ? familyFinance.total_balance.toFixed(2) 
                          : '0.00'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="recent-transactions">
                <h3 className="transactions-subtitle">Recent Transactions (Last 10)</h3>
                {familyTransactions.length > 0 ? (
                  <div className="transactions-list">
                    {familyTransactions.map((transaction, idx) => (
                      <div key={idx} className="transaction-item">
                        <div className="transaction-left">
                          <div className="transaction-description">
                            {transaction.description || "Transaction"}
                          </div>
                          <div className="transaction-meta">
                            <span className="transaction-date">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            {transaction.user_username && (
                              <span className="transaction-user">by {transaction.user_username}</span>
                            )}
                          </div>
                        </div>
                        <div className="transaction-middle">
                          <span className="transaction-category">
                            {transaction.category_name || transaction.category || "Other"}
                          </span>
                        </div>
                        <div className={`transaction-amount ${transaction.type}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          ${parseFloat(transaction.amount || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-transactions">No transactions yet</p>
                )}
              </div>

              {/* View Full Finance Button */}
              <button
                className="view-finance-btn"
                onClick={() => navigate("/analytics", { state: { transactions: familyTransactions } })}
              >
                View Full Finance Details
              </button>
            </>
          )}
        </div>

        {/* Members' Solo Dashboards Section */}
        <div className="members-dashboards-section">
          <h2 className="members-dashboards-title">Members' Individual Dashboards</h2>
          <div className="separator-line"></div>
          <div className="members-dashboards-grid">
            {members.map((member) => (
              <MemberDashboard 
                key={member.user_id}
                member={member}
                token={token}
                onNavigate={navigate}
              />
            ))}
          </div>
          {members.length === 0 && (
            <p className="no-members">No family members yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
