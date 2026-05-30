import { apiRequest } from '../apiClient';

// Function to get article data for about section
export const getArticleDataManagement = async (params) => {
  try {
    const response = await apiRequest({
      url: '/api/user/articleDataManagement',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error in getArticleDataManagement:', error);
    throw error;
  }
}; 