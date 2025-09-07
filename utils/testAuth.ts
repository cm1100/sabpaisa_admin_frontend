/**
 * Test authentication and API connectivity
 */

export const testAuthentication = () => {
  console.log('=== Testing Authentication ===');
  
  // Check if tokens exist
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT FOUND');
  console.log('Refresh Token:', refreshToken ? 'EXISTS' : 'NOT FOUND');
  console.log('User:', user ? JSON.parse(user) : 'NOT FOUND');
  
  if (!accessToken) {
    console.error('❌ No access token found. User is not logged in.');
    console.log('Please login first at /login');
    return false;
  }
  
  // Test API call with token
  console.log('Testing API call with token...');
  
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  fetch(`${api}/transactions/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response Status:', response.status);
    if (response.ok) {
      console.log('✅ Authentication working! API call successful.');
      return response.json();
    } else if (response.status === 401) {
      console.error('❌ Authentication failed. Token may be expired.');
      console.log('Try logging in again.');
    } else if (response.status === 404) {
      console.log('⚠️ API endpoint not found, but authentication headers were sent.');
    }
    throw new Error(`API returned ${response.status}`);
  })
  .then(data => {
    console.log('API Data:', data);
  })
  .catch(error => {
    console.error('API Error:', error.message);
  });
  
  return true;
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuthentication;
  console.log('Test authentication by running: testAuth() in the console');
}
