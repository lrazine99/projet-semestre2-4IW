import { createRouter, createWebHistory } from 'vue-router'
import { useLoginStore } from './stores/loginStore'

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
import UsersAdmin from './views/UsersAdmin.vue'
import ProductsAdmin from './views/ProductsAdmin.vue'
import ProductsVariantAdmin from './views/ProductsVariantAdmin.vue'

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
    component: MyAccount,
    meta: { requiresAuth: true }
  },
  {
    path: '/demande-reinitialiser-mot-de-passe',
    name: 'RequestReset',
    component: RequestReset
  },
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
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'UsersAdmin',
        component: UsersAdmin
      },
      {
        path: 'products',
        name: 'ProductsAdmin',
        component: ProductsAdmin
      },
      {
        path: 'products/variant',
        name: 'ProductsVariantAdmin',
        component: ProductsVariantAdmin
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const loginStore = useLoginStore()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!loginStore.isLoggedIn) {
      next({ name: from.name || 'Home', replace: true })
      return
    }

    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!loginStore.isAdmin) {
        next({ name: from.name || 'Home', replace: true })
        return
      }
    }
  }

  next()
})

export default router