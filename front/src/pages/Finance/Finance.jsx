import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TransactionModal from "./TransactionModal";
import "./Finance.css";
import "./Modal.css";

const API_URL = "http://127.0.0.1:8000";

export default function FinanceTracker() {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_id: null,
    description: "",
    amount: "",
    category: "",
    type: "expense",
    date: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Стабильная вспомогательная функция для даты
  const getLocalDateTimeString = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Обернули fetchData в useCallback, чтобы убрать Warning и лишние ререндеры
  const fetchData = useCallback(() => {
    const headers = { Authorization: `Token ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/finance/self_data/`, { headers }).then((res) => res.json()),
      fetch(`${API_URL}/api/transactions/`, { headers }).then((res) => res.json()),
      fetch(`${API_URL}/api/categories/`, { headers }).then((res) => res.json()),
    ])
      .then(([financeData, transData, catData]) => {
        setFinance(financeData);
        const data = transData.results || transData;
        setTransactions(
          Array.isArray(data)
            ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
            : []
        );
        setCategories(catData.results || catData);
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading data");
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchData();
  }, [token, navigate, fetchData]);

  const handleRowDoubleClick = (t) => {
    setFormData({
      transaction_id: t.transaction_id,
      description: t.description || "",
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: getLocalDateTimeString(t.date),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/api/transactions/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Token ${token}` },
    }).then((res) => {
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isEditing = !!formData.transaction_id;
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${API_URL}/api/transactions/${formData.transaction_id}/`
      : `${API_URL}/api/transactions/`;

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: parseInt(formData.category),
      finance: finance.finance_id,
      date: new Date(formData.date).toISOString(),
    };

    fetch(url, {
      method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          transaction_id: null,
          description: "",
          amount: "",
          category: "",
          type: "expense",
          date: getLocalDateTimeString(new Date()),
        });
        fetchData();
      }
    });
  };

  if (loading) return <p className="loader">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  // Группировка для рендера
  const grouped = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = today - 7 * 86400000;

  transactions.forEach((t) => {
    const tDate = new Date(t.date);
    const tTime = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate()).getTime();
    let groupName;
    if (tTime === today) groupName = "Today";
    else if (tTime >= startOfWeek) groupName = "Last week";
    else groupName = tDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!grouped[groupName]) grouped[groupName] = [];
    grouped[groupName].push(t);
  });

  return (
    <div className="finance-tracker-container">
      <div className="balance-section">
        <div className="balance-card">
          <span className="label">Current Balance:</span>
          <h2 className="amount">{finance.balance}</h2>
        </div>
        <div className="stats-row">
          <div className="stat-item income"><span>Incomes: </span><strong>+{finance.income}</strong></div>
          <div className="stat-item expense"><span>Expenses: </span><strong>-{finance.expenses}</strong></div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="transaction-list">
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName} className="group-wrapper">
              <div className="group-header">{groupName}</div>
              {items.map((t) => (
                <div key={t.transaction_id} className="transaction-card clickable" onDoubleClick={() => handleRowDoubleClick(t)}>
                  <div className="t-left-side">
                    <div className="t-meta">
                      <span className="t-time">{new Date(t.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                      {groupName !== "Today" && <span className="t-date-small">{new Date(t.date).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" })}</span>}
                    </div>
                    <div className="t-info">
                      <span className="t-desc">{t.description || t.category_name}</span>
                      {t.description && <span className="t-cat-badge">{t.category_name}</span>}
                    </div>
                  </div>
                  <div className={`t-amount ${t.type}`}>{t.type === "income" ? "+" : "-"}{t.amount}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-buttons">
        <button className="add-btn-main" onClick={() => {
          setFormData({ transaction_id: null, description: "", amount: "", category: "", type: "expense", date: getLocalDateTimeString(new Date()) });
          setIsModalOpen(true);
        }}>Add Transaction</button>
        
        {/* Добавлен проброс текущего баланса для корректности 4-го графика */}
        <button className="analytics-btn" onClick={() => navigate("/analytics", { state: { transactions, currentBalance: finance.balance } })}>
          View Analytics
        </button>
        
        <button className="back-btn" onClick={() => navigate("/profile")}>Profile</button>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
      />
    </div>
  );
}