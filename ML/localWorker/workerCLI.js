
var inquirer = require('inquirer');
var Web3 = require('web3');
var fs = require('fs');
const prompts = require('prompts');
const chalk = require('chalk');
var path = require('path');
const {exec} = require('child_process');
const {execSync} = require('child_process');
const Folder = './';
var publicIp = require("public-ip");
const hex2ascii = require("hex2ascii");
const express = require('express');

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
var requestIP= undefined;
var executing = false;






///////////////////////////////////////////////////////////////////Get IP///////////////////////////////////////////////////////////////////////////////////
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
      ip = "[" + ip6 + "]:" + serverPort;
    }
    else{
      ip = ip4 + ":5000";
    }
    //console.log(chalk.cyan(ip);
});

///////////////////////////////////////////////////////////////////server///////////////////////////////////////////////////////////////////////////////////

//execute the python code 
//this is a helper function for request and a call back for writeFile
//this should only be called by write file
function execute(){

    if(!executing) {
        executing = true;
        exec('python3 execute.py ' + mode + ' ' + requestIP + ' none ' + ip4, (err,stdout,stderr)=>{
            if(err){
                console.log(err);
                return;
            }
            console.log(stdout);
            executing = false;
            if(mode === 0 ){
                completeRequest(requestAddr, web3.utils.asciiToHex(ip));
            }
            if(mode === 1 ){
                submitValidation(requestAddr, true);
            }
        });
    }
}

function offer(){
    
    if(!executing) {
        executing = true;
        exec('python3 execute.py ' + mode + ' ' + requestIP + ' none ' + ip4, (err,stdout,stderr)=>{
            if(err){
                console.log(err);
                return;
            }
            console.log(stdout);
            executing = false;
            if(mode === 0 ){
                completeRequest(requestAddr, web3.utils.asciiToHex(ip));
            }
            if(mode === 1 ){
                submitValidation(requestAddr, true);
            }
        });
    }
}


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
var addr = TaskContract.networks[NetworkID].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);

//test user account addr : 0x458C5617e4f549578E181F12dA8f840889E3C0A8 and password : localtest
var prov = 0;
var webpageUp = 0;
var decryptedAccount = "";
var unlockedAccount = ["", "willbeoverwritten"];


questions = {
    type : 'list',
    name : 'whatToDo',
    message: 'What would you like to do?',
    choices : ['start providing', 'show pools', 'help', 'quit'],
};

questions1 = {
    type : 'list',
    name : 'whatToDo1',
    message : 'What would you like to do?',
    choices : ['stop providing', 'update provider', 'show pools', 'quit'],
};


console.log(chalk.cyan(" _  ____ _           _       \n(_)/ ___| |__   __ _(_)_ __  \n| | |   | '_ \\ / _` | | '_ \\ \n| | |___| | | | (_| | | | | |\n|_|\\____|_| |_|\\__,_|_|_| |_|\n\n"))
console.log(chalk.cyan("Thank you for using iChain worker CLI! The Peer to Peer Blockchain Machine \nLearning Application. Select 'start providing' to get started or 'help' \nto get more information about the application.\n"))


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
                if(webpageUp == 1){
                    console.log(chalk.red("\nYou must stop providing before you exit the console...\n"))
                    stopProviding(questions.choices[3]);

                }
                else{
                    stopProviding(questions.choices[3]);
                }
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
            stopProviding(questions.choices[5]);
        }
        else
        {
            process.exit(-1);
        }
    }
});



//askUser();

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
            webpageUp = 1;
            listenWebsite();
        }
    })
}
//Gives the user a starting menu of choices
function askUser(){
    if(prov == 0)
        inquirer.prompt([questions]).then(answers => {choiceMade(answers.whatToDo)});
    else
        inquirer.prompt([questions1]).then(answers => {choiceMade(answers.whatToDo1)});
}




//Takes choice made by prompt and controls where to go
function choiceMade(choice){

    if(prov == 0 && choice == questions.choices[0])
    {
        startProviding();
    }
    else if(prov == 1 && choice == questions1.choices[0])
    {
        stopProviding();
    }
    else if(choice == questions1.choices[1])
    {
        updateProvider();
    }
    else if (choice == questions.choices[2])
    {
        console.log(chalk.cyan("\niChain is an application that allows users to send machine learning tasks to"))
        console.log(chalk.cyan("be executed by providers with higher computational power. You are currently in"))
        console.log(chalk.cyan("the provider role CLI. If you are ready to get started select 'start providing'"))
        console.log(chalk.cyan("and you will be prompted to enter your key-store password. If this is entered"))
        console.log(chalk.cyan("incorrectly there will be a password error and you will have to attempt again to"))
        console.log(chalk.cyan("start providing. You will then be prompted to enter 'max time', 'max target' and"))
        console.log(chalk.cyan("'min price'. Enter values you wish to provide with... these can be changed at a"))
        console.log(chalk.cyan("later time. After entering these values you will be added to the provider pool"))
        console.log(chalk.cyan("and given a transaction receipt. You are now providing and can change your"))
        console.log(chalk.cyan("provider settings by selecting 'update provider'. If you wish to stop providing"))
        console.log(chalk.cyan("then just select 'quit' and enter your keystore password and you will be dropped"))
        console.log(chalk.cyan("from the pools. You MUST quit before exiting the application so we can drop you"))
        console.log(chalk.cyan("from the pools. Lastly, the 'show pools' option will display the current status"))
        console.log(chalk.cyan("of all the pools. Thank you for using iChain. Happy mining!\n\n"))

        askUser();

    }
    else if (choice == questions.choices[1] || choice == questions1.choices[4])
    {
        showPools();
        checkEvents(true);
    }
    else
    {
        if(prov == 1)
        {
            stopProviding(choice);
        }
        else{
            process.exit(-1);
        }
    }
}




function startProviding(){

    console.log(chalk.cyan("\nPut your keystore file in the directory with the CLI ...\n\n"));
    if(userAddresses.length == 0)
    {
        console.log(chalk.red("Error: You have no keystore files in the directory of this CLI... to get started with an account put your keystore files in here..."), "\n")
        askUser();
    }
    else{
        inquirer.prompt([
            {
                type: 'list',
                name: 'userAddress',
                choices: userAddresses
            }
        ])
        .then(answers =>
            {
                for(i = 0; i<userAddresses.length; i++)
                {
                    if(answers.userAddress == userAddresses[i])
                    {
                        userAddress = userAddresses[i];
                        UTCfile = UTCFileArray[i];
                        break;
                    }
                }
                console.log(chalk.cyan("\nYou chose account: "+userAddress));
            }
        )
        .then( () => { 
        //Getting password from CLI
        if(unlockedAccount[1] != userAddress)
        {
            console.log("\n\n");
                inquirer.prompt([
                    {
                        type: 'password',
                        name: 'keystorePswd',
                        message: 'Enter your keystore file password: ',
                    },
                ])
                .then(answers => {return answers.keystorePswd})
                .then((password)=>{
                        //retrieving keystore file and decrypting with password
                        var keystore;
                        var contents = fs.readFileSync(UTCfile, 'utf8')
                        keystore = contents;
                        decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
                        unlockedAccount[0] = web3.eth.accounts.decrypt(keystore, password);
                        unlockedAccount[1] = userAddress;
                        return decryptedAccount;
                    }
                )
                .then((decryptedAccount) =>{
                    console.log("\n");
                    inquirer.prompt([
                        {
                            name : 'mTime',
                            message: 'Enter max time: ',
                        },
                        {
                            name : 'mTarget',
                            message: 'Enter max target: ',
                        },
                        {
                            name : 'mPrice',
                            message: 'Enter min price: ',
                        }
                    ])
                    .then(settings => {
                        return [settings.mTime, settings.mTarget, settings.mPrice];
                    })
                    .then(newSettings => {
                        console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
                        var ABIstartProviding; //prepare abi for a function call
                        var maxTime = newSettings[0];
                        var maxTarget = newSettings[1];
                        var minPrice = newSettings[2];
                        ABIstartProviding = myContract.methods.startProviding(maxTime, maxTarget, minPrice).encodeABI();
                        //console.log(chalk.cyan(ABIstartProviding);
                        const rawTransaction = {
                            "from": userAddress,
                            "to": addr,
                            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                            "gas": 5000000,
                            "chainId": 3,
                            "data": ABIstartProviding
                        }
                    
                        decryptedAccount.signTransaction(rawTransaction)
                        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                        .then(receipt => {
                            console.log(chalk.cyan("\n\nTransaction receipt: "));
                            console.log(receipt);
                            console.log(chalk.cyan("\n\nYou are now Providing... \n\n"));
                            prov = 1;
                        })
                        .then(() => {//Pedro put your code here for start providing
                            askUser();
                            //call subscribe here

                            try{
                                web3.eth.subscribe('newBlockHeaders', (err, result) => {
                                    if(err) console.log(chalk.cyan("ERRRR", err, result));
                                    //console.log(chalk.cyan("================================================   <- updated! #", result.number);
                                    //console.log(chalk.cyan(result);
                                    //showPools();
                                    //checkEvents();
                                    //checkEvents(false);
                                })
                            }
                            catch(error){
                                alert(
                                    `Failed to load web3, accounts, or contract. Check console for details.`
                                );
                                console.log("\n", chalk.red(err), "\n");
                            }


                        })
                        .catch(err => {
                            //console.log(String(err).slice(0, 41));
                            if(String(err).slice(0, 41) == "Error: Returned error: insufficient funds")
                            {
                                console.log(chalk.red("\nError: This keystore account doesn't have enough Ether... Add funds or try a different account...\n"))
                                askUser();
                            }
                            else{
                                console.log(chalk.red("\n", err, "\n"))
                                askUser();
                            }
                        });
                    })
                    .catch( err => {
                        console.log("\n", chalk.red(err), "\n");
                        askUser();
                    });
                        
                })
                .catch(err => {
                    if (String(err).slice(0, 28) == "Error: Key derivation failed")
                    {
                        console.log(chalk.red("\nError: You have entered the wrong keystore password... Please try again...\n"))
                        askUser();
                    }
                    else{
                        console.log("\n", chalk.red(err), "\n");
                        askUser();
                    }
                })
            }
            if(unlockedAccount[0] != "" && unlockedAccount[1] == userAddress)
            {
                console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
                console.log("\n");
                inquirer.prompt([
                    {
                        name : 'mTime',
                        message: 'Enter max time: ',
                    },
                    {
                        name : 'mTarget',
                        message: 'Enter max target: ',
                    },
                    {
                        name : 'mPrice',
                        message: 'Enter min price: ',
                    }
                ])
                .then(settings => {
                    return [settings.mTime, settings.mTarget, settings.mPrice];
                })
                .then(newSettings => {
                    console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
                    var ABIstartProviding; //prepare abi for a function call
                    var maxTime = newSettings[0];
                    var maxTarget = newSettings[1];
                    var minPrice = newSettings[2];
                    ABIstartProviding = myContract.methods.startProviding(maxTime, maxTarget, minPrice).encodeABI();
                    //console.log(chalk.cyan(ABIstartProviding);
                    const rawTransaction = {
                        "from": userAddress,
                        "to": addr,
                        "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                        "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                        "gas": 5000000,
                        "chainId": 3,
                        "data": ABIstartProviding
                    }
                
                    decryptedAccount.signTransaction(rawTransaction)
                    .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                    .then(receipt => {
                        console.log(chalk.cyan("\n\nTransaction receipt: "));
                        console.log(receipt)
                        console.log(chalk.cyan("\n\nYou are now Providing... \n\n"));
                        prov = 1;
                    })
                    .then(() => {
                        askUser()
                        
                        try{
                            web3.eth.subscribe('newBlockHeaders', (err, result) => {
                                if(err) console.log(chalk.cyan("ERRRR", err, result));
                                //console.log(chalk.cyan("================================================   <- updated! #", result.number);
                                //console.log(chalk.cyan(result);
                                //showPools();
                                //checkEvents(false);
                            })
                        }
                        catch(error){
                            alert(
                                `Failed to load web3, accounts, or contract. Check console for details.`
                            );
                            console.log(chalk.cyan(error));
                        }
                    
                    })
                    .catch(err => {
                        console.log(chalk.red("\nError: This keystore account doesn't have enough Ether... Add funds or try a different account...\n"))
                        askUser();
                    });
                })
                .catch( err => {
                    console.log("\n", chalk.red(err), "\n");
                    askUser();
                });
            
        }
    })
    }

}




function stopProviding(choice){
    if(choice == questions.choices[2] || choice == questions1.choices[3])
    {
        console.log(chalk.cyan("\nProvide keystore password to quit CLI... \n"));
    }
    else{
        console.log(chalk.cyan("\nProvide keystore password to stop providing... \n"));
    }
    inquirer.prompt([
        {
            type: 'password',
            name: 'keystorePswd',
            message: 'Enter your keystore file password: ',
        },
    ])
    .then(answers => {return answers.keystorePswd})
    .then((password)=>{
            //retrieving keystore file and decrypting with password
            var filename;
            for(i = 0; i<userAddresses.length; i++)
            {
                if(userAddress == userAddresses[i])
                {
                    filename = UTCFileArray[i];
                    break;
                }
            }
            var keystore;
            var contents = fs.readFileSync(filename, 'utf8')
            keystore = contents;
            const decryptedAccount = web3.eth.accounts.decrypt(keystore, password);
            return decryptedAccount
        }
    )
    .then((decryptedAccount) => {
        console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        var ABIstopProviding; //prepare abi for a function call
        ABIstopProviding = myContract.methods.stopProviding().encodeABI();
        const rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIstopProviding
        }

        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "))
            console.log(receipt)
            console.log(chalk.cyan("\n\nYou have now stopped providing...\n"))
            prov = 0;
        })
        .then(() => {

            if(choice == questions.choices[2] || choice == questions1.choices[3])
            {
                console.log(chalk.cyan("Now quitting CLI ...\n\n"));
                decryptedAccount.signTransaction(rawTransaction)
                process.exit(-1);
            }
            else
            {
                askUser();
            }
        })
        .catch(err => {
            console.log("\n", chalk.red("Error: "), chalk.red(err), "\n")
            askUser();
        });
    })
    .catch( err => {
        if (String(err).slice(0, 28) == "Error: Key derivation failed")
        {
            console.log(chalk.red("\nError: You have entered the wrong keystore password... Please try again...\n"))
            askUser();
        }
        else{
            console.log("\n", chalk.red(err), "\n");
            askUser();
        }
    });
}




function updateProvider(){
    console.log(chalk.cyan("\n"));
        inquirer.prompt([
            {
                name : 'mTime',
                message: 'Enter new max time: ',
            },
            {
                name : 'mTarget',
                message: 'Enter new max target: ',
            },
            {
                name : 'mPrice',
                message: 'Enter new min price: ',
            }
        ])
        .then(settings => {
            return [settings.mTime, settings.mTarget, settings.mPrice];
        })
        .then(newSettings => {
            console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
            var ABIupdateProvider; //prepare abi for a function call
            var maxTime = newSettings[0];
            var maxTarget = newSettings[1];
            var minPrice = newSettings[2];
            ABIupdateProvider = myContract.methods.updateProvider(maxTime, maxTarget, minPrice).encodeABI();
            //console.log(chalk.cyan(ABIstartProviding);
            const rawTransaction = {
                "from": userAddress,
                "to": addr,
                "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
                "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
                "gas": 5000000,
                "chainId": 3,
                "data": ABIupdateProvider
            }
    
            decryptedAccount.signTransaction(rawTransaction)
            .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
            .then(receipt => {
                console.log(chalk.cyan("\n\nTransaction receipt: "))
                console.log(receipt)
                console.log(chalk.cyan("\n\nYou have updated provider settings to: max time = " + maxTime.toString() +
                    ", max target = " + maxTarget.toString() + ", and min price = " + minPrice.toString() + "...\n\n"));
            })
            .then(() => {askUser()})
            .catch(err => {
                console.log("\n", chalk.red(err), "\n");
                askUser();
            });
        })
        .catch( err => {
            console.log("\n", chalk.red(err), "\n");
            askUser();
        });
}

function completeRequest(reqAddress, resultId){
    taskCounter+=1;
    console.log(chalk.cyan("Completed task. You now have completed "+taskCounter+" tasks and "+validationCounter+" validations... \n"));
    console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        var ABIcompleteRequest; //prepare abi for a function call
        ABIcompleteRequest = myContract.methods.completeRequest(reqAddress, resultId).encodeABI();
        const rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIcompleteRequest
        }

        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "))
            console.log(receipt)
        })
        .then(() => {
            askUser();
        })
        .catch(err => {
            console.log("\n", chalk.red(err), "\n");
            askUser();
        });
}

function submitValidation(reqAddress, result){
    validationCounter+=1;
    console.log(chalk.cyan("Completed task. You now have completed "+taskCounter+" tasks and "+validationCounter+" validations... \n"));
    console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        var ABIsubmitValidation; //prepare abi for a function call
        ABIsubmitValidation = myContract.methods.submitValidation(reqAddress, result).encodeABI();
        const rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIsubmitValidation
        }

        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "))
            console.log(receipt)
        })
        .then(() => {
            askUser();
        })
        .catch(err => {
            console.log("\n", chalk.red(err), "\n");
            askUser();
        });
    
}




function showPools(){
    //Lists pool all pools
    return myContract.methods.getProviderPool().call().then(function(provPool){
		console.log("\n\n=======================================================");
		console.log("Active provider pool: Total = ", provPool.length);
		console.log(provPool);
		return provPool;
	}).then(function(){
		return myContract.methods.getPendingPool().call().then(function(reqPool){
			console.log("=======================================================")
			console.log("Pending pool:  Total = ", reqPool.length);
			console.log(reqPool);
			return reqPool;
		})
	}).then(function(){
		return myContract.methods.getProvidingPool().call().then(function(providingPool){
			console.log("=======================================================")
			console.log("Providing pool:  Total = ", providingPool.length);
			console.log(providingPool);
			return providingPool;
		})
	}).then(function(){
		return myContract.methods.getValidatingPool().call().then(function(valiPool){
			console.log("=======================================================")
			console.log("Validating pool:  Total = ", valiPool.length);
			console.log(valiPool + "\n\n");
			return valiPool;
            })
            .then(() => askUser())
	}).catch(function(err){
		console.log("\n", chalk.red("Error: show pool error! "), "\n", chalk.red(err), "\n");
    })
    

}

checkEvents = async (showLogs) => {
    let pastEvents = await myContract.getPastEvents("allEvents", {fromBlock:  RequestStartTime, toBlock: 'latest'});
    //if (showLogs) console.log("Event range: ", RequestStartTime)
    //if (showLogs) console.log("All events:", pastEvents)
    

    for(var i = 0 ; i < pastEvents.length; i++){
      if((hex2ascii(pastEvents[i].returnValues.info) === "Validator Signed" && userAddress === pastEvents[i].returnValues.provAddr) || 
        (hex2ascii(pastEvents[i].returnValues.info) === "Validation Complete" && userAddress === pastEvents[i].returnValues.provAddr) ){
        pastEvents.splice(0,i+1);

       //if (showLogs) console.log("Validator signed/validation complete");
      }
    }

    // For pairing info events
    for (var i = 0; i < pastEvents.length; i++) {

        // Request Assigned
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Request Assigned") {
        if (pastEvents[i] && userAddress.toLowerCase() === pastEvents[i].returnValues.provAddr.toLowerCase()) {
            //if (showLogs) console.log("You Have Been Assigned A Task", "You have been chosen to complete a request for: " + pastEvents[i].returnValues.reqAddr + " The server id is:" + hex2ascii(pastEvents[i].returnValues.extra));
            mode = 0;
            requestAddr = pastEvents[i].returnValues.reqAddr
            requestIP = hex2ascii(pastEvents[i].returnValues.extra);
            execute()
        }
      }

      // Request Computation Complete
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Request Computation Completed") {
        if (pastEvents[i] && userAddress === pastEvents[i].returnValues.provAddr) {
            //if (showLogs) console.log("Awaiting validation", "You have completed a task an are waiting for validation");
        }
      }

      // Validation Assigned to Provider
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Validation Assigned to Provider") {
        if (pastEvents[i] && userAddress === pastEvents[i].returnValues.provAddr) {
            //if (showLogs) console.log("You are a validator", "You need to validate the task for: " + pastEvents[i].reqAddr + " as true or false. The server id is:" + hex2ascii(pastEvents[i].returnValues.extra));
            mode = 1;
            requestAddr = pastEvents[i].returnValues.reqAddr
            requestIP = hex2ascii(pastEvents[i].returnValues.extra)
            offer();
        }
      }

      // Not Enough validators
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Not Enough Validators") {
        if (userAddress === pastEvents[i].returnValues.provAddr) {
          //if (showLogs) console.log("You are a validator", "You need to validate the task for: " + pastEvents[i].reqAddr + " as true or false. The server id is:" + hex2ascii(pastEvents[i].returnValues.extra));
        }
      }

      // Enough Validators
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Enough Validators") {
        if (userAddress === pastEvents[i].returnValues.provAddr) {
         //if (showLogs) console.log("All Validators Found", "Your work is being validated. Please hold.");
        }
      }


      // Validator Signed
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Validator Signed") {
        if (userAddress === pastEvents[i].returnValues.provAddr) {
          //if (showLogs) console.log("You Have signed your validation", "You have validated the request for: " + pastEvents[i].returnValues.reqAddr);
            mode        = undefined;
            requestAddr = undefined;
            requestIP   = undefined;
        }
      }


      // Validation Complete
      if (pastEvents[i].returnValues && hex2ascii(pastEvents[i].returnValues.info) === "Validation Complete") {
        if (userAddress === pastEvents[i].returnValues.provAddr) {
            if (showLogs) console.log("Work Validated!", "Your work was validated and you should receive payment soon");
            mode = undefined;
        }
        //if (showLogs) console.log(pastEvents[i].blockNumber);
      }
    }
}



function listenWebsite(){
    console.log(chalk.cyan("Now listening for webpage...\n"))
    exec('xdg-open ./WebPage/UI.html', (err,stdout,stderr)=>{
        if(err){

          console.log(err);
          return;
        }
        console.log(stdout);
        
    });
    console.log(chalk.cyan('\nWebpage is now open check your default browser...\n'))
    var app = express();
    app.listen(3000);
    //json of all available accounts for the user
    app.use(express.json()); //Use to read json of incoming request

    //Allows CORS stuff
    app.use(function (req, res, next) {
        //set headers to allow cross origin requestt
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });


    app.get('/accounts', function(req, res) {
        var accountJSON = {"Addresses" : []}
        var counter = 0
        userAddresses.forEach(function(address){
            accountJSON["Addresses"].push({"Address": address});
            counter+=1;
        })
        res.header("Content-Type", 'application/json');
        res.send(accountJSON);
    })



    //API code

    app.get('/pools', function(req, res) {
        var poolJSON = {"ActiveProviders": 0, "ActiveProviderAddresses" : [], "Pending" : 0, "PendingAddresses" : [], "Providing" : 0, "ProvidingAddresses" : [], "Validating" : 0, "ValidatingAddresses": []};
        return myContract.methods.getProviderPool().call().then(function(provPool){
            poolJSON["ActiveProviders"] = provPool.length;
            for(var i = 0; i<provPool.length; i++){
                poolJSON["ActiveProviderAddresses"].push({"Address": provPool[i]})
            }
            return provPool;
        })
        .then(function(){
            return myContract.methods.getPendingPool().call().then(function(reqPool){
                poolJSON["Pending"] = reqPool.length;
                for(var i = 0; i<reqPool.length; i++){
                    poolJSON["PendingAddresses"].push({"Address": reqPool[i]})
                }
                return reqPool;
            })
        })
        .then(function(){
            return myContract.methods.getProvidingPool().call().then(function(providingPool){
                poolJSON["Providing"] = providingPool.length;
                for(var i = 0; i<providingPool.length; i++){
                    poolJSON["ProvidingAddresses"].push({"Address": providingPool[i]})
                }
                return providingPool;
            
            })
        })
        .then(function(){
            return myContract.methods.getValidatingPool().call().then(function(valiPool){
                poolJSON["Validating"] = valiPool.length;
                for(var i = 0; i<valiPool.length; i++){
                    poolJSON["ValidatingAddresses"].push({"Address": valiPool[i]})
                }
                return valiPool;
            
            })
        })
        .then(() =>{
            res.header("Content-Type", 'application/json');
            res.send(poolJSON)
        })
        .catch(function(err){
            console.log("Error: show pool error! ", err);
        })
        
    })

    app.post('/startProviding', function(req, res){
        var filename = "";
        for(i = 0; i<userAddresses.length; i++)
        {
            if(String(req.body["Account"]) == userAddresses[i])
            {
                filename = UTCFileArray[i];
                break;
            }
        }
        var keystore;
        var contents = fs.readFileSync(filename, 'utf8')
        keystore = contents;
        UTCfile = filename;
        userAddress = String(req.body["Account"]);
        decryptedAccount = web3.eth.accounts.decrypt(keystore, String(req.body["password"]));
        console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        var ABIstartProviding; //prepare abi for a function call
        var maxTime = parseInt(req.body["time"]);
        var maxTarget = parseInt(req.body["accuracy"]);
        var minPrice = parseInt(req.body["cost"]);
        ABIstartProviding = myContract.methods.startProviding(maxTime, maxTarget, minPrice).encodeABI();
        //console.log(chalk.cyan(ABIstartProviding);
        const rawTransaction = {
            "from": String(req.body["Account"]),
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIstartProviding
        }
    
        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "));
            console.log(receipt);
            console.log(chalk.cyan("\n\nYou are now Providing... \n\n"));
            prov = 1;
            res.send(JSON.stringify({"Success":1, "Error": "None"}));

        })
        .then(() => {//Pedro put your code here for start providing
            //call subscribe here

            try{
                web3.eth.subscribe('newBlockHeaders', (err, result) => {
                    if(err) console.log(chalk.cyan("ERRRR", err, result));
                    //console.log(chalk.cyan("================================================   <- updated! #", result.number);
                    //console.log(chalk.cyan(result);
                    //showPools();
                    //checkEvents();
                    //checkEvents(false);
                })
            }
            catch(error){
                alert(
                    `Failed to load web3, accounts, or contract. Check console for details.`
                );
                console.log("\n", chalk.red(err), "\n");
                res.send(JSON.stringify({"Success":0, "Error":String(err)}));
            }


        })
        .catch(err => {
            //console.log(String(err).slice(0, 41));
            if(String(err).slice(0, 41) == "Error: Returned error: insufficient funds")
            {
                console.log(chalk.red("\nError: This keystore account doesn't have enough Ether... Add funds or try a different account...\n"))
                res.send(JSON.stringify({"Success":0, "Error": "Not enough ether"}));
            }
            else{
                console.log(chalk.red("\n", err, "\n"))
                res.send(JSON.stringify({"Success":0, "Error": String(err)}));
            }
        });

    })

    app.post('/stopProviding', function(req, res){
        var filename = "";
        for(i = 0; i<userAddresses.length; i++)
        {
            if(String(req.body["Account"]) == userAddresses[i].toLowerCase())
            {
                filename = UTCFileArray[i];
                break;
            }
        }

        var keystore;
        var contents = fs.readFileSync(filename, 'utf8')
        UTCfile = filename;
        userAddress = String(req.body["Account"]);
        keystore = contents;
        decryptedAccount = web3.eth.accounts.decrypt(keystore, String(req.body["password"]));
        console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        var ABIstopProviding; //prepare abi for a function call
        ABIstopProviding = myContract.methods.stopProviding().encodeABI();
        const rawTransaction = {
            "from": String(req.body["Account"]),
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIstopProviding
        }

        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "))
            console.log(receipt)
            console.log(chalk.cyan("\n\nYou have now stopped providing...\n"))
            prov = 0;
            res.send(JSON.stringify({"Success":1, "Error": "None"}));

        })
        .catch(err => {
            console.log("\n", chalk.red("Error: "), chalk.red(err), "\n")
            res.send(JSON.stringify({"Success":0, "Error": String(err)}));

        });        

    })


    app.post('/updateProvider', function(req, res){
        console.log(chalk.cyan("\nWe are sending transaction to the blockchain... \n"));
        

        var ABIupdateProvider; //prepare abi for a function call
        var maxTime = parseInt(req.body["time"]);
        var maxTarget = parseInt(req.body["accuracy"]);
        var minPrice = parseInt(req.body["cost"]);

        ABIupdateProvider = myContract.methods.updateProvider(maxTime, maxTarget, minPrice).encodeABI();
        //console.log(chalk.cyan(ABIstartProviding);
        const rawTransaction = {
            "from": userAddress,
            "to": addr,
            "value": 0, //web3.utils.toHex(web3.utils.toWei("0.001", "ether")),
            "gasPrice": web3.utils.toHex(web3.utils.toWei("30", "GWei")),
            "gas": 5000000,
            "chainId": 3,
            "data": ABIupdateProvider
        }

        decryptedAccount.signTransaction(rawTransaction)
        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
        .then(receipt => {
            console.log(chalk.cyan("\n\nTransaction receipt: "))
            console.log(receipt)
            console.log(chalk.cyan("\n\nYou have updated provider settings to: max time = " + maxTime.toString() +
                ", max target = " + maxTarget.toString() + ", and min price = " + minPrice.toString() + "...\n\n"));
            res.send(JSON.stringify({"Success":1, "Error": "None"}));
        })
        .catch(err => {
            console.log("\n", chalk.red(err), "\n");
            res.send(JSON.stringify({"Success":0, "Error":String(err)}));
        });
    })

}