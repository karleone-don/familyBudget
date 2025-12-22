// AI Recommendations API Service

const API_URL = 'http://localhost:8000/api';

export const getAIRecommendations = async (token) => {
  try {
    const response = await fetch(`${API_URL}/ai/recommendations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    throw error;
  }
};
