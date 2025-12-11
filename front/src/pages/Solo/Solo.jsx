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
  const [recommendations, setRecommendations] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch both expenses and recommendations in parallel
      const [expensesRes, recommendationsRes] = await Promise.all([
        fetch(`${API_URL}/api/transactions/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }),
        fetch(`${API_URL}/api/ai/recommendations/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }),
      ]);

      if (!expensesRes.ok) {
        if (expensesRes.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(`API Error: ${expensesRes.status} ${expensesRes.statusText}`);
      }

      const data = await expensesRes.json();
      console.log("Transactions data:", data);
      
      const transactionList = Array.isArray(data) ? data : data.results || [];

      // Filter only expenses
      const expensesList = transactionList.filter(
        (t) => t.transaction_type === "expense" || t.type === "expense"
      );
      
      setExpenses(expensesList);
      calculateSummary(expensesList);
      
      // Handle recommendations
      if (recommendationsRes.ok) {
        const recData = await recommendationsRes.json();
        setRecommendations(recData.recommendations || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchExpenses();
  }, []);

  const calculateSummary = (expensesList) => {
    const total = expensesList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const byCategory = {};
    expensesList.forEach((exp) => {
      const catName = exp.category_name || exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
    });

    setSummary({
      total,
      byCategory,
      count: expensesList.length,
    });
  };

  // Filter by month can be implemented later if needed
  const filteredExpenses = expenses;

  if (loading) {
    return (
      <div className="solo-container loading">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading your expenses...</p>
          <div style={{ marginTop: "20px", fontSize: "24px" }}>⏳</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solo-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => window.location.reload()} style={{ marginTop: "10px", padding: "8px 16px", marginLeft: "10px" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solo-container">
      <div className="solo-header">
        <h1>💰 Мои Расходы</h1>
        <p>Отслеживай свои личные траты</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => window.location.reload()} style={{ marginTop: "10px", marginLeft: "10px", padding: "8px 16px" }}>
            Retry
          </button>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>💡 Рекомендации от ИИ</h3>
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
                    💰 Возможная экономия: ₽{rec.potential_savings.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Всего расходов</h3>
            <p className="card-value">₽{summary.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Транзакций</h3>
            <p className="card-value">{summary.count}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Средний расход</h3>
            <p className="card-value">
              ₽{summary.count > 0 ? (summary.total / summary.count).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div className="category-section">
          <h3>📋 Расходы по категориям</h3>
          <table className="category-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Сумма</th>
                <th>Доля</th>
                <th>Процент</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = ((amount / summary.total) * 100).toFixed(1);
                  return (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>₽{amount.toFixed(2)}</td>
                      <td>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>{percentage}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions List */}
      {filteredExpenses.length > 0 && (
        <div className="transactions-section">
          <h3>📝 Детальный список расходов</h3>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Описание</th>
                <th>Категория</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.transaction_id}>
                  <td>{new Date(exp.date).toLocaleDateString('ru-RU')}</td>
                  <td>{exp.description || 'N/A'}</td>
                  <td>{exp.category_name || exp.category?.category_name || 'Без категории'}</td>
                  <td>₽{parseFloat(exp.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expenses.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Нет расходов для отображения</p>
          <p>Добавьте первый расход, чтобы начать отслеживание</p>
        </div>
      )}
    </div>
  );
};

export default Solo;
