import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoginStore } from './loginStore'

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
    loadCartFromStorage() {
      this.cartItems = JSON.parse(localStorage.getItem('cart')) || []
    },
    saveCartToStorage() {
      localStorage.setItem('cart', JSON.stringify(this.cartItems))
    },
    removeItem(index) {
      this.cartItems.splice(index, 1)
      this.saveCartToStorage()
    },
    increaseItemQuantity(index) {
      this.cartItems[index].quantity++
      this.saveCartToStorage()
    },
    decreaseItemQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
        this.saveCartToStorage()
      }
    },
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
      this.saveCartToStorage()
    },
    async syncCartWithBackend() {
      const loginStore = useLoginStore()

      const cartItems = this.cartItems
      if (loginStore.isAuthenticated && cartItems.length > 0) {
        try {
          await axios.post('http://localhost:8080/cart/sync', {
            authToken: loginStore.token,
            items: cartItems
          })
          console.log('Cart synced with backend!')
          localStorage.removeItem('cart')
        } catch (error) {
          console.error('Failed to sync cart with backend', error)
        }
      }
    }
  }
})
