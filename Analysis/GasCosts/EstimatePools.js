var Web3 = require('web3');
var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
const fs = require('fs');
var TaskContract = require('../../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);
var account = "0xcc90abef8180d0ab5974dd0f1247623bc246eef8";
var keystore = fs.readFileSync('UTC--2019-11-14T19-01-00.097528603Z--9c3c06e9719c60466c99de918acd346b7e0217e6', 'utf8');
var password = "localtest";
var chalk = require('chalk');

fs.open('./GasCosts.txt', 'w', function(err) {
    if(err) throw err;
})

console.log("Beginning gas estimate data collection...");
fs.appendFileSync('./GasCosts.txt', 'Gas Costs For Smart Contract Methods\n');

//////////////////////////////////Start providing section////////////////////////////////////////////////////

var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
var userAddress = '0x458c5617e4f549578e181f12da8f840889e3c0a8';
decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
ABIstartProviding = myContract.methods.startProviding().encodeABI();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    myContract.methods.startProviding().estimateGas({from: account})
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
    myContract.methods.startRequest(web3.utils.asciiToHex('216.3.128.12')).estimateGas({from: account, value: '10000000000000000'})
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
    myContract.methods.updateRequest(web3.utils.asciiToHex('216.3.128.12')).estimateGas({from: account})
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'updateRequest - ' + gas + "\n");
    })
})
.then(() => {
    myContract.methods.chooseProvider(userAddress).estimateGas({from: account}) //should be lower gas cost on this one
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'chooseProvider (fail to add) - ' + gas + "\n");
        process.exit();
    })
})
.catch(err => {
    throw err;
})