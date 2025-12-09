import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Solo.css";

const Solo = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    byCategory: {},
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchExpenses();
    fetchRecommendations();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/transactions/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      const transactionList = Array.isArray(data) ? data : data.results || [];

      // Filter only expenses
      const expensesList = transactionList.filter(
        (t) => t.transaction_type === "expense"
      );
      setExpenses(expensesList);
      calculateSummary(expensesList);
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

  const calculateSummary = (expensesList) => {
    const total = expensesList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const byCategory = {};
    expensesList.forEach((exp) => {
      const catName = exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
    });

    setSummary({
      total,
      byCategory,
      count: expensesList.length,
    });
  };

  const filteredExpenses =
    filterCategory === "all"
      ? expenses
      : expenses.filter(
          (exp) =>
            exp.category?.category_name === filterCategory
        );

  const categories = [
    "all",
    ...Object.keys(summary.byCategory).sort(),
  ];

  if (loading) {
    return <div className="solo-container loading">Loading your expenses...</div>;
  }

  return (
    <div className="solo-container">
      <div className="solo-header">
        <h1>💰 My Expenses</h1>
        <p>Track your personal spending</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>💡 AI Recommendations</h3>
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

      {/* Summary Cards */}
      <div className="solo-summary">
        <div className="summary-card total">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-value">${summary.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card count">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Transactions</h3>
            <p className="card-value">{summary.count}</p>
          </div>
        </div>

        <div className="summary-card average">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Average Per Transaction</h3>
            <p className="card-value">
              ${summary.count > 0 ? (summary.total / summary.count).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

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
                        width: `${(amount / summary.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="transactions-section">
        <h3>Transactions</h3>
        {filteredExpenses.length === 0 ? (
          <div className="no-data">
            <p>No expenses found</p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredExpenses.map((expense) => (
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

export default Solo;
