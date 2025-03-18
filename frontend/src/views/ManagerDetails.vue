<template>
    <div class="manager-details">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка данных менеджера...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="manager-content">
        <div class="manager-header">
          <button @click="goBack" class="btn btn-text">← Назад к списку</button>
          <h1>{{ manager ? manager.name : 'Менеджер' }}</h1>
          <p class="manager-address">{{ formatAddress(address) }}</p>
        </div>
        
        <div class="manager-info">
          <div class="manager-description">
            <h2>О менеджере</h2>
            <p>{{ manager ? manager.description : 'Информация отсутствует' }}</p>
          </div>
          
          <div class="manager-stats">
            <h2>Статистика</h2>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-value">{{ manager ? manager.performance : '0%' }}</div>
                <div class="stat-label">Доходность</div>
              </div>
              <!-- Другие показатели статистики -->
            </div>
          </div>
        </div>
        
        <div class="investment-form">
          <h2>Инвестировать токены</h2>
          <div v-if="!isConnected" class="wallet-warning">
            <p>Для инвестирования необходимо подключить кошелек</p>
            <button @click="connectWallet" class="btn btn-primary">Подключить кошелек</button>
          </div>
          
          <form @submit.prevent="handleInvestment">
  <div class="form-group">
    <label for="token-address">Адрес токена:</label>
    <input 
      type="text" 
      id="token-address" 
      v-model="investForm.tokenAddress"
      placeholder="0x..."
      required
    >
  </div>
  
  <div class="form-group">
    <label for="amount">Количество:</label>
    <input 
      type="number" 
      id="amount" 
      v-model="investForm.amount"
      placeholder="0.0"
      min="0"
      step="0.000001"
      required
    >
  </div>
  
  <button type="submit" class="btn btn-primary" :disabled="investLoading">
    <span v-if="investLoading">Отправка транзакции...</span>
    <span v-else>Инвестировать</span>
  </button>
  <div v-if="investSuccess" class="form-success">
  Токены успешно инвестированы! Теперь вы можете просмотреть ваши инвестиции в Личном кабинете.
  <div class="mt-3">
    <router-link to="/dashboard" class="btn btn-small">Перейти в личный кабинет</router-link>
  </div>
</div>
</form>
<div class="actions-row">
  <button @click="goToDashboard" class="btn btn-secondary">
    Перейти в личный кабинет
  </button>
</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
import { formatAddress } from '@/utils/contracts'

export default {
  name: 'ManagerDetailsView',
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      manager: null,
      investForm: {
        tokenAddress: '',
        amount: ''
      },
      investLoading: false,
      investError: null,
      investSuccess: false
    }
  },
  computed: {
    ...mapState('wallet', ['isConnected']),
    ...mapState('trading', ['managers'])
  },
  methods: {
    ...mapActions('wallet', ['connectWallet']),
    ...mapActions('trading', ['investTokens']),
    formatAddress, // Добавляем formatAddress как метод
    
    goBack() {
      this.$router.push('/managers');
    },

    goToDashboard() {
    this.$router.push('/dashboard');
    },

    async fetchManagerDetails() {
      this.loading = true;
      try {
        // В реальном приложении здесь был бы запрос к API или контракту
        // Для демо берем из стора
        this.manager = this.managers.find(m => m.address.toLowerCase() === this.address.toLowerCase());
        
        if (!this.manager) {
          throw new Error('Менеджер не найден');
        }
      } catch (error) {
        this.error = error.message || 'Не удалось загрузить данные менеджера';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async handleInvestment() {
      this.investLoading = true;
      this.investError = null;
      this.investSuccess = false;
      
      console.log("Вызов handleInvestment с параметрами:");
      console.log("manager (this.address):", this.address);
      console.log("token (this.investForm.tokenAddress):", this.investForm.tokenAddress);
      console.log("amount:", parseFloat(this.investForm.amount));
      
      // Проверка параметров
      if (!this.address || !this.investForm.tokenAddress || !this.investForm.amount) {
        this.investError = "Пожалуйста, заполните все поля формы";
        this.investLoading = false;
        return;
      }
      
      try {
        const result = await this.investTokens({
          manager: this.address,
          token: this.investForm.tokenAddress,
          amount: parseFloat(this.investForm.amount)
        });
        
        if (result) {
          this.investSuccess = true;
          // Сбрасываем форму
          this.investForm.tokenAddress = '';
          this.investForm.amount = '';
        } else {
          throw new Error('Не удалось инвестировать токены');
        }
      } catch (error) {
        this.investError = error.message || 'Произошла ошибка при инвестировании';
        console.error(error);
      } finally {
        this.investLoading = false;
      }
    }
  },
  created() {
    this.fetchManagerDetails();
  }
}
  </script>
  
  <style scoped>
  .manager-details {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .manager-header {
    margin-bottom: 2rem;
  }
  
  .btn-text {
    background: none;
    color: #3498db;
    padding: 0;
    margin-bottom: 1rem;
    text-align: left;
  }
  
  .btn-text:hover {
    text-decoration: underline;
    background: none;
  }
  
  .manager-address {
    color: #666;
    font-family: monospace;
  }
  
  .manager-info {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .manager-description,
  .manager-stats {
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .stat-card {
    text-align: center;
    padding: 1rem;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2ecc71;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.5rem;
  }
  
  .investment-form {
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .wallet-warning {
    text-align: center;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .form-error {
    color: #e74c3c;
    margin-top: 1rem;
  }
  
  .form-success {
    color: #2ecc71;
    margin-top: 1rem;
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
  </style>