import api from './api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface UserInfo {
  id: string;
  email: string;
}

interface RegisterResponse {
  message: string;
  user: UserInfo;
}

interface LoginResult {
  token: string;
  user: UserInfo;
}

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  try {
    // The API expects form data for login
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post<LoginResponse>('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Get user info after successful login
    const userInfo = await fetchUserInfo(response.data.access_token);
    
    return {
      token: response.data.access_token,
      user: userInfo,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Login failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const registerUser = async (email: string, password: string): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>('/signup', {
      email,
      password,
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Registration failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const fetchUserInfo = async (token?: string): Promise<UserInfo> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await api.get('/', { headers });
    
    // Extract user info from the root endpoint response
    return {
      id: response.data.user,
      email: response.data.user, // Using user ID as email since the API doesn't return email
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Failed to fetch user info');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Import axios for type checking
import axios from 'axios';