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
const UsersAdmin = () => import ('./views/UsersAdminView.vue')
const ProductsAdmin = () => import ('./views/ProductsAdminView.vue')
const ProductsVariantAdmin = () => import ('./views/ProductsVariantAdminView.vue')
const Stats = () => import ('./views/StatsView.vue')
const OrdersAdmin = () => import('./views/OrdersAdminView.vue')
const OrderDetailsAdmin = () => import('./views/OrderDetailsAdminView.vue')
const CGV = () => import('./views/CGVView.vue')
const CGU = () => import('./views/CGUView.vue')
const politiqueConfidentialite = () => import('./views/PolitiqueConfidentialiteView.vue')
const mentionsLegales = () => import('./views/MentionsLegalesView.vue')

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
    path: '/cgu',
    name: 'cgu',
    component: CGU
  },
  {
    path: '/cgv',
    name: 'cgv',
    component: CGV
  },
  {
    path: '/politique-confidentialite',
    name: 'politiqueConfidentialite',
    component: politiqueConfidentialite
  },
  {
    path: '/mentions-legales',
    name: 'mentionsLegales',
    component: mentionsLegales
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
      },
      {
        path: 'orders',
        name: 'OrdersAdmin',
        component: OrdersAdmin
      },
      {
        path: '/orders/:id/details',
        name: 'OrderDetailsAdmin',
        component: OrderDetailsAdmin,
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats
      },
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
  routes,
  scrollBehavior() {
    // Always scroll to the top of the page
    return { top: 0 };
  },
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