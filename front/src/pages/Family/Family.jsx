import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Family.css";

const Family = () => {
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalFamilyExpenses: 0,
    memberCount: 0,
    byMember: {},
    byCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState("all");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch family info
      const familyResponse = await fetch(`${API_URL}/api/family/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!familyResponse.ok) {
        if (familyResponse.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch family data");
      }

      const familyInfo = await familyResponse.json();
      setFamilyData(familyInfo);

      // Fetch family members
      const membersResponse = await fetch(`${API_URL}/api/family-members/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (membersResponse.ok) {
        const membersList = await membersResponse.json();
        setMembers(Array.isArray(membersList) ? membersList : membersList.results || []);
      }

      // Fetch all family transactions
      const transResponse = await fetch(`${API_URL}/api/family-transactions/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (transResponse.ok) {
        const transList = await transResponse.json();
        const transactionList = Array.isArray(transList) ? transList : transList.results || [];
        const expensesList = transactionList.filter(
          (t) => t.transaction_type === "expense"
        );
        setExpenses(expensesList);
        calculateSummary(expensesList, membersList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (expensesList, membersList) => {
    const totalExpenses = expensesList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const byMember = {};
    const byCategory = {};

    expensesList.forEach((exp) => {
      const memberName = exp.user?.username || "Unknown";
      byMember[memberName] = (byMember[memberName] || 0) + parseFloat(exp.amount);

      const catName = exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
    });

    setSummary({
      totalFamilyExpenses: totalExpenses,
      memberCount: membersList?.length || 0,
      byMember,
      byCategory,
    });
  };

  const filteredExpenses =
    selectedMember === "all"
      ? expenses
      : expenses.filter((exp) => exp.user?.username === selectedMember);

  if (loading) {
    return <div className="family-container loading">Loading family data...</div>;
  }

  if (!familyData) {
    return (
      <div className="family-container">
        <div className="error-message">
          No family data found. Please join or create a family first.
        </div>
      </div>
    );
  }

  return (
    <div className="family-container">
      <div className="family-header">
        <h1>👨‍👩‍👧‍👦 {familyData.family_name || "Family Budget"}</h1>
        <p>Overall family expenses view</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Summary Cards */}
      <div className="family-summary">
        <div className="summary-card total">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Family Expenses</h3>
            <p className="card-value">${summary.totalFamilyExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card members">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Family Members</h3>
            <p className="card-value">{summary.memberCount}</p>
          </div>
        </div>

        <div className="summary-card average">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Average Per Member</h3>
            <p className="card-value">
              ${summary.memberCount > 0 ? (summary.totalFamilyExpenses / summary.memberCount).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Member Breakdown */}
      {Object.keys(summary.byMember).length > 0 && (
        <div className="member-breakdown">
          <h3>By Member</h3>
          <div className="member-list">
            {Object.entries(summary.byMember)
              .sort(([, a], [, b]) => b - a)
              .map(([member, amount]) => (
                <div key={member} className="member-item">
                  <span className="member-name">👤 {member}</span>
                  <span className="member-amount">${amount.toFixed(2)}</span>
                  <div className="member-bar">
                    <div
                      className="member-fill"
                      style={{
                        width: `${(amount / summary.totalFamilyExpenses) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div className="category-breakdown">
          <h3>By Category</h3>
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
                        width: `${(amount / summary.totalFamilyExpenses) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter by Member */}
      <div className="filter-section">
        <label>Filter by Member:</label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Members</option>
          {Object.keys(summary.byMember).map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="transactions-section">
        <h3>Family Transactions</h3>
        {filteredExpenses.length === 0 ? (
          <div className="no-data">
            <p>No family expenses found</p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredExpenses.map((expense) => (
              <div key={expense.transaction_id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{expense.description || "Transaction"}</h4>
                  <p className="transaction-meta">
                    <span className="member-tag">{expense.user?.username}</span>
                    <span className="category-tag">
                      {expense.category?.category_name || "Uncategorized"}
                    </span>
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

export default Family;
