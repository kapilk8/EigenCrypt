import { ethers } from 'ethers';
import { authApi } from './api';

// Token management
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// User management
export const getUserInfo = (): { address: string; isAdmin: boolean } | null => {
  const userInfoString = localStorage.getItem('userInfo');
  return userInfoString ? JSON.parse(userInfoString) : null;
};

export const setUserInfo = (userInfo: { address: string; isAdmin: boolean }): void => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

export const removeUserInfo = (): void => {
  localStorage.removeItem('userInfo');
};

// Ethereum signature authentication
export const authenticateWithEthereum = async () => {
  try {
    // Check if Ethereum provider is available
    if (!(window as any).ethereum) {
      throw new Error('Ethereum wallet not found');
    }

    // Request account access
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    // Get user's Ethereum address
    const address = await signer.getAddress();

    // Create a message to sign
    const message = `Authenticate to sMPC EigenLayer: ${Date.now()}`;

    // Sign the message
    const signature = await signer.signMessage(message);

    // Send authentication request to backend
    const response = await authApi.login({ address, message, signature });

    // Store token and user info
    setToken(response.data.token);
    setUserInfo(response.data.user);

    return response.data.user;
  } catch (error) {
    console.error('Authentication error:', error);
    removeToken();
    removeUserInfo();
    throw error;
  }
};

// Logout function
export const logout = () => {
  removeToken();
  removeUserInfo();
  window.location.href = '/login';
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 