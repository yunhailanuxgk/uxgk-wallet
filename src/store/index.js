import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import account from './account'
import transaction from './transaction'
import node from './node'
import ui from './ui'

let modules = {
  account,
  transaction,
  node,
  ui
}

const store = new Vuex.Store({ modules })

// for dev store hot load
if (process.env.DEV && module.hot) {
  module.hot.accept([
    './account',
    './transaction',
    './node',
    './ui'
  ], () => {
    store.hotUpdate({
      modules: {
        account: require('./account').default,
        transaction: require('./transaction').default,
        node: require('./node').default,
        ui: require('./ui').default
      }
    })
  }
  )
}

export default store
