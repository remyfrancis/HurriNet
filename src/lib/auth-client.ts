// Update or create this file
export function getAuthToken() {
    // Get token from localStorage instead of cookies
    return localStorage.getItem('accessToken');
  }
  
  export function setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
  }
  
  export function removeAuthToken() {
    localStorage.removeItem('accessToken');
  }