import { ethers } from 'ethers'

const state = {
  provider: null,
  signer: null,
  account: null,
  isConnected: false,
  network: null,
  contracts: null,
  error: null
}

const getters = {
  // Геттеры для состояния кошелька
}

const actions = {
  // Подключение кошелька
  async connectWallet({ commit, dispatch }, silent = false) {
    console.log('Функция connectWallet вызвана, silent:', silent);
    
    try {
      // Проверяем наличие MetaMask или другого провайдера
      console.log('Проверка window.ethereum:', window.ethereum ? 'Доступен' : 'Недоступен');
      
      if (window.ethereum) {
        try {
          console.log('Создаем провайдер...');
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Запрашиваем аккаунты
          console.log('Запрашиваем аккаунты, silent:', silent);
          let accounts = [];
          
          if (!silent) {
            console.log('Выполняем запрос eth_requestAccounts...');
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          } else {
            console.log('Проверяем текущие подключенные аккаунты...');
            accounts = await provider.listAccounts();
          }
          
          console.log('Полученные аккаунты:', accounts);
          
          if (accounts.length === 0) {
            console.log('Нет доступных аккаунтов, выход из функции');
            return;
          }
          
          console.log('Получаем signer и детали аккаунта...');
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          const network = await provider.getNetwork();
          
          console.log('Аккаунт:', account);
          console.log('Сеть:', network);
          
          // Устанавливаем данные в хранилище
          commit('SET_PROVIDER', provider);
          commit('SET_SIGNER', signer);
          commit('SET_ACCOUNT', account);
          commit('SET_NETWORK', network);
          commit('SET_CONNECTED', true);
          commit('SET_ERROR', null);
          
          // Инициализация контрактов
          console.log('Инициализация контрактов...');
          await dispatch('initContracts');
          
          // Добавляем слушатели событий
          console.log('Добавляем слушатели событий для MetaMask...');
          window.ethereum.on('accountsChanged', (accounts) => {
            console.log('accountsChanged:', accounts);
            if (accounts.length === 0) {
              dispatch('disconnect');
            } else {
              dispatch('connectWallet', true);
            }
          });
          
          window.ethereum.on('chainChanged', () => {
            console.log('chainChanged - перезагрузка страницы');
            window.location.reload();
          });
          
          console.log('Подключение кошелька успешно завершено');
        } catch (err) {
          console.error('Ошибка при взаимодействии с MetaMask:', err);
          commit('SET_ERROR', err.message);
        }
      } else {
        console.warn('MetaMask не обнаружен!');
        alert('Для работы с приложением необходимо установить MetaMask или совместимый кошелек');
        commit('SET_ERROR', 'MetaMask не обнаружен');
      }
    } catch (error) {
      console.error('Глобальная ошибка подключения кошелька:', error);
      commit('SET_ERROR', error.message);
    }
  },
  
// Отключение кошелька
async disconnect({ commit }) {
    console.log('Выполняется отключение кошелька...');
    
    // В новых версиях MetaMask есть метод для отключения
    if (window.ethereum && window.ethereum.disconnect) {
      try {
        await window.ethereum.disconnect();
        console.log('MetaMask disconnect вызван успешно');
      } catch (error) {
        console.warn('Ошибка при вызове ethereum.disconnect:', error);
        // Продолжаем выполнение даже при ошибке
      }
    }
    
    // Очищаем все данные в хранилище
    commit('SET_PROVIDER', null);
    commit('SET_SIGNER', null);
    commit('SET_ACCOUNT', null);
    commit('SET_NETWORK', null);
    commit('SET_CONNECTED', false);
    commit('SET_CONTRACTS', null);
    commit('SET_ERROR', null);
    
    console.log('Кошелек успешно отключен');
  },
  
  async initContracts({ commit, state }) {
    if (!state.signer) return
    
    try {
      // Вместо использования state.signer, который является прокси,
      // создадим новый провайдер и signer напрямую
      const chainId = state.network.chainId;
      console.log("Текущая сеть (chainId):", chainId);
      
      // Создаем новый провайдер напрямую
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const newSigner = provider.getSigner();
      
      // Создаем объект с адресами контрактов
      const contractAddresses = {
        31337: {
          socialTrading: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707' // Ваш адрес контракта
        }
      };
      
      // Определяем адрес контракта для текущей сети
      const socialTradingAddress = (contractAddresses[chainId] && contractAddresses[chainId].socialTrading) || 
                                 contractAddresses[31337].socialTrading;
      
      console.log("Используем адрес контракта:", socialTradingAddress);
      
      // Импортируем ABI
      const SocialTradingJson = await import('@/abis/SocialTrading.json');
      
      // Создаем экземпляр контракта с НОВЫМ signer, а не с прокси
      const socialTrading = new ethers.Contract(
        socialTradingAddress,
        SocialTradingJson.default || SocialTradingJson,
        newSigner // Используем новый signer
      );
      
      const contracts = {
        socialTrading
      };
      
      commit('SET_CONTRACTS', contracts);
      console.log("Контракты успешно инициализированы");
    } catch (error) {
      commit('SET_ERROR', 'Ошибка при инициализации контрактов');
      console.error('Ошибка инициализации контрактов:', error);
      // Выводим больше деталей об ошибке для отладки
      console.error('Детали ошибки:', error.message);
      if (error.stack) console.error('Stack trace:', error.stack);
    }
  }
}

const mutations = {
  SET_PROVIDER(state, provider) {
    state.provider = provider
  },
  SET_SIGNER(state, signer) {
    state.signer = signer
  },
  SET_ACCOUNT(state, account) {
    state.account = account
  },
  SET_NETWORK(state, network) {
    state.network = network
  },
  SET_CONNECTED(state, isConnected) {
    state.isConnected = isConnected
  },
  SET_CONTRACTS(state, contracts) {
    state.contracts = contracts
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}