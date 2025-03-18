<template>
  <div id="app">
    <header class="header">
      <nav class="main-nav">
        <router-link to="/" class="nav-link">Главная</router-link>
        <router-link to="/managers" class="nav-link">Менеджеры</router-link>
        <router-link v-if="isConnected" to="/dashboard" class="nav-link">Личный кабинет</router-link>
      </nav>
      
      <div class="wallet-status">
        <template v-if="isConnected">
          <span class="account-info">{{ shortAddress }}</span>
          <button @click="onDisconnect" class="btn btn-small">Отключить</button>
        </template>
        <button v-else @click="onConnectWallet" class="btn">Подключить кошелек</button>
      </div>
    </header>
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { formatAddress } from '@/utils/contracts'

export default {
  name: 'App',
  computed: {
    ...mapState('wallet', ['account', 'isConnected']),
    shortAddress() {
      if (!this.account) return '';
      return formatAddress(this.account);
    }
  },
  methods: {
    ...mapActions('wallet', ['connectWallet', 'disconnect']),
    onConnectWallet() {
      this.connectWallet(false);
    },
    onDisconnect() {
      this.disconnect();
    }
  },
  created() {
    // Проверяем наличие подключенного кошелька при загрузке приложения
    this.connectWallet(true); // silent = true
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%; /* Убедимся, что не ломается ширина */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #3498db;
  transform: scaleX(0);
  transition: transform 0.3s;
}

.nav-link:hover,
.router-link-active {
  color: #3498db;
}

.nav-link:hover:after,
.router-link-active:after {
  transform: scaleX(1);
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-info {
  font-family: monospace;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #555;
}

.btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9;
}

.btn-small {
  padding: 5px 10px;
  font-size: 14px;
}

main {
  padding: 2rem;
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 1rem 2rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 1rem;
  }
  
  .main-nav {
    margin-bottom: 1rem;
  }
  
  .wallet-status {
    width: 100%;
    justify-content: center;
  }
}
</style>