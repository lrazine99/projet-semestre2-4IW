import { createRouter, createWebHistory } from 'vue-router'
import { useLoginStore } from './stores/loginStore'

const Home = () => import('./views/HomeView.vue')
const NotFound = () => import('./views/NotFoundView.vue')
const ProductList = () => import('./views/ProductListView.vue')
const Product = () => import('./views/ProductView.vue')
const LoginRegister = () => import('./views/LoginRegisterView.vue')
const MyAccount = () => import('./views/MyAccountView.vue')
const ResetPassword = () => import('./views/ResetPasswordView.vue')
const RequestReset = () => import('./views/RequestResetView.vue')
const ConfirmAccount = () => import('./views/ConfirmAccountView.vue')
const Cart = () => import('./views/CartView.vue')
const Order = () => import('./views/OrderView.vue')
const UsersAdmin = () => import ('./views/UsersAdmin.vue')
const ProductsAdmin = () => import ('./views/ProductsAdmin.vue')
const ProductsVariantAdmin = () => import ('./views/ProductsVariantAdmin.vue')
const Stats = () => import ('./views/Stats.vue')
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
    path: '/commande',
    name: 'Order',
    component: Order
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
    path: '/admin/stats',
    name: 'Stats',
    component: Stats
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