var Web3 = require('web3');
var TaskContract = require('../../../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[NetworkID].address;        //align to const ID defination on top
const myContract = new Web3.eth.Contract(abi, addr);
var account = "0xcc90abef8180d0ab5974dd0f1247623bc246eef8";
var gas;

fs.open('./GasCosts.txt', 'w', function(err) {
    if(err) throw err;
})

console.log("Begining gas estimate data collection...");

gas = myContract.methods.getProviderPool.estimateGas({from: account});
recordGas("GetProviderPool - ");

gas = myContract.methods.getPendingPool.estimateGas({from: account});
recordGas("GetPendingPool - ");

gas = myContract.methods.getValidatingPool.estimateGas({from: account});
recordGas("GetValidatingPool - ");

gas = myContract.methods.getProvidingPool.estimateGas({from: account});
recordGas("GetProvidingPool - ");


console.log("Data collection complete");


function recordGas(message){
    fs.appendFile('./stats.txt', message + gas + "\n", (err) => {
        if (err) throw err;
    });
}