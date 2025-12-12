import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import "./Solo.css";

// Modal для быстрой записи расхода
const QuickExpenseModal = ({ isOpen, onClose, onSubmit, categories }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && amount && category) {
      onSubmit({ description, amount: parseFloat(amount), category });
      setDescription("");
      setAmount("");
      setCategory("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Быстрая запись расхода</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Описание:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что вы купили?"
              required
            />
          </div>
          <div className="form-group">
            <label>Сумма (₽):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Категория:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Solo = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    byCategory: {},
    count: 0,
    byGroup: {},
    byDay: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  
  const getStatus = (amount, categoryAmount, total) => {
    const percentage = (categoryAmount / total) * 100;
    if (percentage > 35) return { emoji: "🔥", text: "Много!" };
    if (percentage > 25) return { emoji: "⚠️", text: "Выше нормы" };
    if (percentage < 5) return { emoji: "🎯", text: "Мало" };
    return { emoji: "✅", text: "Оплачено" };
  };

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
    const byGroup = {};
    const byDay = {};
    
    expensesList.forEach((exp) => {
      const catName = exp.category_name || exp.category?.category_name || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + parseFloat(exp.amount);
      
      // Группировка по группам расходов
      const group = getGroupForCategory(catName);
      byGroup[group] = (byGroup[group] || 0) + parseFloat(exp.amount);
      
      // Группировка по дням
      const day = new Date(exp.date).toLocaleDateString('ru-RU');
      byDay[day] = (byDay[day] || 0) + parseFloat(exp.amount);
    });

    setSummary({
      total,
      byCategory,
      byGroup,
      byDay,
      count: expensesList.length,
    });
  };
  
  // Фильтрация по периоду
  const getFilteredExpenses = () => {
    let filtered = expenses;
    const now = new Date();
    
    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(exp => new Date(exp.date) >= weekAgo);
    } else if (selectedPeriod === "month") {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(exp => {
        const catName = exp.category_name || exp.category?.category_name || "Uncategorized";
        return catName === selectedCategory;
      });
    }
    
    return filtered;
  };

  // Функция добавления расхода через API
  const handleAddExpense = async (expenseData) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/api/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          description: expenseData.description,
          amount: expenseData.amount,
          category_name: expenseData.category,
          transaction_type: "expense",
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add expense: ${response.status}`);
      }

      // Обновляем список расходов
      await fetchExpenses();
      setShowQuickExpenseModal(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Ошибка при добавлении расхода: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Функция для экспорта в PDF/отчет
  const handleGenerateReport = () => {
    const reportContent = `
ОТЧЕТ О РАСХОДАХ
================
Период: ${selectedPeriod === 'week' ? 'Последние 7 дней' : selectedPeriod === 'month' ? 'Текущий месяц' : 'Все время'}
Всего расходов: ₽${summary.total.toFixed(2)}
Количество транзакций: ${summary.count}

РАСХОДЫ ПО КАТЕГОРИЯМ:
${Object.entries(summary.byCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amount]) => `${cat}: ₽${amount.toFixed(2)}`)
  .join('\n')}

РАСХОДЫ ПО ГРУППАМ:
${Object.entries(summary.byGroup)
  .sort(([, a], [, b]) => b - a)
  .map(([group, amount]) => `${group}: ₽${amount.toFixed(2)} (${((amount / summary.total) * 100).toFixed(1)}%)`)
  .join('\n')}
    `;
    
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `отчет-расходов-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

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
        <h1>Твои расходы</h1>
        <p>Отслеживай личные траты и достигай целей</p>
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
          <label>Период:</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="filter-select">
            <option value="all">Все время</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Категория:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
            <option value="all">Все категории</option>
            {Object.keys(summary.byCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Кнопки действия */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowQuickExpenseModal(true)}
          disabled={submitting}
        >
          ➕ Быстрая запись расхода
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleGenerateReport}
        >
          📊 Полный отчет
        </button>
        <button className="btn btn-secondary">🎯 Мои цели</button>
      </div>

      {/* Модальное окно для быстрой записи расхода */}
      <QuickExpenseModal
        isOpen={showQuickExpenseModal}
        onClose={() => setShowQuickExpenseModal(false)}
        onSubmit={handleAddExpense}
        categories={Object.keys(summary.byCategory).length > 0 ? Object.keys(summary.byCategory) : ["Food", "Transport", "Entertainment"]}
      />

      {/* Диаграммы */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Расходы по группам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(summary.byGroup && Object.entries(summary.byGroup).length > 0)
                  ? Object.entries(summary.byGroup).map(([name, value]) => ({ name, value }))
                  : []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₽${entry.value.toFixed(0)} (${((entry.value / summary.total) * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {summary.byGroup && Object.keys(summary.byGroup).map((group) => (
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
            <BarChart data={(summary.byDay && Object.entries(summary.byDay).length > 0)
              ? Object.entries(summary.byDay).slice(-14).map(([day, value]) => ({ name: day, value }))
              : []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `₽${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица расходов */}
      {summary.total > 0 && (
        <div className="table-section">
          <h2>Твоя детальная таблица расходов</h2>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Что купил</th>
                <th>Сумма</th>
                <th>%</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredExpenses()
                .reduce((acc, exp) => {
                  const catName = exp.category_name || exp.category?.category_name || "Uncategorized";
                  const existing = acc.find(item => item.category === catName);
                  if (existing) {
                    existing.amount += parseFloat(exp.amount);
                  } else {
                    acc.push({ category: catName, amount: parseFloat(exp.amount) });
                  }
                  return acc;
                }, [])
                .sort((a, b) => b.amount - a.amount)
                .map((item) => {
                  const status = getStatus(item.amount, item.amount, summary.total);
                  const percentage = ((item.amount / summary.total) * 100).toFixed(1);
                  return (
                    <tr key={item.category}>
                      <td className="category-name">{item.category}</td>
                      <td className="amount">₽{item.amount.toFixed(2)}</td>
                      <td className="percentage">{percentage}%</td>
                      <td className="status"><span className="status-badge">{status.emoji} {status.text}</span></td>
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

      {summary.total === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Нет расходов для отображения</p>
          <p>Добавьте первый расход, чтобы начать отслеживание</p>
        </div>
      )}
    </div>
  );
};

export default Solo;
