import React, { useEffect, useState } from "react";
import "./MemberDashboard.css";

const API_URL = "http://127.0.0.1:8000";

export default function MemberDashboard({ member, token, onNavigate }) {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!member || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_URL}/api/finance/member_data/?user_id=${member.user_id}`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .catch(() => null),
      fetch(`${API_URL}/api/transactions/?user_id=${member.user_id}`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then(res => res.json())
        .catch(() => ({ results: [] })),
    ])
      .then(([financeData, transData]) => {
        if (financeData) setFinance(financeData);
        const transactions = transData.results || transData || [];
        // Sort by date descending
        const sorted = Array.isArray(transactions)
          ? transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        setTransactions(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load member data");
        setLoading(false);
      });
  }, [member, token]);

  if (loading) {
    return <div className="member-dashboard-loading">Loading {member?.first_name || member?.username}'s dashboard...</div>;
  }

  if (error) {
    return <div className="member-dashboard-error">{error}</div>;
  }

  const defaultAvatar = "https://via.placeholder.com/150";

  return (
    <div className="member-dashboard-card">
      {/* Member Header */}
      <div className="member-dashboard-header">
        <img
          src={member?.avatar || defaultAvatar}
          alt={member?.first_name || member?.username}
          className="member-dashboard-avatar"
        />
        <div className="member-dashboard-header-info">
          <h3 className="member-dashboard-name">
            {member?.first_name || member?.username}
          </h3>
          <span className="member-dashboard-role">
            {member?.role_name || "Member"}
          </span>
        </div>
      </div>

      {/* Finance Summary */}
      {finance ? (
        <div className="member-dashboard-finance">
          <div className="finance-summary-cards">
            <div className="finance-summary-card">
              <span className="finance-summary-label">Income</span>
              <span className="finance-summary-value income">
                ${typeof finance.income === 'number' 
                  ? finance.income.toFixed(2) 
                  : '0.00'}
              </span>
            </div>
            <div className="finance-summary-card">
              <span className="finance-summary-label">Expenses</span>
              <span className="finance-summary-value expense">
                ${typeof finance.expenses === 'number' 
                  ? finance.expenses.toFixed(2) 
                  : '0.00'}
              </span>
            </div>
            <div className="finance-summary-card">
              <span className="finance-summary-label">Balance</span>
              <span className={`finance-summary-value ${
                (typeof finance.balance === 'number' ? finance.balance : parseFloat(finance.balance) || 0) >= 0 
                  ? 'balance-positive' 
                  : 'balance-negative'
              }`}>
                ${typeof finance.balance === 'number' 
                  ? finance.balance.toFixed(2) 
                  : (parseFloat(finance.balance) || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="member-dashboard-transactions">
            <h4 className="transactions-header">Recent Transactions</h4>
            {transactions.length > 0 ? (
              <div className="transactions-list">
                {transactions.slice(0, 8).map((transaction, idx) => (
                  <div key={idx} className="transaction-row">
                    <div className="transaction-left">
                      <div className="transaction-description">
                        {transaction.description || "Transaction"}
                      </div>
                      <div className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
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
        </div>
      ) : (
        <div className="member-dashboard-empty">
          <p>No finance data available</p>
        </div>
      )}
    </div>
  );
}
