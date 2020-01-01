<template>
  <div>
    <q-list
      :v-if="assets.length!==0"
      v-for="asset of assets" :key="asset.contract"
      no-border
      class="q-mt-md transaction">
      <q-item>
        <q-item-side>
          <ident-icon :value="asset.contract" />
        </q-item-side>
        <q-item-main>
          <q-item-tile>
            <strong>{{asset.name}}</strong>
          </q-item-tile>
          <q-item-tile class="address">{{asset.contract}}</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-item-tile>{{ $t('token.list.balance') }}</q-item-tile>
          <q-item-tile>
            {{asset.balance}}
          </q-item-tile>
        </q-item-side>
        <q-item-side right>
          <q-btn flat
                 size="md"
                 color="secondary"
                 icon="fa fa-exchange-alt"
                 :label="$t('account.btn.transfer')"
                 @click="transferToken(asset)" />
        </q-item-side>
      </q-item>
    </q-list>
    <q-modal v-model="showTokenTransferModal" @hide="reset">
      <div class="q-pa-md">
        <p class="q-headline">{{asset.name}} {{$t('tx.transfer.title')}}</p>
        <q-field>
          {{asset.address}}
        </q-field>
        <q-field :error-label="$t('tx.transfer.to_error')"
                 :error="$v.form.to.$error">
          <q-input v-model="form.to"
                   :float-label="$t('tx.transfer.to_label')"
                   placeholder="0x0000..."
                   @blur="$v.form.to.$touch" />
        </q-field>
        <q-field :error-label="$t('tx.transfer.balance_error')"
                 :error="$v.form.amount.$error">
          <q-input :float-label="$t('tx.transfer.balance_label')"
                   v-model="form.amount"
                   type="number"
                   :suffix="asset.name"
                   clearable
                   @blur="$v.form.amount.$touch"/>
        </q-field>
        <q-field :error-label="$t('tx.transfer.password_error')">
          <q-input :float-label="$t('account.create.password_msg1')"
                   type="password"
                   v-model="form.password"
                   @blur="$v.form.password.$touch"
                   :error="$v.form.password.$error" />
        </q-field>
        <q-btn :label="$t('button.ok')"
               color="primary"
               class="float-right q-my-md"
               @click="submit" />
      </div>
    </q-modal>
  </div>
</template>

<style lang="stylus">
  .q-input {
    width 40em;
  }
</style>

<script>
import { required, minValue } from 'vuelidate/lib/validators'
import { address } from '../validators'
import BigNumber from 'bignumber.js'
import {Types} from '../../src-electron/modules/ipc/types'
const ipc = window.ipc
const web3 = window.web3
const ercContract = window.ercContract
export default {
  name: 'AssetList',
  props: {
    assets: {
      required: true
    }
  },
  data () {
    return {
      showTokenTransferModal: false,
      asset: {name: '', address: '', contract: ''},
      form: {
        from: '',
        to: '',
        amount: '',
        password: ''
      }
    }
  },
  validations: {
    form: {
      to: { required, address },
      password: { required },
      amount: { required, minValue: minValue(0) }
    }
  },
  methods: {
    transferToken (asset) {
      this.showTokenTransferModal = true
      this.asset = asset
    },
    reset () {
      this.$v.$reset()
      this.form.to = ''
      this.form.amount = ''
      this.form.password = ''
    },
    submit () {
      console.log('submit transfer')
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        let result = new BigNumber(web3.utils.toBN(this.form.amount).toString())
        let base = Math.pow(10, this.asset['decimals'])
        let amount = result.multipliedBy(base).toFixed()
        let data = ercContract.methods.transfer(this.form.to, amount).encodeABI()
        let tx = {
          gas: 100000,
          gasPrice: 18000000000,
          from: this.asset.address,
          to: this.asset.contract,
          value: 0,
          data
        }
        let password = this.form.password
        this.$q.loading.show({ delay: 400 })
        ipc.send(Types.SEND_TRANSACTION, { tx, password })
        this.showTokenTransferModal = false
        this.reset()
      }
    }
  },
  created () {
    const $vm = this
    ipc.on(Types.SEND_TRANSACTION_REPLY, (event, reply) => {
      console.log('send transaction reply: ', reply)
      this.$q.loading.hide()
      if (reply.error && reply.error === 'invalid-password') {
        $vm.$q.notify(this.$t('tx.transfer.confirm.wrong_pwd'))
      }
    })
  },
  destroyed () {
    ipc.removeAllListeners(Types.SEND_TRANSACTION_REPLY)
  }
}
</script>
