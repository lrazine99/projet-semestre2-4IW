// stores/loginStore.js
import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
  state: () => ({
    isAuthenticated: false,
    token: null,
    role: null,
  }),
  getters: {
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
    isAdmin: (state) => state.role === 'admin',
  },
  actions: {
    login(token, role) {
      this.token = token;
      this.role = role; 
      this.isAuthenticated = true;
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role)
    },
    logout() {
      this.token = null;
      this.role = null; 
      this.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
    },
    initialize() {
      const savedToken = localStorage.getItem('authToken');
      const savedRole = localStorage.getItem('role');
      if (savedToken && savedRole) {
        this.token = savedToken;
        this.role = savedRole;
        this.isAuthenticated = true;
      } else {
        this.token = null;
        this.role = null;
        this.isAuthenticated = false;
      }
    },
  },
});
