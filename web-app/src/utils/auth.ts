export const getAuthHeaders = () => {
  const auth = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth='));
  
  if (!auth) {
    throw new Error('Not authenticated');
  }

  try {
    const decodedAuth = decodeURIComponent(auth.split('=')[1]);
    const { accessToken } = JSON.parse(decodedAuth);
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    throw new Error('Invalid auth data');
  }
};
