import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoginStore } from './loginStore'
import { VITE_API_ENDPOINT } from '@/utils/const'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: JSON.parse(localStorage.getItem('cart')) || []
  }),
  getters: {
    totalQuantity: (state) => state.cartItems.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) =>
      state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  },
  actions: {
     async loadCart() {
      const { isAuthenticated, token } = useLoginStore()

      if (isAuthenticated) {
        try {
          const response = await axios.get(`${VITE_API_ENDPOINT}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          console.log("responseee", response.data.items)
          if (response.data?.items) {
            this.cartItems = response.data.items;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du panier :", error);
        }
      } 
      this.saveCartToStorage()

    },
    // Load the cart from localStorage on initialization
    loadCartFromStorage() {
      this.cartItems = JSON.parse(localStorage.getItem('cart')) || []
    },

    // Save cart to localStorage
    saveCartToStorage() {
      console.log('Saving cart to localStorage');
      
      try {
        localStorage.setItem('cart', JSON.stringify(this.cartItems))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    },

    // Remove an item from the cart by index
    removeItem(index) {
      this.cartItems.splice(index, 1)
      this.saveCartToStorage()
    },

    removeAll() {
      this.cartItems = []
      localStorage.removeItem('cart')
    },

    // Increase item quantity by 1, up to stock limit
    increaseItemQuantity(index) {
      console.log(this.cartItems[index]);
      
      if (this.cartItems[index].quantity < this.cartItems[index].stock) {
        this.cartItems[index].quantity++
        this.saveCartToStorage()
      }
    },

    // Decrease item quantity by 1, can't go below 1
    decreaseItemQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
        this.saveCartToStorage()
      }
    },

    // Add a new item to the cart
    addItem(newItem) {
      
      const existingItem = this.cartItems.find((item) => item.sku === newItem.sku)
      if (existingItem) {
        const totalQuantity = existingItem.quantity + newItem.quantity
        if (totalQuantity > newItem.stock) {
          existingItem.quantity = newItem.stock
        } else {
          existingItem.quantity = totalQuantity
        }
      } else {
        this.cartItems.push({ ...newItem })
      }

      this.syncCartWithBackend()
      this.saveCartToStorage()
    },

    // Sync cart with backend if authenticated
    async syncCartWithBackend() {
      const { isAuthenticated, token } = useLoginStore()
      const cartItems = this.cartItems

      // Ensure only sync if the user is authenticated and cart has items
      if (isAuthenticated && cartItems.length > 0) {
        try {
          await axios.post(
            `${VITE_API_ENDPOINT}/cart/sync`,
            { items: cartItems.map(({ sku, quantity }) => ({ sku, quantity })) },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          console.log('Cart synced with backend!')
          // Optionally, clear the local cart after sync
        //  localStorage.removeItem('cart')
        } catch (error) {
          console.error(
            'Failed to sync cart with backend:',
            error.response ? error.response.data : error.message
          )
        }
      }
    },

    // Sync cart automatically when the user logs in
    syncCartOnLogin() {
      const loginStore = useLoginStore()
      if (loginStore.isAuthenticated) {
        this.syncCartWithBackend()
      }
    }
  },

  // Initialize and sync cart on store load (can be triggered when the app starts)
})
