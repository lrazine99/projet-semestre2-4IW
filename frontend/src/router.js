import { createRouter, createWebHistory } from 'vue-router'

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
const UsersAdmin = () => import('./views/UsersAdminView.vue')
const ProductsAdmin = () => import('./views/ProductsAdminView.vue')
const ProductsVariantAdmin = () => import('./views/ProductsVariantAdminView.vue')

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
    path: '/commande',
    name: 'Order',
    component: Order
  },
  {
    path: '/admin/users',
    name: 'UsersAdmin',
    component: UsersAdmin
  },
  {
    path: '/admin/products',
    name: 'ProductsAdmin',
    component: ProductsAdmin
  },
  {
    path: '/admin/products/variant',
    name: 'ProductsVariantAdmin',
    component: ProductsVariantAdmin
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
