// this is an example of using Infura.io to send transactions


var NetworkID = 3;      //using infura

// create web3 instance
var Web3 = require('web3');
//use websocket provider here, NOTE: http is deprecated.
if (NetworkID == 512)
    var web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
else if (NetworkID == 3){
    var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/abf67fa0cd9644cbaf3630dd5395104f')
    web3 = new Web3(ws);
}


// import contract abi
//get contract instance
var TaskContract = require('../../../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[NetworkID].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);

setupLocalAccount();        // call the main function



// NOTE: to create a local account
// navigate to the proper folder, use $ geth --datadir ./ account new
// note down your account address and remember your password

// handle local account: handle keystore file + password from console
function setupLocalAccount(){
    var keystore;
    // [option 1] save keystore here
    //keystore = {"address":"458c5617e4f549578e181f12da8f840889e3c0a8","crypto":{"cipher":"aes-128-ctr","ciphertext":"f3a3127774c6bcbb668d2a8befa204e28e04b4d44ed9ab09365f82f9d024f5c6","cipherparams":{"iv":"7ea08dab99d23800ce0a90fcaee96008"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"94a295f708a5e18b36ded72492c6c6fdf6c244629f98160c62b51f753bac4e23"},"mac":"53bd50a2148e446d9ca09837aa9fbb9ea21dcdf0cc5fffe4637964ae8cfe03ed"},"id":"a7dc70e7-f625-420f-afdf-9c8208c6735b","version":3}
    
    // [option 2]
    //read keystore from fs:
    var fs = require('fs')
    filename = "UTC--2019-09-16T20-22-39.327891999Z--458c5617e4f549578e181f12da8f840889e3c0a8"
    var contents = fs.readFileSync(filename, 'utf8')
    //console.log(contents)
    keystore = contents;
    
    var password;
    // [option 1] use static password here
    //const password = "localtest";     //save password explicitly is stupid
    
    // [option 2]
    //get from user input

    //using inquirer is more fancy  https://www.npmjs.com/package/inquirer
    /*(inquirer.prompt([
        "type": "password",

    ]).then( ans=>{
        password = ans;
    })*/

    //using simple readline: https://www.npmjs.com/package/inquirer
    /*var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.question("Please input your password:", (ans)=>{
        console.log(`Thank you for your valuable feedback: ${ans}`);
        password = ans;
        rl.close();
    })*/
    

    //using process input from command line
    /*var input = process.stdin;
    input.setEncoding('utf-8')
    console.log("Please input password")
    return input.on('data', inp=>{
        password = inp;
    })*/

    //using readline sync (not async which will not block)
    var readlineSync = require('readline-sync')
    password = readlineSync.question("Please input your password:", {
        hideEchoBack: true      //hide with *
    })
    //console.log("Verify input: " + password);

    //decrypt account and call
    const decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
    sendRopsten(decryptedAccount);
}


function sendRopsten(decryptedAccount){
    console.log("Sending transaction to Roptsen via Infura")
    //get function abi
    var ABIstartProviding; //prepare abi for a function call
    /*  //reading from raw ABI
    for (var i = 0; i<abi.length; i++){
        if (abi[i]["name"] == "startProviding")
            ABIstartProviding = abi[i];
    }
    */

    var maxTime = 100;
    var maxTarget = 90;
    var minPrice = 10000;
    ABIstartProviding = myContract.methods.startProviding(maxTime, maxTarget, minPrice).encodeABI();
    //console.log(ABIstartProviding);
    const rawTransaction = {
        "from": "0x458C5617e4f549578E181F12dA8f840889E3C0A8",
        "to": addr,
        "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
        "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
        "gas": 5000000,
        "chainId": 3,
        "data": ABIstartProviding
    }

    decryptedAccount.signTransaction(rawTransaction)
    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
    .then(receipt => console.log("Transaction receipt: ", receipt))
    .catch(err => console.error(err));
    // Or sign using private key from decrypted keystore file
    /*
    web3.eth.accounts.signTransaction(rawTransaction, decryptedAccount.privateKey)
    .then(console.log);
    */
}