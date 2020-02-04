var inquirer = require('inquirer');
var Web3 = require('web3');
var fs = require('fs');
const prompts = require('prompts');
var figlet = require('figlet');
const chalk = require('chalk');
var path = require('path');
const {exec} = require('child_process');
const {execSync} = require('child_process');
const Folder = './';
var publicIp = require("public-ip");
var hex2ascii= require("hex2ascii")
var express = require('express');
require('events').EventEmitter.prototype._maxListeners = 100;

var now = new Date();
var date = "";
var requestAssignedFlag = 0;
var validationAssignedFlag = 0;
//position 38 or 37
var validationCounter = 0;
var taskCounter = 0;
var NetworkID = 3;
var serverPort = 5000;
var ClientPort = 5000;
var ip         = undefined;
var ip4        = undefined;
var ip6        = undefined;
var mode       = undefined;
var requestAddr= undefined;
var filePath = undefined;
var requestIP = undefined;
var buffer = [];
var webpageUp = 0;
var executing = false;
var finished  = false;
var canRate = false;

///////////////////////////////////////////////////////////////////Get IP///////////////////////////////////////////////////////////////////////////////////

fs.open('./stat.txt', 'w', function(err){
    if (err) throw err;
})

fs.open('./log.txt', 'w', function(err){
    if (err) throw err;
})

var getIp = (async() => {
    await publicIp.v4().then(val => {ip4 = val});
    await publicIp.v6().then(val => {ip6 = val});
})
  
  //this calls the IP generating file and then depending on the option that is given it will create the server
  //since the IP is necessary for the creation of the socket.io server all the server section resides in this .then call
getIp().then(() => {
    //allow for manual choice (defaults to IPv4)
    if(process.argv[2] !== undefined && process.argv[2] === "-def" && process.argv[3] !== undefined ){
        ip = process.argv[3] + ":" + serverPort;
    }
    else if(process.argv[2] !== undefined && process.argv[2] === "-4"){
      ip = ip4 + ":" + serverPort;
    }
    else if(process.argv[2] !== undefined && process.argv[2] === "-6"){
      ip = "[" + ip6 + "]:" + serverPort;console.log(chalk.cyan("Thank you for using iChain worker CLI! The Peer to Peer Blockchain Machine \nLearning Application. Select 'start providing' to get started or 'help' \nto get more information about the application.\n"))

    }
    else{
      ip = ip4 + ":5000";
    }
    //console.log(ip);
});

var UTCFileArray = [];
var UTCfile;
var userAddress;
var userAddresses = [];

//Ethereum subscribe variables
var RequestStartTime = 0

fs.readdir(Folder, (err, files) => {
    files.forEach(file => {
        if(file[0] === 'U' && file[1] === 'T' && file[2] === 'C')
        {
            UTCFileArray.push(file);
            userAddresses.push("0x" + file.slice(37, file.length));
        }
    })

})


var ws = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/aa544d081b53485fb0fa8df2c9a8437e')
web3 = new Web3(ws);
var TaskContract = require('../../bcai_deploy/client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[NetworkID].address;       //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);

//test user account addr : 0x458C5617e4f549578E181F12dA8f840889E3C0A8 and password : localtest
var prov = 0;
var decryptedAccount = "";

questions = {
    type : 'list',
    name : 'whatToDo',
    message: 'What would you like to do?',
    choices : ['start request', 'show pools', 'create new address','show addresses',  'help','quit'],
};

questions1 = {
    type : 'list',
    name : 'whatToDo1',
    message : 'What would you like to do?',
    choices : ['stop request', 'update request', 'show pools', 'quit'],
};

clearStat();
clearLog();
fs.appendFile('./log.txt', String(Date(Date.now())), function(err){
    if(err) throw err;
})
console.log(chalk.cyan(" _  ____ _           _       \n(_)/ ___| |__   __ _(_)_ __  \n| | |   | '_ \\ / _` | | '_ \\ \n| | |___| | | | (_| | | | | |\n|_|\\____|_| |_|\\__,_|_|_| |_|\n\n"))
console.log(chalk.cyan("Thank you for using iChain user CLI! The Peer to Peer Blockchain Machine \nLearning Application. Select 'start request' to get started or 'help' \nto get more information about the application.\n"))


process.on('SIGINT', async () => {
    try{
        console.log("\n");
        const response = await prompts({
        type: 'text',
        name: 'val',
        message: 'You must choose the "quit" option before exiting appliation. Type "quit" here if you would like to quit or "back" to go to main menu...\n'
        });
        if(response.val.toLowerCase() == "quit")
        {
            if(prov == 1)
            {
                stopTask(questions.choices[5]);
            }
            else
            {
                process.exit(-1);
            }
        }
        if(response.val.toLowerCase() == "back"){
            askUser();
        }
    }
    catch(err){
        console.log("\n", chalk.red("Error: you didn't choose 'quit' or 'back' so we are quitting the application for you..."), "\n");
        if(prov == 1)
        {
            stopTask(questions.choices[5]);
        }
        else
        {
            process.exit(-1);
        }
    }
});


cliOrSite();

function cliOrSite(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'interface',
            choices: ['Continue with CLI', 'Open Site'],
            message: 'Choose an interface'
        }
    ])
    .then (answers => {
        if(answers.interface == 'Continue with CLI'){
            console.log("\n\n");
            askUser();
        }
        else{
            listenWebsite();
        }
    })
}


//////////////////////////////////////////////////////CLI FUNCTIONS//////////////////////////////////////////////////////////////////

//Asks for reputation rating

function validateRating(rating){
    return rating >= 1 && rating <= 100;
}

function giveRating(){
    canRate = false;
    inquirer.prompt([
        {
            type: 'list',
            name: 'askToRate',
            choices: ['Yes', 'No'],
            message: 'Would you like to give a rating for your provider?'
        }
    ])
    .then (answers =>{
        if(answers.askToRate == 'Yes'){
            console.log("\nYou have chosen to give a rating\n");
            //finalize request function

            inquirer.prompt([
                {
                    type: 'number',
                    name: 'rating',
                    message: 'Give a rating between 1 and 100',
                    validate: validateRating 
                }
            ])
            .then(answers =>{
                var ABIfinalizeRequest; //prepare abi for a function call
                ABIfinalizeRequest = myContract.methods.finalizeRequest(userAddress, answers.rating).encodeABI();
                const rawTransaction = {
                    "from": userAddress,
                    "to": addr,
                    "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                    "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                    "gas": 5000000,
                    "chainId": 3,
                    "data": ABIfinalizeRequest
                }

                decryptedAccount.signTransaction(rawTransaction)
                .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                .then(receipt => {
                    //console.log(chalk.cyan("\n\nTransaction receipt: "), receipt)
                    console.log(chalk.cyan("\n\nYour rating has gone through...\n"))
                })
                .then(()=>{
                    askUser();
                })
            })
        }
        else{
            console.log("\nUser doesn't want to give rating\n");
            //go back to main menu
            askUser();
        }
    })
}