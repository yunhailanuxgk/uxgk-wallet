<template>
  <q-page class="q-pa-lg">
    <div class="gutter-md">
      <div class="row gutter-md">
        <div class="col-sm" style="margin-top: -39px">
          <q-field :error-label="$t('tx.transfer.from_error')"
                   :error="$v.form.from.$error">
            <q-select :float-label="$t('tx.transfer.from_label')"
                      v-model="form.from"
                      :options="options()" />
          </q-field>
        </div>
      </div>
      <div class="row gutter-md">
        <div class="col-sm">
          <q-field :error-label="$t('tx.transfer.to_error')"
                   :error="$v.form.to.$error">
            <q-input v-model="form.to"
                     :float-label="$t('tx.transfer.to_label')"
                     placeholder="0x0000..."
                     @blur="$v.form.to.$touch" />
          </q-field>
        </div>
      </div>
      <div class="row gutter-md">
        <div class="col-sm">
          <q-field :error-label="$t('tx.transfer.balance_error')"
                   :error="$v.form.amount.$error">
            <q-input :float-label="$t('tx.transfer.balance_label')"
                     v-model="form.amount"
                     type="number"
                     :suffix="$unit"
                     clearable
                     @blur="$v.form.amount.$touch"/>
          </q-field>
        </div>
      </div>
      <div class="row gutter-md">
        <div class="col-sm">
          <q-input :stack-label="$t('tx.transfer.balance')"
                   v-model="balance"
                   disable
                   :suffix="$unit" />
        </div>
      </div>
      <div class="row gutter-md">
        <div class="col-sm">
          估计交易费用：{{gasFee}}
        </div>
        <div class="col-sm inline">
          <q-btn icon="send"
                 size="lg"
                 label="确认转账"
                 color="secondary"
                 @click="transfer"
                 :disable="disabled">
          </q-btn>
        </div>
      </div>
    </div>
    <q-modal v-model="showConfirmModal"
             minimized
             :content-css="{padding: '30px'}">

      <div class="row justify-center q-mb-md">
        <div class="q-display-1">{{$t('tx.transfer.confirm.title')}}</div>
      </div>
      <div class="row justify-center"><ident-icon :value="form.from"/></div>
      <div class="row q-pa-md">{{form.from}}</div>
      <div class="row justify-center"><q-icon name="arrow_downward" /></div>
      <div class="row q-pa-md">{{form.to}}</div>
      <div class="row q-pa-md">
        <div class="col">{{$t('tx.transfer.confirm.transfer_amount')}}：</div>
        <div>{{form.amount}} {{$unit}}</div>
      </div>
      <div class="row q-pa-md">
        <div class="col">{{$t('tx.transfer.confirm.fee')}}：</div>
        <div>{{gasFee}} {{$unit}}</div>
      </div>
      <div class="row q-pa-md">
        <div class="col">{{$t('tx.transfer.confirm.total')}}：</div>
        <div>{{total}} {{$unit}}</div>
      </div>
      <div class="row q-pa-md gutter-md justify-end">
        <div>

          <q-btn color="tertiary"
                 @click="showConfirmModal = false; disabled = false"
                 :label="$t('button.cancel')" />
        </div>
        <div>
          <q-btn color="primary"
                 @click="confirm"
                 :label="$t('button.ok')" />
        </div>
      </div>
    </q-modal>

    <q-modal v-model="showPasswordModal">
      <div class="q-pa-md">
        <p class="q-headline">{{ $t('tx.transfer.confirm.enter_pwd') }}</p>
        <p><q-input type="password" v-model="password"/></p>
        <q-btn :label="$t('button.cancel')"
               color="tertiary"
               class="q-my-md"
               @click="cancel" />
        <q-btn :label="$t('button.ok')" style="margin-left: 5px"
               color="primary"
               class="q-my-md"
               @click="submit" />
      </div>
    </q-modal>

  </q-page>
</template>
<style lang="stylus">

</style>

<script>
import _ from 'lodash'
import { required, minValue } from 'vuelidate/lib/validators'
// import { ipc } from 'electron'
import BigNumber from 'bignumber.js'
const BN = BigNumber
import { address } from '../validators'
import { Types } from '../../src-electron/modules/ipc/types'

const ipc = window.ipc
const web3 = window.web3

export default {
  name: 'PageTransfer',
  data () {
    return {
      showConfirmModal: false,
      showPasswordModal: false,
      form: {
        from: this.$route.params.address || '',
        to: '',
        amount: ''
      },
      password: '',
      // balance: 0,
      gasFee: 0,
      total: 0,
      gas: 0,
      gasPrice: 0,
      disabled: false
    }
  },
  validations: {
    form: {
      from: { required },
      to: { required, address },
      amount: { required, minValue: minValue(0) }
    }
  },
  computed: {
    balance () {
      if (this.form.from !== '') {
        return this.getAccountUXGK(this.form.from)
      } else {
        return 0
      }
    }
  },
  watch: {
    'form.from': function (newAddress, oldAddress) {
    },
    'form.to': function () {
      this.estimateGas()
    },
    'form.amount': function (newAmount, oldAmount) {
      this.estimateGas()
    }
  },
  methods: {
    estimateGas: _.debounce(function () {
      let validTo = web3.utils.isAddress(this.form.to)
      let amount = _.toNumber(this.form.amount)

      if (validTo && !isNaN(amount) && amount > 0) {
        let from = this.form.from
        let to = this.form.to
        let value = web3.utils.toWei(new BN(amount).toFixed())
        Promise.all([
          web3.eth.estimateGas({ from, to, value }),
          web3.eth.getGasPrice()
        ])
          .then(([gas, price]) => {
            console.log('estimateGas = ', gas, ', gasPrice = ', price)
            let fee = new BN(gas).times(new BN(price)).toFixed()
            console.log('transfer fee: ', fee)
            this.gasFee = web3.utils.fromWei(fee)
            this.gas = gas
            this.gasPrice = price
            this.total = new BN(this.gasFee).plus(new BN(this.form.amount)).toFixed()
          })
          .catch(console.log)
      }
    }, 400),
    getFrom () {
      if (this.$route.params.address) {
        return this.$route.params.address
      } else {
        return ''
      }
    },
    getAccountUXGK (address) {
      if (address) {
        let account = this.$store.getters['account/get'](address)
        if (account != null) {
          return account.ether
        }
      }
      return ''
    },
    options () {
      let accounts = this.$store.state.account.list
      let options = accounts.map(account => {
        return {
          label: account.name,
          sublabel: account.address,
          value: account.address,
          avatar: this.$icon(account.address.toLowerCase())
        }
      })
      return options
    },
    transfer () {
      this.$v.form.$touch()
      if (this.form.amount > this.balance - this.gasFee) {
        this.$q.notify({ message: this.$t('tx.transfer.insufficient_funds'), color: 'positive', timeout: 1000 })
        return
      }
      if (!this.$v.form.$error) {
        this.disabled = true
        this.showConfirmModal = true
      }
    },
    confirm () {
      this.showConfirmModal = false
      this.showPasswordModal = true
    },
    cancel () {
      this.showPasswordModal = false
      this.password = ''
    },
    submit () {
      let tx = {
        gas: this.gas,
        gasPrice: this.gasPrice,
        from: this.form.from,
        to: this.form.to,
        value: web3.utils.toWei(this.form.amount.toString())
      }
      let password = this.password
      this.$q.loading.show({ delay: 400 })
      ipc.send(Types.SEND_TRANSACTION, { tx, password })
      this.showPasswordModal = false
      this.password = ''
    }
  },

  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        {key: 'nav.transfer.label', to: '/transfer'}
      ]
    })

    const $vm = this

    ipc.on(Types.SEND_TRANSACTION_REPLY, (event, reply) => {
      console.log('send transaction reply: ', reply)
      this.$q.loading.hide()
      if (reply.error && reply.error === 'invalid-password') {
        $vm.$q.notify(this.$t('tx.transfer.confirm.wrong_pwd'))
        $vm.disabled = false
      } else {
        $vm.$router.push('/wallet')
      }
    })
  },

  destroyed () {
    ipc.removeAllListeners(Types.SEND_TRANSACTION_REPLY)
  }
}
</script>
