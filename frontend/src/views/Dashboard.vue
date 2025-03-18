<template>
    <div class="dashboard">
      <h1>Личный кабинет</h1>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="dashboard-content">
        <div class="wallet-info">
          <h2>Информация о кошельке</h2>
          <div class="wallet-card">
            <div class="wallet-address">
              <strong>Адрес:</strong> 
              <span>{{ formatAddress(account) }}</span>
            </div>
            <div class="wallet-network">
              <strong>Сеть:</strong> 
              <span>{{ network ? network.name : 'Неизвестно' }}</span>
            </div>
          </div>
        </div>
        
        <div class="investments">
          <h2>Мои инвестиции</h2>
          
          <div v-if="investments.length === 0" class="empty-investments">
  <p>У вас пока нет инвестиций</p>
  <button @click="goToManagers" class="btn btn-primary">Просмотреть менеджеров</button>
</div>

<div v-else>
  <div v-for="(investmentGroup, manager) in groupedInvestments" :key="manager" class="investment-group">
    <div class="manager-header">
      <h3>Менеджер: {{ formatAddress(manager) }}</h3>
      <button @click="goToManagerDetails(manager)" class="btn btn-text">Подробнее о менеджере</button>
    </div>
    
    <div class="investment-table-container">
      <table class="investment-table">
        <thead>
          <tr>
            <th>Токен</th>
            <th>Символ</th>
            <th>Количество</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="investment in investmentGroup" :key="`${manager}-${investment.token}`">
            <td>{{ formatAddress(investment.token) }}</td>
            <td>{{ investment.symbol }}</td>
            <td>{{ investment.amount }}</td>
            <td>
              <button @click="openWithdrawModal(investment, manager)" class="btn btn-small">Вывести</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
        </div>
      </div>
      
      <!-- Модальное окно для вывода токенов -->
<div v-if="showWithdrawModal" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>Вывод токенов</h3>
      <button @click="closeWithdrawModal" class="btn-close">&times;</button>
    </div>
    
    <div class="modal-body">
      <p>
        <strong>Менеджер:</strong> {{ formatAddress(withdrawData.manager) }}
      </p>
      <p>
        <strong>Токен:</strong> {{ withdrawData.investment.symbol }} ({{ formatAddress(withdrawData.investment.token) }})
      </p>
      <p>
        <strong>Доступно:</strong> {{ withdrawData.investment.amount }}
      </p>
      
      <form @submit.prevent="handleWithdraw">
        <div class="form-group">
          <label for="withdraw-amount">Количество для вывода:</label>
          <input 
            type="number" 
            id="withdraw-amount" 
            v-model="withdrawData.amount"
            :max="withdrawData.investment.amount"
            min="0"
            step="0.000001"
            required
          >
        </div>
        
        <div class="modal-actions">
          <button type="button" @click="closeWithdrawModal" class="btn btn-secondary">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="withdrawLoading">
            <span v-if="withdrawLoading">Отправка транзакции...</span>
            <span v-else>Вывести токены</span>
          </button>
        </div>
        
        <div v-if="withdrawError" class="form-error">
          {{ withdrawError }}
        </div>
      </form>
    </div>
  </div>
</div>
      
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex'
  import { formatAddress } from '@/utils/contracts'
  
  export default {
  name: 'DashboardView',
  data() {
    return {
      loading: false,
      error: null,
      showWithdrawModal: false,
      withdrawData: {
        investment: null,
        manager: null,
        amount: 0
      },
      withdrawLoading: false,
      withdrawError: null
    }
  },
  // Переместите created до computed и methods
  async created() {
    console.log("Dashboard created вызван");
    this.loading = true;
    try {
      await this.fetchInvestments();
      console.log("Инвестиции загружены:", this.investments);
    } catch (error) {
      console.error("Ошибка при загрузке инвестиций:", error);
      this.error = "Не удалось загрузить инвестиции";
    } finally {
      this.loading = false;
    }
  },
  computed: {
    ...mapState('wallet', ['account', 'network']),
    ...mapState('trading', ['investments']),
    
    // Группировка инвестиций по менеджерам
    groupedInvestments() {
      const grouped = {}
      
      this.investments.forEach(inv => {
        if (!grouped[inv.manager]) {
          grouped[inv.manager] = []
        }
        grouped[inv.manager].push(inv)
      })
      
      return grouped
    }
  },
  methods: {
    ...mapActions('trading', ['fetchInvestments', 'withdrawTokens']),
    formatAddress,
    goToManagers() {
      this.$router.push('/managers')
    },
    goToManagerDetails(address) {
      this.$router.push(`/managers/${address}`)
    },
    openWithdrawModal(investment, manager) {
      console.log("Открытие модального окна вывода:", investment, manager);
      this.withdrawData = {
        investment,
        manager,
        amount: 0
      };
      this.showWithdrawModal = true;
    },
    
    // Закрытие модального окна
    closeWithdrawModal() {
      this.showWithdrawModal = false;
      this.withdrawData = {
        investment: null,
        manager: null,
        amount: 0
      };
      this.withdrawError = null;
    },
    
    // Обработка вывода
    async handleWithdraw() {
      console.log("Обработка вывода токенов");
      console.log("Данные:", this.withdrawData);
      
      this.withdrawLoading = true;
      this.withdrawError = null;
      
      try {
        // Проверяем все параметры
        if (!this.withdrawData.manager) {
          throw new Error("Не указан адрес менеджера");
        }
        
        if (!this.withdrawData.investment || !this.withdrawData.investment.token) {
          throw new Error("Не указан адрес токена");
        }
        
        if (!this.withdrawData.amount || this.withdrawData.amount <= 0) {
          throw new Error("Некорректная сумма вывода");
        }
        
        const result = await this.withdrawTokens({
          manager: this.withdrawData.manager,
          token: this.withdrawData.investment.token,
          amount: parseFloat(this.withdrawData.amount)
        });
        
        if (result) {
          this.closeWithdrawModal();
          await this.fetchInvestments();
        } else {
          throw new Error("Не удалось вывести токены");
        }
      } catch (error) {
        this.withdrawError = error.message || "Произошла ошибка при выводе токенов";
        console.error(error);
      } finally {
        this.withdrawLoading = false;
      }
    }
  }
}
  
  </script>
  
  <style scoped>
  h1 {
    text-align: center;
  }
  .dashboard {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .dashboard-content {
    display: grid;
    gap: 2rem;
  }
  
  .wallet-info,
  .investments {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .wallet-card {
    background-color: white;
    border-radius: 5px;
    padding: 1rem;
    margin-top: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .wallet-address,
  .wallet-network {
    margin-bottom: 0.5rem;
  }
  
  .investment-group {
    background-color: white;
    border-radius: 5px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .investment-table-container {
    overflow-x: auto;
  }
  
  .investment-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .investment-table th,
  .investment-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .investment-table th {
    font-weight: bold;
    background-color: #f5f5f5;
  }
  
  .btn-text {
    background: none;
    color: #3498db;
    padding: 0;
  }
  
  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .empty-investments {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 5px;
  }
  
  /* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #555;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background-color: #95a5a6;
}

.form-error {
  color: #e74c3c;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fbe9e7;
  border-radius: 4px;
  border-left: 4px solid #e74c3c;
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