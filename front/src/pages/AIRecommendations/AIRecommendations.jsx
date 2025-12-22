import { useState } from 'react';
import { getAIRecommendations } from '../../api/ai';
import './AIRecommendations.css';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in first');
        setLoading(false);
        return;
      }

      const response = await getAIRecommendations(token);
      setRecommendations(response.recommendations);
      setFinanceSummary(response.finance_summary);
      setGenerated(true);
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      console.error('Full error:', err);
      setError(`Failed to generate recommendations: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="ai-recommendations-container">
      <div className="ai-header">
        <h1>🤖 AI Financial Advisor</h1>
        <p>Get personalized financial recommendations powered by AI</p>
      </div>

      {!generated ? (
        <div className="ai-intro">
          <div className="intro-card">
            <h2>Welcome to Your AI Financial Advisor</h2>
            <p>
              Our advanced AI analyzes your spending patterns and financial data to provide
              personalized recommendations including:
            </p>
            <ul>
              <li>✨ Which expense categories should be limited</li>
              <li>💰 Strategies to increase your income</li>
              <li>🎯 Savings opportunities tailored to you</li>
              <li>⚡ Quick wins you can implement this week</li>
              <li>🚀 Long-term financial goals and planning</li>
            </ul>
            <button
              className="btn-generate"
              onClick={handleGetRecommendations}
              disabled={loading}
            >
              {loading ? 'Generating... ⏳' : 'Generate My Recommendations'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {financeSummary && (
            <div className="finance-summary">
              <div className="summary-card balance">
                <div className="summary-label">Balance</div>
                <div className={`summary-value ${financeSummary.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(financeSummary.balance)}
                </div>
              </div>
              <div className="summary-card income">
                <div className="summary-label">Total Income</div>
                <div className="summary-value">
                  {formatCurrency(financeSummary.income)}
                </div>
              </div>
              <div className="summary-card expenses">
                <div className="summary-label">Total Expenses</div>
                <div className="summary-value">
                  {formatCurrency(financeSummary.expenses)}
                </div>
              </div>
            </div>
          )}

          {financeSummary && Object.keys(financeSummary.expense_breakdown).length > 0 && (
            <div className="expense-breakdown">
              <h3>💳 Your Expense Breakdown</h3>
              <div className="breakdown-list">
                {Object.entries(financeSummary.expense_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="breakdown-item">
                      <span className="category-name">{category}</span>
                      <span className="category-amount">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="recommendations-content">
            <div className="recommendations-text">
              {recommendations ? (
                recommendations.split('\n').map((line, index) => {
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  if (
                    line.startsWith('#') ||
                    line.startsWith('##') ||
                    line.startsWith('###')
                  ) {
                    const level = line.match(/^#+/)[0].length;
                    if (level === 1) {
                      return <h2 key={index} className='recommendation-heading'>{line.replace(/^#+\s/, '')}</h2>;
                    } else if (level === 2) {
                      return <h3 key={index} className='recommendation-heading'>{line.replace(/^#+\s/, '')}</h3>;
                    } else {
                      return <h4 key={index} className='recommendation-heading'>{line.replace(/^#+\s/, '')}</h4>;
                    }
                  }
                  if (line.startsWith('-') || line.startsWith('•')) {
                    return (
                      <li key={index} className="recommendation-item">
                        {line.replace(/^[-•]\s/, '')}
                      </li>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <li key={index} className="recommendation-item">
                        {line.replace(/^\d+\.\s/, '')}
                      </li>
                    );
                  }
                  return (
                    <p key={index} className="recommendation-text">
                      {line}
                    </p>
                  );
                })
              ) : (
                <p>Loading recommendations...</p>
              )}
            </div>
          </div>

          <div className="ai-actions">
            <button
              className="btn-regenerate"
              onClick={handleGetRecommendations}
              disabled={loading}
            >
              {loading ? 'Regenerating... ⏳' : '🔄 Get New Recommendations'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
