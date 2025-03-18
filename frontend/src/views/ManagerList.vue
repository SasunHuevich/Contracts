<template>
    <div class="manager-list">
      <h1>Список менеджеров</h1>
      <p>Выберите менеджера для инвестирования ваших токенов</p>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка списка менеджеров...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="managers.length === 0" class="empty-message">
        <p>Список менеджеров пуст.</p>
      </div>
      
      <div v-else class="managers-grid">
        <div v-for="manager in managers" :key="manager.address" class="manager-card">
          <h3>{{ manager.name }}</h3>
          <p class="manager-address">{{ formatAddress(manager.address) }}</p>
          <p class="manager-description">{{ manager.description }}</p>
          <div class="manager-stats">
            <div class="stat-item">
              <span class="stat-label">Доходность:</span>
              <span class="stat-value">{{ manager.performance }}</span>
            </div>
          </div>
          <button @click="viewManagerDetails(manager.address)" class="btn btn-primary">Подробнее</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { formatAddress } from '@/utils/contracts'
  
  export default {
    name: 'ManagerListView',
    data() {
      return {
        loading: false,
        error: null
      }
    },
    computed: {
      ...mapState('trading', ['managers'])
    },
    methods: {
      ...mapActions('trading', ['fetchManagers']),
      formatAddress,
      viewManagerDetails(address) {
        this.$router.push(`/managers/${address}`)
      }
    },
    async created() {
      this.loading = true
      try {
        await this.fetchManagers()
      } catch (error) {
        this.error = 'Не удалось загрузить список менеджеров'
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  }
  </script>
  
  <style scoped>
  .manager-list {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 1rem;
    text-align: center;
  }

  p {
  text-align: center;
}
  
  .managers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
  .manager-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .manager-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .manager-address {
    color: #666;
    margin-bottom: 0.5rem;
    font-family: monospace;
  }
  
  .manager-description {
    color: #333;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
  
  .manager-stats {
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
  }
  
  .stat-label {
    font-weight: bold;
    color: #555;
  }
  
  .stat-value {
    color: #2ecc71;
    font-weight: bold;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .empty-message, .error-message {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .error-message {
    color: #e74c3c;
  }
  </style>