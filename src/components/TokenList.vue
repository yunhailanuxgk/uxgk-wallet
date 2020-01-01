<template>
  <q-list
          no-border
          striped-odd
          sparse
          class="q-mt-md transaction">
    <q-search v-model="keyword" @input="search()"/>
    <q-item v-if="items.length === 0">
      <q-item-main>
        {{ $t('token.text.noTokens') }}
      </q-item-main>
    </q-item>
    <q-item sparse separator inset-separator v-for="item of items" :key="item.contract">
      <q-item-side>
        <q-checkbox v-model="item.selected" @input="selectItem(item)" />
      </q-item-side>
      <q-item-main>
        {{item.name}}
      </q-item-main>
      <q-item-side right>
        {{item.contract}}
      </q-item-side>
    </q-item>
  </q-list>
</template>

<style lang="stylus">
  .q-input {
    width 40em;
  }
</style>

<script>

export default {
  name: 'TokenList',
  props: {
    items: {
      required: true
    },
    searchToken: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      keyword: ''
    }
  },
  methods: {
    selectItem (item) {
      this.$store.commit('asset/updateAsset', item)
    },
    search () {
      console.log(`keyword==>${this.keyword}`)
      this.searchToken(this.keyword)
    }
  }
}
</script>
