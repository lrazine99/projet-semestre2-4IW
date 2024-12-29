import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import NotFound from './views/NotFound.vue'
import ProductList from './views/ProductList.vue'
import Product from './views/Product.vue'
import LoginRegister from './views/LoginRegister.vue'
import MyAccount from './views/MyAccount.vue'
import ResetPassword from './views/ResetPassword.vue'
import RequestReset from './views/RequestReset.vue'
import ConfirmAccount from './views/ConfirmAccount.vue'
import Cart from './views/Cart.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/produits',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/produit/:sku',
    name: 'Product',
    component: Product
  },
  {
    path: '/inscription-connexion',
    name: 'LoginRegister',
    component: LoginRegister
  },
  {
    path: '/mon-compte',
    name: 'MyAccount',
    component: MyAccount
  },
  { path: '/demande-reinitialiser-mot-de-passe', name: 'RequestReset', component: RequestReset },

  {
    path: '/reinitialiser-mot-de-passe/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    props: true
  },
  {
    path: '/confirmer-votre-compte/:token',
    name: 'ConfirmAccount',
    component: ConfirmAccount
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
