import React, { useState, useEffect } from "react";
import {
  getSpendingAnalysis,
  getExpensePredictions,
  getBudgetRecommendations,
  getAnomalies,
  categorizeTransaction,
} from "../../api/ai";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AIAssistant.css";

const AIAssistant = () => {
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [analysis, setAnalysis] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [anomalies, setAnomalies] = useState(null);

  // Categorization form state
  const [categorizationInput, setCategorizationInput] = useState("");
  const [categorizationResult, setCategorizationResult] = useState(null);
  const [categorizingTransaction, setCategorizingTransaction] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("overview");

  /**
   * Fetch all AI data on component mount
   */
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analysisData, predictionsData, recommendationsData, anomaliesData] = await Promise.all([
          getSpendingAnalysis(),
          getExpensePredictions(3),
          getBudgetRecommendations(),
          getAnomalies(2.0),
        ]);

        setAnalysis(analysisData);
        setPredictions(predictionsData);
        setRecommendations(recommendationsData);
        setAnomalies(anomaliesData);
      } catch (err) {
        setError(err.message || "Failed to load AI assistant data");
        console.error("Error fetching AI data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIData();
  }, []);

  /**
   * Handle transaction categorization
   */
  const handleCategorize = async (e) => {
    e.preventDefault();
    if (!categorizationInput.trim()) return;

    try {
      setCategorizingTransaction(true);
      const result = await categorizeTransaction(categorizationInput);
      setCategorizationResult(result);
    } catch (err) {
      setError(err.message || "Categorization failed");
    } finally {
      setCategorizingTransaction(false);
    }
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);
  };

  /**
   * Get color for pie chart by index
   */
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ];

  // Loading state
  if (loading) {
    return (
      <div className="ai-assistant-container">
        <div className="loading">
          <h2>Loading AI Assistant...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analysis) {
    return (
      <div className="ai-assistant-container">
        <div className="error-alert">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <h1>🤖 AI Budget Assistant</h1>
        <p>Smart financial insights powered by machine learning</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === "predictions" ? "active" : ""}`}
          onClick={() => setActiveTab("predictions")}
        >
          📈 Predictions
        </button>
        <button
          className={`tab ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          💡 Recommendations
        </button>
        <button
          className={`tab ${activeTab === "anomalies" ? "active" : ""}`}
          onClick={() => setActiveTab("anomalies")}
        >
          🚨 Anomalies
        </button>
        <button
          className={`tab ${activeTab === "categorize" ? "active" : ""}`}
          onClick={() => setActiveTab("categorize")}
        >
          🏷️ Categorize
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && analysis && (
        <div className="tab-content">
          <div className="overview-grid">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card income">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Total Income</h3>
                  <p className="card-value">
                    {formatCurrency(analysis.total_income)}
                  </p>
                </div>
              </div>

              <div className="summary-card expenses">
                <div className="card-icon">💸</div>
                <div className="card-content">
                  <h3>Total Expenses</h3>
                  <p className="card-value">
                    {formatCurrency(analysis.total_expenses)}
                  </p>
                </div>
              </div>

              <div className={`summary-card ${analysis.net_balance >= 0 ? "positive" : "negative"}`}>
                <div className="card-icon">
                  {analysis.net_balance >= 0 ? "📈" : "📉"}
                </div>
                <div className="card-content">
                  <h3>Net Balance</h3>
                  <p className="card-value">
                    {formatCurrency(analysis.net_balance)}
                  </p>
                </div>
              </div>

              <div className="summary-card average">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <h3>Avg Monthly</h3>
                  <p className="card-value">
                    {formatCurrency(analysis.avg_monthly_expense)}
                  </p>
                </div>
              </div>
            </div>

            {/* Spending by Category - Pie Chart */}
            {analysis.by_category && Object.keys(analysis.by_category).length > 0 && (
              <div className="chart-container">
                <h3>Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analysis.by_category).map(([name, value]) => ({
                        name: name.replace(/_/g, " ").toUpperCase(),
                        value: Math.abs(value),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analysis.by_category).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Spending Categories */}
            {analysis.top_categories && (
              <div className="top-categories">
                <h3>Top Spending Categories</h3>
                <div className="category-list">
                  {analysis.top_categories.slice(0, 5).map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <div className="category-rank">{idx + 1}</div>
                      <div className="category-info">
                        <h4>{cat.category}</h4>
                        <p>{formatCurrency(cat.total)}</p>
                      </div>
                      <div
                        className="category-bar"
                        style={{
                          width: `${(cat.total / analysis.top_categories[0].total) * 100}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Analysis Details */}
          <div className="analysis-details">
            <h3>📊 Analysis Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Analysis Period</label>
                <value>{analysis.analysis_period_days || "N/A"} days</value>
              </div>
              <div className="detail-item">
                <label>Total Transactions</label>
                <value>{analysis.transaction_count || 0}</value>
              </div>
              <div className="detail-item">
                <label>Income/Expense Ratio</label>
                <value>
                  {analysis.total_expenses > 0
                    ? (
                        (analysis.total_income / analysis.total_expenses) * 100
                      ).toFixed(1)
                    : 0}
                  %
                </value>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && predictions && (
        <div className="tab-content">
          <div className="predictions-section">
            <h2>📈 Expense Predictions</h2>

            {/* Confidence Score */}
            <div className="confidence-card">
              <h3>Model Confidence</h3>
              <div className="confidence-meter">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${(predictions.confidence_score || 0) * 100}%`,
                  }}
                ></div>
              </div>
              <p>
                Accuracy Score (R²): {((predictions.model_accuracy || 0) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Prediction Chart */}
            {predictions.predicted_expenses && (
              <div className="chart-container">
                <h3>3-Month Forecast</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={predictions.prediction_months.map((month, idx) => ({
                      month,
                      expenses: predictions.predicted_expenses[idx] || 0,
                      income: predictions.predicted_income[idx] || 0,
                      net: (predictions.predicted_income[idx] || 0) -
                            (predictions.predicted_expenses[idx] || 0),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#00C49F"
                      name="Predicted Income"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#FF8042"
                      name="Predicted Expenses"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#0088FE"
                      name="Net Balance"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Prediction Details */}
            <div className="prediction-details">
              <h3>Forecast Summary</h3>
              <div className="details-grid">
                {predictions.prediction_months.map((month, idx) => (
                  <div key={idx} className="prediction-card">
                    <h4>{month}</h4>
                    <div className="prediction-value">
                      <p>Income: {formatCurrency(predictions.predicted_income[idx])}</p>
                      <p>Expenses: {formatCurrency(predictions.predicted_expenses[idx])}</p>
                      <p className="net-value">
                        Net: {formatCurrency(
                          predictions.predicted_income[idx] -
                            predictions.predicted_expenses[idx]
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && recommendations && (
        <div className="tab-content">
          <div className="recommendations-section">
            <h2>💡 Budget Recommendations</h2>

            {/* Total Potential Savings */}
            <div className="savings-alert">
              <h3>💚 Total Potential Savings</h3>
              <p className="savings-amount">
                {formatCurrency(recommendations.total_potential_savings || 0)}
              </p>
            </div>

            {/* Recommendations List */}
            <div className="recommendations-list">
              {recommendations.recommendations &&
                recommendations.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`recommendation-card priority-${rec.priority || "medium"}`}
                  >
                    <div className="rec-header">
                      <h3>{rec.title}</h3>
                      <span className={`priority-badge ${rec.priority || "medium"}`}>
                        {rec.priority ? rec.priority.toUpperCase() : "MEDIUM"}
                      </span>
                    </div>
                    <p className="rec-description">{rec.description}</p>
                    {rec.potential_savings && (
                      <div className="rec-savings">
                        <span>Potential Savings:</span>
                        <strong>{formatCurrency(rec.potential_savings)}</strong>
                      </div>
                    )}
                    <p className="rec-type">Type: {rec.type}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === "anomalies" && anomalies && (
        <div className="tab-content">
          <div className="anomalies-section">
            <h2>🚨 Unusual Spending Detected</h2>

            {/* Anomaly Stats */}
            <div className="anomaly-stats">
              <div className="stat-card">
                <p className="stat-value">
                  {anomalies.anomaly_count || 0}
                </p>
                <p className="stat-label">Anomalies Found</p>
              </div>
              <div className="stat-card">
                <p className="stat-value">
                  {anomalies.detection_method || "Statistical (Z-Score)"}
                </p>
                <p className="stat-label">Detection Method</p>
              </div>
            </div>

            {/* Anomalies List */}
            {anomalies.anomaly_count > 0 && anomalies.anomalies ? (
              <div className="anomalies-list">
                {anomalies.anomalies.map((anomaly, idx) => (
                  <div key={idx} className={`anomaly-card severity-${anomaly.severity}`}>
                    <div className="anomaly-header">
                      <h3>{anomaly.description}</h3>
                      <span className={`severity-badge ${anomaly.severity}`}>
                        {anomaly.severity ? anomaly.severity.toUpperCase() : "MEDIUM"}
                      </span>
                    </div>
                    <div className="anomaly-details">
                      <div className="detail">
                        <label>Amount:</label>
                        <value>{formatCurrency(anomaly.amount)}</value>
                      </div>
                      <div className="detail">
                        <label>Category:</label>
                        <value>{anomaly.category}</value>
                      </div>
                      <div className="detail">
                        <label>Date:</label>
                        <value>{new Date(anomaly.date).toLocaleDateString()}</value>
                      </div>
                      <div className="detail">
                        <label>Z-Score:</label>
                        <value>{(anomaly.zscore || 0).toFixed(2)}</value>
                      </div>
                    </div>
                    <p className="anomaly-reason">{anomaly.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-anomalies">
                <h3>✅ No Anomalies Detected</h3>
                <p>Your spending patterns are normal and consistent!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categorization Tab */}
      {activeTab === "categorize" && (
        <div className="tab-content">
          <div className="categorization-section">
            <h2>🏷️ Transaction Auto-Categorization</h2>
            <p className="section-description">
              Enter a transaction description and our AI will suggest the best category.
            </p>

            {/* Categorization Form */}
            <form className="categorization-form" onSubmit={handleCategorize}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="e.g., 'Starbucks coffee at downtown'..."
                  value={categorizationInput}
                  onChange={(e) => setCategorizationInput(e.target.value)}
                  disabled={categorizingTransaction}
                  className="form-input"
                />
                <button
                  type="submit"
                  disabled={categorizingTransaction || !categorizationInput.trim()}
                  className="btn-categorize"
                >
                  {categorizingTransaction ? "Analyzing..." : "Categorize"}
                </button>
              </div>
            </form>

            {/* Categorization Result */}
            {categorizationResult && (
              <div className="categorization-result">
                <h3>Suggested Category</h3>
                <div className="result-card">
                  <div className="category-match">
                    <h4>{categorizationResult.suggested_category}</h4>
                    <div className="confidence-meter">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${(categorizationResult.confidence || 0) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="confidence-text">
                      Confidence: {((categorizationResult.confidence || 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Alternative Categories */}
                  {categorizationResult.all_categories && (
                    <div className="alternatives">
                      <h4>Other Possible Categories:</h4>
                      <div className="category-list">
                        {categorizationResult.all_categories
                          .filter(
                            (cat) =>
                              cat !==
                              categorizationResult.suggested_category
                          )
                          .slice(0, 4)
                          .map((cat, idx) => (
                            <span key={idx} className="alt-category">
                              {cat}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Example Transactions */}
            <div className="examples">
              <h3>Try These Examples:</h3>
              <div className="example-list">
                <div className="example-item">
                  <code>Whole Foods grocery shopping</code>
                </div>
                <div className="example-item">
                  <code>Netflix subscription payment</code>
                </div>
                <div className="example-item">
                  <code>Shell gas station fill up</code>
                </div>
                <div className="example-item">
                  <code>UnitedHealth clinic appointment</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
