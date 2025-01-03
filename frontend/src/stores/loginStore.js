// stores/loginStore.js
import { defineStore } from 'pinia';
import { useCartStore } from './cartStore';

export const useLoginStore = defineStore('login', {
  state: () => ({
    isAuthenticated: false,
    token: null,
  }),
  getters: {
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
  },
  actions: {
    login(token) {
      this.token = token;
      this.isAuthenticated = true;
      localStorage.setItem('authToken', token); // Save token to localStorage
    },
    logout() {
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('authToken'); // Save token to localStorage

      const cartStroe = useCartStore()
      cartStroe.removeAll();
    },
    initialize() {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        this.token = savedToken;
        this.isAuthenticated = true;
      } else {
        this.token = null;
        this.isAuthenticated = false;
      }
    },
  },
});
