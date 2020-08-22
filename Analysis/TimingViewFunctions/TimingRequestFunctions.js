const fs = require('fs');
const chalk = require('chalk');
var Web3 = require('web3');

const Stopwatch = require('statman-stopwatch');
const stopwatch = new Stopwatch();

var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var TaskContract = require('../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);

stopwatch.start();
myContract.methods.getProviderPool().call().then(function(provPool){
        console.log("This is working\n");
		saveTime('./getProviderPool.txt')
}).then(function(){
    stopwatch.start();
    myContract.methods.getPendingPool().call().then(function(reqPool){
        saveTime('./getPendingPool.txt')
    }).then(function(){
        stopwatch.start();
        myContract.methods.getProvidingPool().call().then(function(providingPool){
            saveTime('./getProvidingPool.txt')
        }).then(function(){
            stopwatch.start();
            myContract.methods.getValidatingPool().call().then(function(valiPool){
                saveTime('./getValidatingPool.txt')
                process.exit();
            })
        })
    })
}).catch(function(err){
    console.log("There was an error");
    process.exit();
})

function saveTime(file){
    fs.appendFileSync(file, String((stopwatch.read()).toFixed(2)) + "\n");
    stopwatch.stop();
    stopwatch.reset();
}
