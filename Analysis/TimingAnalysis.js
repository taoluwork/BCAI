
const fs = require('fs');
const chalk = require('chalk');
var Web3 = require('web3');
var keystore = fs.readFileSync('UTC--2019-09-16T20-22-39.327891999Z--458c5617e4f549578e181f12da8f840889e3c0a8', 'utf8');
var password = 'localtest';
var ABIstartProviding;
var ABIupdateProvider;
var ABIstopProviding;
const Stopwatch = require('statman-stopwatch');
const stopwatch = new Stopwatch();


fs.open('./stats.txt', 'w', function(err) {
    if(err) throw err;
})

var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var TaskContract = require('../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);
var userAddress = '0x458c5617e4f549578e181f12da8f840889e3c0a8';
decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
ABIstartProviding = myContract.methods.startProviding(100, 100, 1000).encodeABI();
//console.log(chalk.cyan(ABIstartProviding);
var rawTransaction = {
    "from": userAddress,
    "to": addr,
    "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
    "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
    "gas": 5000000,
    "chainId": 3,
    "data": ABIstartProviding
}

stopwatch.start();


console.log(chalk.green("STARTPROVIDING"));
decryptedAccount.signTransaction(rawTransaction)
.then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
.then(receipt => {
    console.log(chalk.cyan("\n\nStart providing was successful... \n\n"));
})
.then(() =>{
    try{
        web3.eth.subscribe('newBlockHeaders', (err, result) => {
            if(err) console.log(chalk.cyan("ERRRR", err, result));
            //console.log(chalk.cyan("================================================   <- updated! #", result.number);
            //console.log(chalk.cyan(result);
            //showPools();
            //checkEvents();
        })
    }
    catch(error){
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.log("\n", chalk.red(err), "\n");
    }
    saveTime("Start Providing - ");
})
.then(()=>{
    ABIupdateProvider = myContract.methods.updateProvider(200, 200, 2000).encodeABI();
    rawTransaction = {
        "from": userAddress,
        "to": addr,
        "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
        "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
        "gas": 5000000,
        "chainId": 3,
        "data": ABIupdateProvider
    }
    console.log(chalk.green("UPDATEPROVIDING"));
    stopwatch.start();
    decryptedAccount.signTransaction(rawTransaction)
    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    .then(receipt => {
        console.log(chalk.cyan("\n\nupdate providing was successful... \n\n"));
    })
    .then(() =>{
        try{
            web3.eth.subscribe('newBlockHeaders', (err, result) => {
                if(err) console.log(chalk.cyan("ERRRR", err, result));
                //console.log(chalk.cyan("================================================   <- updated! #", result.number);
                //console.log(chalk.cyan(result);
                //showPools();
                //checkEvents();
            })
        }
        catch(error){
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.log("\n", chalk.red(err), "\n");
        }
        saveTime("Update Providing - ");
    })
    .then(()=>{

        ABIstopProviding = myContract.methods.stopProviding().encodeABI();
        const rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 7000000,
            "chainId": 3,
            "data": ABIstopProviding
        }
        console.log(chalk.green("STOPPROVIDING"));
        stopwatch.start();
        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            //console.log(chalk.cyan("\n\nTransaction receipt: "))
            //console.log(receipt)
            console.log(chalk.cyan("\n\nstopped providing successful...\n"))
        })
        .then(()=>{
            saveTime("Stop Providing - ");
            process.exit();
        })
    })
})
.catch(err=>{
    console.log("\nThere was an err: \n", err);
})
//console.log("Starting timing analysis of loop with 10000 iterations");

// for(j = 0; j < 100; j++) {
//     for(i = 0; i < 10000; i++){
//         sum += 2;
//     }
//     sum = 0;
//     saveTime();
//     console.log("Value saved");
// }



function saveTime(message){
    var precision = 3; // 3 decimal places
    //var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    fs.appendFileSync('./stats.txt', message + String((stopwatch.read()/1000).toFixed(2)) + " s\n");
    stopwatch.stop();
    stopwatch.reset();
}