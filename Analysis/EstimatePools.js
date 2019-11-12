var Web3 = require('web3');
var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
const fs = require('fs');
var TaskContract = require('../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);
var account = "0xcc90abef8180d0ab5974dd0f1247623bc246eef8";

fs.open('./GasCosts.txt', 'w', function(err) {
    if(err) throw err;
})

console.log("Begining gas estimate data collection...");
fs.appendFileSync('./GasCosts.txt', 'Gas Costs For Smart Contract Methods\n');

myContract.methods.getProviderPool().estimateGas({from: account})
.then(gas => {
    fs.appendFileSync('./GasCosts.txt', 'getProviderPool - ' + gas + "\n");
})
.then(() => {
    myContract.methods.getPendingPool().estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'getPendingPool - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.getValidatingPool().estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'getValidatingPool - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.getProviderPool().estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'getProvidingPool - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.startProviding(100, 100, 1000).estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'startProviding - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.stopProviding().estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'stopProviding - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.updateProvider(100, 100, 1000).estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'updateProvider - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.startRequest(100, 100, 1000, web3.utils.asciiToHex('216.3.128.12')).estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'startRequest - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.stopRequest().estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'stopRequest - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.updateRequest(100, 100, 1000, web3.utils.asciiToHex('216.3.128.12')).estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'updateRequest - ' + gas + "\n");
        process.exit();
    })
})
.catch(err => {
    throw err;
})