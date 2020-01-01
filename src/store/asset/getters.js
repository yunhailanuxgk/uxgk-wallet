export const getByAddress = state => address => {
  return state.list.filter(asset => asset.address === address)
}

export const getByAddressAndContract = state => (contract, address) => {
  return state.list.find(asset => asset.address === address && asset.contract === contract)
}
