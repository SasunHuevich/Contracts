import { createStore } from 'vuex'
import wallet from './modules/wallet'
import trading from './modules/trading'

export default createStore({
  modules: {
    wallet,
    trading
  }
})