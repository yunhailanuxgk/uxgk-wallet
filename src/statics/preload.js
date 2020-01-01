const { ipcRenderer: ipc, remote } = require('electron')

window.web3 = remote.getGlobal('web3')
window.db = remote.getGlobal('db')
window._ = remote.getGlobal('_')
window.ipc = ipc
window.ercContract = remote.getGlobal('ercContract')

ipc.send('backendAction_setWindowId')
