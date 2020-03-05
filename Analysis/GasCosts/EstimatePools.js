var Web3 = require('web3');
var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
const fs = require('fs');
var TaskContract = require('../../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);
var account = "0xcc90abef8180d0ab5974dd0f1247623bc246eef8";
var keystore = fs.readFileSync('UTC--2019-09-16T20-22-39.327891999Z--458c5617e4f549578e181f12da8f840889e3c0a8', 'utf8');
var password = "localtest";
var chalk = require('chalk');

fs.open('./GasCosts.txt', 'w', function(err) {
    if(err) throw err;
})

console.log("Begining gas estimate data collection...");
fs.appendFileSync('./GasCosts.txt', 'Gas Costs For Smart Contract Methods\n');

//////////////////////////////////Start providing section////////////////////////////////////////////////////

var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var abi = TaskContract.abi;
var addr = TaskContract.networks[3].address;        //align to const ID defination on top
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
    })
})
.then(() => {
    myContract.methods.chooseProvider(userAddress).estimateGas({from: account}) //should be lower gas cost on this one
    .then(gas => {
        fs.appendFileSync('./GasCosts.txt', 'chooseProvider (fail to add) - ' + gas + "\n");
    })
})
.then(() => {//Start actually providing so we can test chooseProvider gas costs if provider chosen is valid
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
    })
    .then(() => {
        myContract.methods.chooseProvider(userAddress).estimateGas({from: account}) //should be higher gas cost on this one
        .then(gas => {
            fs.appendFileSync('./GasCosts.txt', 'chooseProvider (successful add) - ' + gas + "\n");
        })
    })
    .then(() => {
        ABIstopProviding = myContract.methods.stopProviding().encodeABI(); //stop providing
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
            })
    })
})
.catch(err => {
    throw err;
})