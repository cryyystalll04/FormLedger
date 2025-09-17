// src/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // <-- Import jwt-decode

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null, // Load user data from storage
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('http://localhost:3000/api/login', credentials);
        const { token } = response.data;
        this.token = token;
        localStorage.setItem('token', token);
        
        // Decode the token and save the user data
        const decodedToken = jwtDecode(token);
        this.user = decodedToken;
        localStorage.setItem('user', JSON.stringify(decodedToken));

      } catch (error) {
        console.error('Login failed:', error);
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isUser: (state) => state.user?.role === 'user',
  },
});