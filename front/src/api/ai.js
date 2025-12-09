const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Get authorization header with token from localStorage
 */
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
  };
}

/**
 * Safe JSON parsing for API responses
 */
async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Handle API response and throw meaningful errors
 */
async function handleResponse(res, operationName) {
  const data = await parseJsonSafe(res);
  
  if (!res.ok) {
    const errorMessage = 
      data.detail || 
      data.message || 
      data.error || 
      `${operationName} failed`;
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

/**
 * Get spending analysis breakdown by category and month
 * Returns: { total_income, total_expenses, net_balance, by_category, by_month, ... }
 */
export async function getSpendingAnalysis() {
  const res = await fetch(`${API_URL}/api/ai/analyze/`, {
    method: "GET",
    headers: getAuthHeader(),
    credentials: "include",
  });
  
  return handleResponse(res, "Spending analysis");
}

/**
 * Get expense predictions for N months ahead
 * @param {number} months_ahead - Number of months to predict (1-12)
 * Returns: { predicted_expenses, predicted_income, predicted_net, confidence_score, ... }
 */
export async function getExpensePredictions(months_ahead = 3) {
  const params = new URLSearchParams({ months_ahead });
  const res = await fetch(`${API_URL}/api/ai/predict/?${params}`, {
    method: "GET",
    headers: getAuthHeader(),
    credentials: "include",
  });
  
  return handleResponse(res, "Expense predictions");
}

/**
 * Get AI-generated budget recommendations
 * Returns: { recommendations, total_potential_savings, ... }
 */
export async function getBudgetRecommendations() {
  const res = await fetch(`${API_URL}/api/ai/recommendations/`, {
    method: "GET",
    headers: getAuthHeader(),
    credentials: "include",
  });
  
  return handleResponse(res, "Budget recommendations");
}

/**
 * Get anomalies detected in spending patterns
 * @param {number} threshold - Z-score threshold for detection (default 2.0)
 * Returns: { anomalies, anomaly_count, detection_method, ... }
 */
export async function getAnomalies(threshold = 2.0) {
  const params = new URLSearchParams({ threshold });
  const res = await fetch(`${API_URL}/api/ai/anomalies/?${params}`, {
    method: "GET",
    headers: getAuthHeader(),
    credentials: "include",
  });
  
  return handleResponse(res, "Anomaly detection");
}

/**
 * Categorize a transaction description
 * @param {string} description - Transaction description to categorize
 * Returns: { suggested_category, confidence, all_categories, ... }
 */
export async function categorizeTransaction(description) {
  const res = await fetch(`${API_URL}/api/ai/categorize/`, {
    method: "POST",
    headers: getAuthHeader(),
    credentials: "include",
    body: JSON.stringify({ description }),
  });
  
  return handleResponse(res, "Transaction categorization");
}
