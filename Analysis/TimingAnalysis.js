
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
    "nonce" : web3.eth.getTransactionCount(userAddress),
    "data": ABIstartProviding
}

stopwatch.start();

console.log(chalk.green("STARTPROVIDING"));
decryptedAccount.signTransaction(rawTransaction)
.then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction)) // Start Providing
.then(receipt => {
    console.log(chalk.cyan("\n\nStart providing was successful... \n\n"));
})
.then(() =>{
    try{
        web3.eth.subscribe('newBlockHeaders', (err, result) => {
            if(err) console.log(chalk.cyan("ERRRR", err, result));
        })
    }
    catch(error){
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.log("\n", chalk.red(err), "\n");
    }
    saveTime('./StartProviding.txt');
})
.then(()=>{ //Update Provider
    ABIupdateProvider = myContract.methods.updateProvider(200, 200, 2000).encodeABI();
    rawTransaction = {
        "from": userAddress,
        "to": addr,
        "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
        "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
        "gas": 5000000,
        "chainId": 3,
        "nonce" : web3.eth.getTransactionCount(userAddress),
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
            })
        }
        catch(error){
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`
            );
            console.log("\n", chalk.red(err), "\n");
        }
        saveTime('./UpdateProviding.txt');
    })
    .then(()=>{ //Stop Providing
        ABIstopProviding = myContract.methods.stopProviding().encodeABI();
        rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 7000000,
            "chainId": 3,
            "nonce" : web3.eth.getTransactionCount(userAddress),
            "data": ABIstopProviding
        }
        console.log(chalk.green("STOPPROVIDING"));
        stopwatch.start();
        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nstopped providing successful...\n"))
        })
        .then(() =>{
            try{
                web3.eth.subscribe('newBlockHeaders', (err, result) => {
                    if(err) console.log(chalk.cyan("ERRRR", err, result));
                })
            }
            catch(error){
                alert(
                    `Failed to load web3, accounts, or contract. Check console for details.`
                );
                console.log("\n", chalk.red(err), "\n");
            }
            saveTime('./StopProviding.txt');
        })
        .then(()=>{ //Start Task
            ABIstartRequest = myContract.methods.startRequest(100, 100, 1000, web3.utils.asciiToHex('216.3.128.12')).encodeABI();
            rawTransaction = {
                "from": userAddress,
                "to": addr,
                "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                "gas": 5000000,
                "chainId": 3,
                "nonce" : web3.eth.getTransactionCount(userAddress),
                "data": ABIstartRequest
            }
            console.log(chalk.green("STARTREQUEST"));
            stopwatch.start();
            decryptedAccount.signTransaction(rawTransaction)
            .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
            .then(receipt => {
                console.log(chalk.cyan("\n\nstart request successful...\n"))
            })
            .then(() =>{
                try{
                    web3.eth.subscribe('newBlockHeaders', (err, result) => {
                        if(err) console.log(chalk.cyan("ERRRR", err, result));
                    })
                }
                catch(error){
                    alert(
                        `Failed to load web3, accounts, or contract. Check console for details.`
                    );
                    console.log("\n", chalk.red(err), "\n");
                }
                saveTime('./StartRequest.txt');
            })
            .then(()=>{ //Update Task
                ABIupdateRequest = myContract.methods.updateRequest(100, 100, 1000, web3.utils.asciiToHex('216.3.128.12')).encodeABI();
                rawTransaction = {
                    "from": userAddress,
                    "to": addr,
                    "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                    "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                    "gas": 5000000,
                    "nonce" : web3.eth.getTransactionCount(userAddress),
                    "chainId": 3,
                    "data": ABIupdateRequest
                }
                console.log(chalk.green("UPDATEREQUEST"));
                stopwatch.start();
                decryptedAccount.signTransaction(rawTransaction)
                .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                .then(receipt => {
                    console.log(chalk.cyan("\n\nupdate request successful...\n"))
                })
                .then(() =>{
                    try{
                        web3.eth.subscribe('newBlockHeaders', (err, result) => {
                            if(err) console.log(chalk.cyan("ERRRR", err, result));
                        })
                    }
                    catch(error){
                        alert(
                            `Failed to load web3, accounts, or contract. Check console for details.`
                        );
                        console.log("\n", chalk.red(err), "\n");
                    }
                    saveTime('./UpdateRequest.txt');
                })
                .then(()=>{ //Start Task
                    ABIstopRequest = myContract.methods.stopRequest().encodeABI();
                    rawTransaction = {
                        "from": userAddress,
                        "to": addr,
                        "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                        "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                        "gas": 5000000,
                        "chainId": 3,
                        "nonce" : web3.eth.getTransactionCount(userAddress),
                        "data": ABIstopRequest
                    }
                    console.log(chalk.green("STOPREQUEST"));
                    stopwatch.start();
                    decryptedAccount.signTransaction(rawTransaction)
                    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                    .then(receipt => {
                        console.log(chalk.cyan("\n\nstop request successful...\n"))
                    })
                    .then(() =>{
                        try{
                            web3.eth.subscribe('newBlockHeaders', (err, result) => {
                                if(err) console.log(chalk.cyan("ERRRR", err, result));
                            })
                        }
                        catch(error){
                            alert(
                                `Failed to load web3, accounts, or contract. Check console for details.`
                            );
                            console.log("\n", chalk.red(err), "\n");
                        }
                        saveTime('./StopRequest.txt');
                        process.exit();
                    })
                })
            })
        })
    })
})
.catch(err=>{
    console.log("\nThere was an err: \n", err);
    process.exit();
})

function saveTime(file){
    fs.appendFileSync(file, String((stopwatch.read()/1000).toFixed(2)) + "\n");
    stopwatch.stop();
    stopwatch.reset();
}
