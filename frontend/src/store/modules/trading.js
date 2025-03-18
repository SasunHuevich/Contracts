import { ethers } from 'ethers'

const state = {
  managers: [],
  investments: [],
  tokens: [],
  loading: false,
  error: null
}

const getters = {
  // Геттеры для данных трейдинга
}

const actions = {
  // Получение списка менеджеров (в реальном приложении это может быть отдельный контракт/API)
  async fetchManagers({ commit }) {
    commit('SET_LOADING', true)
    
    try {
      // Здесь был бы запрос к контракту/API для получения списка менеджеров
      // Для демо - хардкодим пример
      const mockManagers = [
        {
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          name: 'Trader 1',
          description: 'Опытный трейдер с фокусом на DeFi-активы',
          performance: '12.5%'
        },
        {
          address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          name: 'Trader 2',
          description: 'Специалист по NFT и игровым токенам',
          performance: '8.3%'
        }
      ]
      
      commit('SET_MANAGERS', mockManagers)
    } catch (error) {
      commit('SET_ERROR', 'Ошибка при получении списка менеджеров')
      console.error('Ошибка при получении менеджеров:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Получение инвестиций пользователя
  async fetchInvestments({ commit, rootState }) {
    if (!rootState.wallet.isConnected) return
    
    commit('SET_LOADING', true)
    console.log("fetchInvestments запущен");
    try {
      // Адрес контракта
      const socialTradingAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      
      // Создаем новый провайдер и контракт
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Создаем контракт
      const SocialTradingJson = await import('@/abis/SocialTrading.json');
      const socialTrading = new ethers.Contract(
        socialTradingAddress,
        SocialTradingJson.default || SocialTradingJson,
        signer
      );
      
      // Получаем текущий аккаунт
      const userAddress = await signer.getAddress();
      console.log("Получаем инвестиции для пользователя:", userAddress);
      
      // Получаем список менеджеров
      const mockManagers = [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      ];
      
      const investments = [];
      
      for (const managerAddress of mockManagers) {
        console.log(`Проверяем инвестиции у менеджера: ${managerAddress}`);
        
        try {
          // Получаем токены инвестора
          const tokenAddresses = await socialTrading.getInvestorTokens(managerAddress, userAddress);
          console.log(`Найдено ${tokenAddresses.length} токенов у менеджера ${managerAddress}`);
          
          for (const tokenAddress of tokenAddresses) {
            console.log(`Обрабатываем токен: ${tokenAddress}`);
            
            // Получаем количество инвестированных токенов
            const amount = await socialTrading.getInvestmentAmount(managerAddress, userAddress, tokenAddress);
            
            // Создаем экземпляр контракта токена
            const ERC20ABI = await import('@/abis/ERC20.json');
            const tokenContract = new ethers.Contract(
              tokenAddress,
              ERC20ABI.default || ERC20ABI,
              signer
            );
            
            // Получаем информацию о токене
            let name = "Unknown Token";
            let symbol = "???";
            let decimals = 18;
            
            try {
              name = await tokenContract.name();
              symbol = await tokenContract.symbol();
              decimals = await tokenContract.decimals();
            } catch (error) {
              console.warn(`Не удалось получить детали токена ${tokenAddress}:`, error);
            }
            
            investments.push({
              manager: managerAddress,
              token: tokenAddress,
              amount: ethers.utils.formatUnits(amount, decimals),
              name,
              symbol
            });
            
            console.log(`Добавлена инвестиция: ${symbol} (${ethers.utils.formatUnits(amount, decimals)})`);
          }
        } catch (error) {
          console.warn(`Ошибка при получении инвестиций у менеджера ${managerAddress}:`, error);
        }
      }
      
      console.log(`Всего найдено ${investments.length} инвестиций`);
      console.log("Инвестиции загружены:", investments);
      commit('SET_INVESTMENTS', investments);
    } catch (error) {
      commit('SET_ERROR', 'Ошибка при получении инвестиций');
      console.error('Ошибка при получении инвестиций:', error);
    } finally {
      commit('SET_LOADING', false);
    }
    
  },
  
  // Инвестировать токены менеджеру
  async investTokens({ commit, rootState }, { manager, token, amount }) {
    console.log("Вызов функции investTokens с параметрами:");
    console.log("manager:", manager);
    console.log("token:", token);
    console.log("amount:", amount);
    
    if (!manager || !token) {
      commit('SET_ERROR', 'Необходимо указать адрес менеджера и токена');
      return false;
    }
    
    if (!rootState.wallet.isConnected) return
    
    commit('SET_LOADING', true)
    
    try {
      // Адрес контракта SocialTrading
      const socialTradingAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      console.log("Адрес контракта SocialTrading:", socialTradingAddress);
      
      // Создаем провайдер и signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Получаем текущую сеть
      const network = await provider.getNetwork();
      console.log("Текущая сеть:", network);
      
      // Проверяем код контракта
      try {
        const code = await provider.getCode(token);
        console.log("Код контракта токена:", code.substring(0, 20) + "...");
        
        if (code === '0x') {
          throw new Error("По указанному адресу нет контракта");
        }
      } catch (error) {
        console.error("Ошибка при проверке кода контракта:", error);
        throw new Error("Проблема с проверкой адреса токена. Убедитесь, что Hardhat нода запущена.");
      }
      
      // Создаем контракты
      const SocialTradingJson = await import('@/abis/SocialTrading.json');
      const ERC20ABI = await import('@/abis/ERC20.json');
      
      const socialTrading = new ethers.Contract(
        socialTradingAddress,
        SocialTradingJson.default || SocialTradingJson,
        signer
      );
      
      const tokenContract = new ethers.Contract(
        token,
        ERC20ABI.default || ERC20ABI,
        signer
      );
      
      // Фиксированное значение decimals для упрощения
      const decimals = 18;
      console.log("Используем decimals:", decimals);
      
      // Конвертируем сумму
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
      console.log("Сумма в wei:", amountWei.toString());
      
      // Получаем адрес пользователя
      const userAddress = await signer.getAddress();
      console.log("Адрес пользователя:", userAddress);
      
      try {
        // Approve
        console.log("Отправляем approve...");
        const approvalTx = await tokenContract.approve(socialTradingAddress, amountWei);
        console.log("Transaction hash (approve):", approvalTx.hash);
        console.log("Ожидаем подтверждение approve...");
        await approvalTx.wait();
        console.log("Approve подтвержден");
        
        // Инвестируем
        console.log("Отправляем investTokens...");
        const investTx = await socialTrading.investTokens(manager, token, amountWei);
        console.log("Transaction hash (invest):", investTx.hash);
        console.log("Ожидаем подтверждение investTokens...");
        await investTx.wait();
        console.log("Инвестирование выполнено успешно");
        
        return true;
      } catch (txError) {
        console.error("Ошибка транзакции:", txError);
        throw new Error("Ошибка транзакции: " + (txError.message || "Неизвестная ошибка"));
      }
    } catch (error) {
      commit('SET_ERROR', error.message || 'Ошибка при инвестировании токенов');
      console.error('Ошибка при инвестировании:', error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
// Вывод токенов от менеджера
async withdrawTokens({ commit, rootState }, { manager, token, amount }) {
    console.log("Вызов функции withdrawTokens с параметрами:");
    console.log("manager:", manager);
    console.log("token:", token);
    console.log("amount:", amount);
    
    if (!manager || !token) {
      commit('SET_ERROR', 'Необходимо указать адрес менеджера и токена');
      return false;
    }
    
    if (!rootState.wallet.isConnected) return
    
    commit('SET_LOADING', true)
    
    try {
      // Используем жестко заданный адрес контракта
      const socialTradingAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      console.log("Адрес контракта SocialTrading:", socialTradingAddress);
      
      // Создаем новый провайдер напрямую
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Получаем текущий адрес пользователя
      const userAddress = await signer.getAddress();
      console.log("Адрес пользователя:", userAddress);
      
      // Создаем экземпляр контракта SocialTrading
      const SocialTradingJson = await import('@/abis/SocialTrading.json');
      const socialTrading = new ethers.Contract(
        socialTradingAddress,
        SocialTradingJson.default || SocialTradingJson,
        signer
      );
      
      // Создаем экземпляр контракта токена
      const ERC20ABI = await import('@/abis/ERC20.json');
      const tokenContract = new ethers.Contract(
        token,
        ERC20ABI.default || ERC20ABI,
        signer
      );
      
      // Получаем decimals токена или используем стандартное значение 18
      let decimals = 18;
      try {
        decimals = await tokenContract.decimals();
        console.log("Decimals токена:", decimals);
      } catch (error) {
        console.warn("Не удалось получить decimals, используем 18:", error);
      }
      
      // Конвертируем сумму в wei
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
      console.log("Сумма в wei:", amountWei.toString());
      
      // Вывод токенов
      console.log("Отправляем withdrawTokens...");
      console.log("Параметры: manager =", manager, "token =", token, "amount =", amountWei.toString());
      
      const withdrawTx = await socialTrading.withdrawTokens(manager, token, amountWei);
      console.log("Transaction hash:", withdrawTx.hash);
      console.log("Ожидаем подтверждение withdrawTokens...");
      await withdrawTx.wait();
      console.log("Вывод токенов выполнен успешно");
      
      // Обновляем данные инвестиций
      await this.dispatch('trading/fetchInvestments');
      
      return true;
    } catch (error) {
      commit('SET_ERROR', 'Ошибка при выводе токенов: ' + (error.message || 'Неизвестная ошибка'));
      console.error('Ошибка при выводе токенов:', error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  }
}

const mutations = {
  SET_MANAGERS(state, managers) {
    state.managers = managers
  },
  SET_INVESTMENTS(state, investments) {
    state.investments = investments
  },
  SET_TOKENS(state, tokens) {
    state.tokens = tokens
  },
  SET_LOADING(state, loading) {
    state.loading = loading
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