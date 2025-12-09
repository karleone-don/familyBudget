import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FamilyMember.css";

const FamilyMember = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    myExpenses: 0,
    myTransactions: 0,
    familyTotal: 0,
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState("personal");
  const [canViewOthers, setCanViewOthers] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchData();
    fetchRecommendations();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch user profile
      const profileResponse = await fetch(`${API_URL}/api/users/profile/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const profile = await profileResponse.json();
      setUserProfile(profile);

      // Check if user is admin or family_member (not a kid)
      const isNonKid = profile.role?.role_name !== "kid";
      setCanViewOthers(isNonKid);
      setSelectedMember(profile.username);

      // Fetch family data
      if (profile.family) {
        const familyResponse = await fetch(`${API_URL}/api/family/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (familyResponse.ok) {
          const familyInfo = await familyResponse.json();
          setFamilyData(familyInfo);

          // Fetch all family members
          const membersResponse = await fetch(`${API_URL}/api/family-members/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          });

          if (membersResponse.ok) {
            const membersList = await membersResponse.json();
            setAllMembers(Array.isArray(membersList) ? membersList : membersList.results || []);
          }
        }
      }

      // Fetch transactions
      const transResponse = await fetch(`${API_URL}/api/transactions/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (transResponse.ok) {
        const transList = await transResponse.json();
        const allTransactions = Array.isArray(transList) ? transList : transList.results || [];
        const myExpenses = allTransactions.filter(
          (t) => t.transaction_type === "expense" && t.user?.user_id === profile.user_id
        );
        setExpenses(allTransactions);
        calculateSummary(myExpenses, allTransactions);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/ai/recommendations/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const calculateSummary = (myExpensesList, allTransactions) => {
    const myTotal = myExpensesList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const byCategory = {};
    myExpensesList.forEach((exp) => {
      const catName = exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
    });

    const familyTotal = allTransactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    setSummary({
      myExpenses: myTotal,
      myTransactions: myExpensesList.length,
      familyTotal,
      byCategory,
    });
  };

  let displayedExpenses = [];
  if (viewMode === "personal" || !canViewOthers) {
    // Show only current user's expenses
    displayedExpenses = expenses.filter(
      (exp) =>
        exp.transaction_type === "expense" &&
        exp.user?.username === userProfile?.username
    );
  } else if (viewMode === "family" && selectedMember) {
    // Show selected member's expenses
    displayedExpenses = expenses.filter(
      (exp) =>
        exp.transaction_type === "expense" &&
        exp.user?.username === selectedMember
    );
  }

  if (loading) {
    return <div className="member-container loading">Loading your data...</div>;
  }

  if (!userProfile) {
    return (
      <div className="member-container">
        <div className="error-message">Failed to load user profile</div>
      </div>
    );
  }

  return (
    <div className="member-container">
      <div className="member-header">
        <h1>👤 {userProfile.username}'s Budget</h1>
        {userProfile.family && (
          <p>Family: {familyData?.family_name || "Unknown Family"}</p>
        )}
        <p className="role-badge">Role: {userProfile.role?.role_name || "Unknown"}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>💡 AI Budget Recommendations</h3>
          <div className="recommendations-list">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className={`recommendation-card priority-${rec.priority}`}>
                <div className="recommendation-header">
                  <h4>{rec.title}</h4>
                  <span className="priority-badge">{rec.priority}</span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                {rec.potential_savings > 0 && (
                  <p className="potential-savings">
                    💰 Potential savings: ${rec.potential_savings.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Toggle - Only for non-kids */}
      {canViewOthers && userProfile.family && (
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === "personal" ? "active" : ""}`}
            onClick={() => setViewMode("personal")}
          >
            My Expenses
          </button>
          <button
            className={`mode-btn ${viewMode === "family" ? "active" : ""}`}
            onClick={() => setViewMode("family")}
          >
            Family Overview
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="member-summary">
        <div className="summary-card personal">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>My Expenses</h3>
            <p className="card-value">${summary.myExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card transactions">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>My Transactions</h3>
            <p className="card-value">{summary.myTransactions}</p>
          </div>
        </div>

        {userProfile.family && (
          <div className="summary-card family">
            <div className="card-icon">👨‍👩‍👧‍👦</div>
            <div className="card-content">
              <h3>Family Total</h3>
              <p className="card-value">${summary.familyTotal.toFixed(2)}</p>
            </div>
          </div>
        )}

        {userProfile.family && (
          <div className="summary-card share">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>My Share</h3>
              <p className="card-value">
                {summary.familyTotal > 0
                  ? ((summary.myExpenses / summary.familyTotal) * 100).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Member Selector - Only for non-kids in family view */}
      {canViewOthers && userProfile.family && viewMode === "family" && allMembers.length > 0 && (
        <div className="member-selector">
          <label>View Member Expenses:</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="member-select"
          >
            {allMembers.map((member) => (
              <option key={member.user_id} value={member.username}>
                {member.username} ({member.role?.role_name || "member"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div className="category-breakdown">
          <h3>Spending by Category</h3>
          <div className="category-list">
            {Object.entries(summary.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-amount">${amount.toFixed(2)}</span>
                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{
                        width: `${(amount / summary.myExpenses) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="transactions-section">
        <h3>
          {viewMode === "personal"
            ? "My Transactions"
            : `${selectedMember}'s Transactions`}
        </h3>
        {displayedExpenses.length === 0 ? (
          <div className="no-data">
            <p>No expenses found</p>
          </div>
        ) : (
          <div className="transactions-list">
            {displayedExpenses.map((expense) => (
              <div key={expense.transaction_id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{expense.description || "Transaction"}</h4>
                  <p className="transaction-category">
                    {expense.category?.category_name || "Uncategorized"}
                  </p>
                  <p className="transaction-date">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="transaction-amount">
                  ${parseFloat(expense.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMember;
