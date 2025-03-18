<template>
    <div class="home">
      <section class="hero">
        <h1>Социальный трейдинг</h1>
        <p>Передайте свой капитал в управление профессионалам и зарабатывайте вместе с опытными трейдерами</p>
        <div class="cta-buttons">
          <button @click="goToManagers" class="btn btn-primary">Просмотреть менеджеров</button>
          <button v-if="isConnected" @click="goToDashboard" class="btn btn-secondary">Личный кабинет</button>
          <button v-else @click="connectWallet" class="btn btn-secondary">Подключить кошелек</button>
        </div>
      </section>
      
      <section class="features">
        <div class="feature-card">
          <h3>Безопасно</h3>
          <p>Смарт-контракты гарантируют, что менеджеры могут только торговать токенами, без возможности вывода</p>
        </div>
        <div class="feature-card">
          <h3>Прозрачно</h3>
          <p>Все транзакции записываются в блокчейн и доступны для проверки в любое время</p>
        </div>
        <div class="feature-card">
          <h3>Выгодно</h3>
          <p>Выбирайте лучших трейдеров и получайте прибыль благодаря их опыту и навыкам</p>
        </div>
      </section>
      
      <section class="how-it-works">
        <h2>Как это работает</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Подключите кошелек</h3>
            <p>Используйте MetaMask или другие поддерживаемые кошельки</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Выберите менеджера</h3>
            <p>Изучите стратегии и результаты разных трейдеров</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Инвестируйте токены</h3>
            <p>Передайте выбранные токены в управление</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Отслеживайте результаты</h3>
            <p>Наблюдайте за торговлей и выводите прибыль в любое время</p>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  
  export default {
    name: 'HomeView',
    computed: {
      ...mapState('wallet', ['isConnected'])
    },
    methods: {
      ...mapActions('wallet', ['connectWallet']),
      goToManagers() {
        this.$router.push('/managers')
      },
      goToDashboard() {
        this.$router.push('/dashboard')
      }
    }
  }
  </script>
  
  <style scoped>
  .home {
    text-align: center;
  }
  
  .hero {
    padding: 3rem 0;
    margin-bottom: 3rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  .hero p {
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto 2rem;
    color: #555;
  }
  
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .btn-primary {
    background-color: #3498db;
  }
  
  .btn-secondary {
    background-color: #2ecc71;
  }
  
  .features {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .feature-card {
    flex: 1;
    padding: 1.5rem;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .feature-card h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  .how-it-works {
    margin-bottom: 3rem;
  }
  
  .how-it-works h2 {
    margin-bottom: 2rem;
  }
  
  .steps {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
  }
  
  .step {
    flex: 1;
    text-align: center;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-weight: bold;
  }
  
  .step h3 {
    margin-bottom: 0.5rem;
  }
  </style>