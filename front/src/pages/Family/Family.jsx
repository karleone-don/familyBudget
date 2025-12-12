import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import "./Family.css";

const Family = () => {
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [prevMonthExpenses, setPrevMonthExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalFamilyExpenses: 0,
    memberCount: 0,
    byCategory: {},
    byGroup: {},
    byDay: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showCharts, setShowCharts] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Цветовая схема для групп расходов
  const groupColors = {
    "Обязательные": "#FF6B6B",
    "Необязательные": "#4ECDC4",
    "Накопления": "#45B7D1",
    "Непредвиденные": "#FFA07A"
  };
  
  // Классификация категорий по группам
  const categoryGroups = {
    "Обязательные": ["Housing", "Housing", "Еда", "Food", "Транспорт", "Transport", "Коммунальные", "Utilities"],
    "Необязательные": ["Развлечения", "Entertainment", "Шоппинг", "Shopping", "Красота", "Beauty"],
    "Накопления": ["Сбережения", "Savings", "Инвестиции", "Investments"],
    "Непредвиденные": ["Здоровье", "Healthcare", "Другое", "Other", "Неопределенное", "Uncategorized"]
  };
  
  const getGroupForCategory = (category) => {
    for (const [group, categories] of Object.entries(categoryGroups)) {
      if (categories.some(c => c.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(c.toLowerCase()))) {
        return group;
      }
    }
    return "Непредвиденные";
  };
  
  const getTrendArrow = (current, previous) => {
    if (current > previous) return { arrow: "▲", color: "#FF6B6B" };
    if (current < previous) return { arrow: "▼", color: "#4ECB71" };
    return { arrow: "→", color: "#999" };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all data in parallel
      const [familyRes, transRes, recRes] = await Promise.all([
        fetch(`${API_URL}/api/families/my_family/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }),
        fetch(`${API_URL}/api/families/family_transactions/`, {
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

      if (!familyRes.ok) {
        if (familyRes.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(`Failed to fetch family data: ${familyRes.status}`);
      }

      const familyInfo = await familyRes.json();
      setFamilyData(familyInfo);

      // Process transactions
      if (transRes.ok) {
        const transList = await transRes.json();
        const transactionList = Array.isArray(transList) ? transList : transList.results || [];
        const expensesList = transactionList.filter(
          (t) => t.transaction_type === "expense"
        );
        
        // Current month expenses
        const currentMonth = new Date(selectedMonth);
        const currentMonthExpenses = expensesList.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === currentMonth.getMonth() && 
                 expDate.getFullYear() === currentMonth.getFullYear();
        });
        
        // Previous month expenses for trend calculation
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevMonthExp = expensesList.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === prevMonth.getMonth() && 
                 expDate.getFullYear() === prevMonth.getFullYear();
        });
        
        setExpenses(currentMonthExpenses);
        setPrevMonthExpenses(prevMonthExp);
        calculateSummary(currentMonthExpenses, prevMonthExp);
      }

      // Process recommendations
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      }
    } catch (err) {
      console.error("Error fetching family data:", err);
      setError(err.message || "Failed to load family dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchFamilyData();
  }, [selectedMonth]);

  const calculateSummary = (expensesList, prevMonthList) => {
    const totalExpenses = expensesList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    
    const prevTotal = prevMonthList.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );

    const byCategory = {};
    const byGroup = {};
    const byDay = {};

    expensesList.forEach((exp) => {
      const catName = exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
      
      // Группировка по группам расходов
      const group = getGroupForCategory(catName);
      byGroup[group] = (byGroup[group] || 0) + parseFloat(exp.amount);
      
      // Группировка по дням
      const day = new Date(exp.date).toLocaleDateString('ru-RU');
      byDay[day] = (byDay[day] || 0) + parseFloat(exp.amount);
    });
    
    // Calculate previous month by category for trends
    const prevByCategory = {};
    prevMonthList.forEach((exp) => {
      const catName = exp.category?.category_name || "Uncategorized";
      prevByCategory[catName] = (prevByCategory[catName] || 0) + parseFloat(exp.amount);
    });

    setSummary({
      totalFamilyExpenses: totalExpenses,
      prevTotalExpenses: prevTotal,
      memberCount: 0,
      byCategory,
      prevByCategory,
      byGroup,
      byDay,
    });
  };

  if (loading) {
    return (
      <div className="family-container loading">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading family data...</p>
          <div style={{ marginTop: "20px", fontSize: "24px" }}>⏳</div>
        </div>
      </div>
    );
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
        <h1>Итого расходов</h1>
        <p>Совместный бюджет семьи: {familyData?.family_name || "Family Budget"}</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Ошибка:</strong> {error}
          <button onClick={() => window.location.reload()} style={{ marginTop: "10px", marginLeft: "10px", padding: "8px 16px" }}>
            Повторить
          </button>
        </div>
      )}

      {/* Фильтры */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Месяц:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group checkbox">
          <input 
            type="checkbox" 
            id="showCharts"
            checked={showCharts} 
            onChange={(e) => setShowCharts(e.target.checked)}
          />
          <label htmlFor="showCharts">Показать графики</label>
        </div>
      </div>

      {/* Кнопки действия */}
      <div className="action-buttons">
        <button className="btn btn-primary">Добавить расход</button>
        <button className="btn btn-secondary">Экспорт в Excel</button>
        <button className="btn btn-secondary">Настроить категории</button>
      </div>

      {/* Диаграммы */}
      {showCharts && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>Расходы по группам</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(summary.byGroup).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ₽${entry.value.toFixed(0)} (${((entry.value / summary.totalFamilyExpenses) * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(summary.byGroup).map((group) => (
                    <Cell key={`cell-${group}`} fill={groupColors[group]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₽${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Тренд расходов по дням</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(summary.byDay).map(([day, value]) => ({ name: day, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `₽${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Таблица расходов */}
      {summary.totalFamilyExpenses > 0 && (
        <div className="table-section">
          <h2>Таблица расходов по категориям</h2>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Сумма</th>
                <th>%</th>
                <th>Тренд</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, currentAmount]) => {
                  const previousAmount = summary.prevByCategory[category] || 0;
                  const trend = getTrendArrow(currentAmount, previousAmount);
                  const percentChange = previousAmount > 0 
                    ? Math.abs(((currentAmount - previousAmount) / previousAmount) * 100).toFixed(1)
                    : 0;
                  const percentage = ((currentAmount / summary.totalFamilyExpenses) * 100).toFixed(1);
                  
                  return (
                    <tr key={category}>
                      <td className="category-name">{category}</td>
                      <td className="amount">₽{currentAmount.toFixed(2)}</td>
                      <td className="percentage">{percentage}%</td>
                      <td className="trend">
                        <span className="trend-badge" style={{ color: trend.color }}>
                          {trend.arrow} {percentChange}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Рекомендации */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>💡 Рекомендации для семейного бюджета</h3>
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

      {summary.totalFamilyExpenses === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Нет расходов для отображения</p>
          <p>Добавьте расход, чтобы начать отслеживание семейного бюджета</p>
        </div>
      )}
    </div>
  );
};

export default Family;
