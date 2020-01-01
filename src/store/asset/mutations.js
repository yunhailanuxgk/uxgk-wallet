import BigNumber from 'bignumber.js'
// reset vuex store asset list
export const reset = (state, assets) => {
  state.list = assets
}

export const load = (state) => {
  console.log('reload assets in db')
  const db = window.db
  const assets = db.assets
  state.list = assets.find({})
  state.list.forEach(asset => {
    let web3 = window.web3
    web3.eth.call({to: asset.contract, data: window.ercContract.methods.balanceOf(asset.address).encodeABI()}).then(data => {
      let result = new BigNumber(web3.utils.toBN(data).toString())
      let base = Math.pow(10, asset['decimals'])
      asset.balance = result.div(base).toFixed()
    })
  })
}

export const reload = (state) => {
  console.log('reload assets in db')
  state.list.forEach(asset => {
    let web3 = window.web3
    web3.eth.call({to: asset.contract, data: window.ercContract.methods.balanceOf(asset.address).encodeABI()}).then(data => {
      let result = new BigNumber(web3.utils.toBN(data).toString())
      let base = Math.pow(10, asset['decimals'])
      asset.balance = result.div(base).toFixed()
    })
  })
}

export const updateAsset = (state, asset) => {
  const db = window.db
  const assets = db.assets
  let item = assets.findOne({'address': asset.address, 'contract': asset.contract})
  if (item != null) {
    console.log('Remove asset', item.name)
    assets.remove({'$loki': item['$loki']})
    state.list = assets.find({})
  } else {
    console.log('Insert account: ', asset)
    asset['_id'] = Date.now() + Math.random() * 10
    assets.insert({'_id': asset['_id'], 'address': asset['address'], 'contract': asset['contract'], 'decimals': asset['decimals'], 'name': asset['name']})
    let web3 = window.web3
    web3.eth.call({to: asset.contract, data: window.ercContract.methods.balanceOf(asset.address).encodeABI()}).then(data => {
      let result = new BigNumber(web3.utils.toBN(data).toString())
      let base = Math.pow(10, asset['decimals'])
      asset.balance = result.div(base).toFixed()
      state.list.push({'_id': asset['_id'], 'address': asset['address'], 'contract': asset['contract'], 'decimals': asset['decimals'], 'name': asset['name'], 'balance': asset.balance})
    })
  }
}
