// AI Recommendations API Service

// Support both 127.0.0.1 and localhost for flexibility
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getAIRecommendations = async (token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const response = await fetch(`${API_URL}/api/ai/recommendations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      credentials: 'include', // Include cookies if needed for CORS
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:8000');
    }
    throw error;
  }
};
