export default ({ Vue }) => {
  Vue.component('account-list', () => import('../components/AccountList'))
  Vue.component('account-item', () => import('../components/AccountItem'))
  Vue.component('ident-icon', () => import('../components/IdentIcon'))
  Vue.component('lang-switcher', () => import('../components/LangSwitcher'))
  Vue.component('transaction-list', () => import('../components/TransactionList'))
  Vue.component('transaction-item', () => import('../components/TransactionItem'))
  Vue.component('token-list', () => import('../components/TokenList'))
  Vue.component('asset-list', () => import('../components/AssetList'))
  Vue.component('ani-number', () => import('../components/AnimateNumber'))
}
