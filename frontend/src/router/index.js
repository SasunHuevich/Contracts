import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import ManagerList from '../views/ManagerList.vue'
import ManagerDetails from '../views/ManagerDetails.vue'
// ВАЖНО: НЕ ИМПОРТИРУЙТЕ хранилище здесь

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/managers',
    name: 'ManagerList',
    component: ManagerList
  },
  {
    path: '/managers/:address',
    name: 'ManagerDetails',
    component: ManagerDetails,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Добавьте проверку авторизации ПОСЛЕ экспорта роутера
// Это будет работать правильно, когда store будет доступен
export default router

// Проверка авторизации будет добавлена в main.js