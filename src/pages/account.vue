<template>
  <q-page class="q-pa-lg">
    <h1>
      <em class="float-right text-warning">{{ $t('account.balance') }}: <ani-number :value="account.ether" /> </em>
      <ident-icon :value="account.address.toLowerCase()"
                  class="vertical-middle q-pa-xs" /> {{ account.name }}
      <div class="changename-btn" @click.stop="changeName"></div>
      <br/>
      <small>{{ account.address }}</small>
    </h1>
    <br/>
    <q-btn flat
           size="lg"
           color="secondary"
           icon="fas fa-save"
           :label="$t('account.btn.backupAccount')"
           @click="backup(account.address)" />

    <q-btn flat
           size="lg"
           color="secondary"
           icon="fa fa-exchange-alt"
           :label="$t('account.btn.transfer')"
           @click="$router.push('/transfer/account/' + account.address)" />
    <h1 :v-if="assets.length!==0">{{ $t('token.list.title') }} <q-btn flat
                                                                      size="lg"
                                                                      color="secondary"
                                                                      icon="fas fa-plus-square"
                                                                      :label="$t('account.btn.addAssets')"
                                                                      @click="searchToken()" /></h1>
    <asset-list :assets="assets" />
    <br><br>

    <transaction-list :items="txList" />

    <q-modal v-model="showModifyModal">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('account.mondify_name') }}</p>
        <p ><q-input v-model="modifyAccountName"/></p>
        <q-btn :label="$t('button.cancel')"
               color="primary"
               class="q-my-md cancel-btn"
               @click="cancel" />
        <q-btn :label="$t('button.ok')" style="margin-left: 5px"
               color="primary"
               class="q-my-md sub-btn"
               @click="submit" />
      </div>
    </q-modal>

    <q-modal v-model="showTokenModal">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('token.list.header') }}</p>
        <token-list :searchToken="searchToken" :items="tokens" />
      </div>
    </q-modal>

  </q-page>
</template>

<style lang="stylus">
div.changename-btn
  display inline-block
  vertical-align middle
  width 22px
  height 22px
  background url("../assets/edit@2x.png") no-repeat center !important
  margin-left 3px
  cursor pointer
</style>

<script>
import { shell } from 'electron'
// const { app, dialog } = remote
// import fs from 'fs-extra'
import _ from 'lodash'
import path from 'path'

export default {
  name: 'PageAccount',
  data () {
    return {
      showModifyModal: false,
      modifyAccountName: '',
      trans: [],
      tokens: [],
      showTokenModal: false
    }
  },
  computed: {
    account () {
      return this.$store.getters['account/get'](this.$route.params.address)
    },
    assets () {
      let tokens = this.$store.getters['asset/getByAddress'](this.$route.params.address)
      return tokens
    },
    txList () {
      let address = this.$route.params.address.toLowerCase()
      return this.$store.state.transaction.list.filter((item) => {
        let from = item.from.toLowerCase()
        let to = !item.to ? 'NULL' : item.to.toLowerCase()
        return from === address || to === address
      })
    }
  },
  methods: {
    changeName () {
      const account = this.account
      this.modifyAccountName = account.name
      this.showModifyModal = true
    },
    backup (address) {
      let keystore = path.join(this.$settings.chainDataPath, 'keystore')
      shell.showItemInFolder(keystore)
    },
    cancel () {
      this.showModifyModal = false
      this.modifyAccountName = ''
    },
    submit () {
      let input = this.modifyAccountName
      console.log('You typed: ', input)
      if (input.length > 0 && input.trim() !== this.account.name) {
        this.$store.commit('account/updateAccountName', {
          address: this.account.address,
          name: input
        })
        this.showModifyModal = false
      }
    },
    searchToken (name) {
      let _this = this
      name = name === undefined ? '' : name
      let url = `http://101.251.230.212:44909/api/tokens/1/100?name=${name}`
      this.$axios.get(url).then(response => {
        if (response.status === 200) {
          if (response.data.code === 200) {
            return _.map(response.data.data.list, (token) => {
              let contract = token.address
              let address = _this.$route.params.address
              let assetInDB = this.$store.getters['asset/getByAddressAndContract'](contract, address)
              let selected = false
              if (assetInDB) {
                selected = true
              }
              return { 'name': token.symbol, 'decimals': token.decimals, 'contract': token.address, 'selected': selected, 'address': address }
            })
          }
        }
      }).then(tokens => {
        _this.tokens = tokens
        _this.showTokenModal = true
      }).catch(error => {
        console.error(error)
      })
    }
  },

  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        { key: 'nav.wallet.label', to: '/wallet' },
        { key: 'nav.wallet.account' }
      ]
    })
  }
}
</script>
