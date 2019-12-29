<template>
  <iframe src="http://chain.uxgk.com" frameborder="0" width="100%" height="1200"></iframe>
</template>
<style lang="stylus">
</style>

<script>
export default {
  name: 'PageExplorer',
  data () {
    return {
    }
  },
  validations: {},
  computed: {},
  watch: {},
  methods: {},
  mounted () {
  },
  created () {
    this.$store.commit('ui/update', {
      breadcrumbs: [
        {key: 'nav.explorer.label', to: '/explorer'}
      ]
    })
  },
  destroyed () {
  }
}
</script>
