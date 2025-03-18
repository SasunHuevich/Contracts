import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
  .use(router)
  .use(store)

// Добавляем проверку авторизации здесь, когда store уже доступен
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Если требуется авторизация, проверяем подключение кошелька
    if (!store.state.wallet.isConnected) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

app.mount('#app')