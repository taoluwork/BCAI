var Web3 = require('web3');
var fs = require('fs');
var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var NetworkID = 3;
var TaskContract = require('../../bcai_deploy/client/src/contracts/bcaiReputation.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[NetworkID].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);


var UTCfile = 'UTC--2019-09-16T20-22-39.327891999Z--458c5617e4f549578e181f12da8f840889e3c0a8';
var contents = fs.readFileSync(UTCfile, 'utf8')
var keystore = contents;
var password = 'localtest';
decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
var ratingAddress = '0x458c5617e4f549578e181f12da8f840889e3c0a8';

var ABIaddRating = myContract.methods.addRating(ratingAddress, 80).encodeABI();

const rawTransaction = {
    "from": ratingAddress,
    "to": addr,
    "value": 0,
    "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
    "gas": 5000000,
    "chainId": 3,
    "data": ABIaddRating
}

decryptedAccount.signTransaction(rawTransaction)
.then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
.then(receipt => {
    console.log('Rating added\n');
    return myContract.methods.getAvgRating(ratingAddress).call().then(function(rating){
        console.log('Users average rating is ' + rating + '\n');
    })
})
