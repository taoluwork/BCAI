////////////////////////////////////////////////////////////////
//client's js app, combined --user mode and --worker mode
//version: 0.9.4
//author: taurus tlu4@lsu.edu
//use: $ node client.js --help --version
/////////////////////////////////////////////////////////////////
const version = "bcai_client v0.9.4     ----  by Taurus"
const NetworkID = 1544726768855;
//NOTE: combine user and worker client together switch using --user, --worker
//Avoid using version earlier than 0.9.2
/////////////////////////////////////////////////////////////////
//edit default parameter here:
var dataID = 31415926;
var target = 90;            //must < workders maxTarget
var time = 90000;           //must < worker's maxTime
var money = 800000;         //must > worker's minPrice
var maxTime = 100000;
var maxTarget = 99;
var minPrice = 500000;
var mode;                   // = 'user';      //default mode: no
var myAccount;              // default set below
////////////////////////////////////////////////////////////////////
//get arguments from console , handle mode and parameter
var argv = require('minimist')(process.argv.slice(2));
//argument example:
//node worker.js -u 2 -b 3    ==>   { _: [], u: 2, b: 3 }
if(argv['help']) {
    console.log("Arguments:")
    console.log(" -a #    : use Account[#]  /  -a [#>9] list all address");
    console.log(" -s #    : cancel request # ");
    console.log(" -u #    : update request # ");
    console.log(" -t #    : time ");
    console.log(" -T #    : target ");
    console.log(" -p #    : price");
    console.log(" -C #    : complete reqID");
    console.log(" -R #    : resultID");

    console.log(" --view  : view all current requests / no change");
    console.log(" --my    : view all my requests");
    console.log(" --cancel: cancel existing request");
    console.log(" --all   : show all the infomation / use with caution")
    console.log(" --debug : enable more details");
    console.log(" --user / --worker : switch mode")
    //console.log(" --stop :  stop the current provider")
    console.log("NOTE: you cannot view other accounts' info, use --my -a#")
	process.exit();
}
//display version check
if(argv['v'] || argv['version']){
    console.log(version);
    process.exit();
}
//setting up mode
if(argv['user']) mode = 'user';
else if(argv['worker']) mode = 'worker';
else {
    console.log("-----------------------------------------------------------------")
    console.log("You must specify --worker or --user mode.")
    console.log("-----------------------------------------------------------------")
    process.exit();
}
//setting parameters
if(mode == 'user'){
    if(argv['t'] != undefined) time = argv['t'];
    if(argv['T'] != undefined) target = argv['T'];
    if(argv['p'] != undefined) money = argv['p']; 
}
else if(mode == 'worker'){
    if(argv['t'] != undefined) maxTime = argv['t'];
    if(argv['T'] != undefined) maxTarget = argv['T'];
    if(argv['p'] != undefined) minPrice= argv['p']; 
}
///////////////////////////////////////////////////////////////////////////
//create web3 instance
var Web3 = require('web3');
//use websocket provider here, NOTE: http is deprecated.
var web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

//get contract instance
var TaskContract = require('../client/src/contracts/TaskContract.json');
var abi = TaskContract.abi;
var addr = TaskContract.networks[NetworkID].address;        //align to const ID defination on top
const myContract = new web3.eth.Contract(abi, addr);
//////////////////////////////////////////////////////////////////////////
//start your ganache testnet or connect to real blockcahin.
//NOTE: networkID must be given and set to const NetworkID.
// use: $ ganache-cli -i or --networkId 512
// start your ganache-cli now!
/////////////////////////////////////////////////////////////////////////
web3.eth.getAccounts().then(function(accounts){     //get and use accoutns
    if (argv['a'] > 9){                 //list all accounts
        console.log(accounts);
        process.exit();
    }
    else if(argv['a'] == undefined) {
        if(mode == 'user'){
            myAccount = accounts[0];
            console.log("=================================================================")
            console.log('Using default account: [0]', myAccount);
            console.log('You can infer specific account by passing -a #');
        }
        else if (mode == 'worker'){
            myAccount = accounts[9];
            console.log("=================================================================")
            console.log('Using default account: [9]', myAccount);
            console.log('You can infer specific account by passing -a #');
        }
    }    
    else {      //-a is given
        myAccount = accounts[argv['a']];
        if (myAccount == undefined) throw 'setting account error!';
        console.log("=================================================================")
        console.log('Using account: [',argv['a'], '] ', myAccount);
    }
    //Important: display current mode
    console.log("Client Mode: ", mode);
    return accounts;
})
.then(function(accounts){           //success: accounts got
    if (argv['all']){               //display all info
        console.log(accounts);
        if      (mode == 'user')    AllRequests();
        else if(mode == 'worker')   AllProviders();
    }
    else if (argv['my']){           //display my info
        if(mode == 'user')  RequestOnlyMy(myAccount);
        else if(mode == 'worker') ProviderOnlyMy(myAccount);
    }
    else if (argv['view']){
        console.log(accounts);      //only view, no change
        if (mode == 'user') PoolRequests();
        if (mode == 'worker') PoolProviders();
    }
    else {                          //real state change
        if (mode == 'user') userFireMessage();
        else if (mode =='worker') workerFireMessage();
    }
})
.then(function(){                   //subcribe and monitor the events  
    myContract.events.SystemInfo({
        fromBlock: 'latest',
        //toBlock: 'latest'
    },function(err, eve){
        if(err!= undefined) console.log(err);           
    })
    .on('data', function(eve){
        PrintEvent(eve);
        //my event or others
        DisplayAfterEvent(eve);     
    })
})
.catch(function(err){               //failure: no accounts
    console.log(err);
    console.log("Getting accounts failed!");
    console.log("Check your depolyment! ");
    process.exit();
})

//////////////////////////main functions/////////////////////////////////////////////////////
//supporting functions below.
//the main 'state-changing' function. --user and --worker have their own func, in pairs.
function userFireMessage(){
    if(argv['stop'] || argv['s'] != undefined) {                               //cancel a request 
        //TODO: [Important] cancel request need refund (not yet designed), use caution
        myContract.methods.stopRequest(argv['s'])
        .send({from:myAccount, gas:200000})
        .then(function(ret){
            console.log("Cancel Request: Block = ", ret.blockNumber);
            console.log("-----------------------------------------------------------------");
            if(argv['recpt']) console.log("Receipt :    <<====####  ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Cancel Request failed! ' 
        }).catch(function(err){         //this poped when trying edit other's config / fired using wrong account
            console.log(err);    
            console.log("Check your reqID by --my");
            process.exit();
        })
    }
    else if(argv['u'] != undefined) {                              // call updateProviding
        //TODO: [Important] update request need refund 
        myContract.methods.updateRequest(time, target, argv['u'])
        .send({from: myAccount, gas: 200000, value: money})
        .then(function(ret){
            console.log("Update request: Block = ", ret.blockNumber);
            console.log("Using parameters: time = ",time,", target = ",target,", price = ",money);
            console.log("-----------------------------------------------------------------");
            if(argv['recpt']) console.log("Receipt :    <<====####  ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Update Request failed!'
        }).catch(function(err){         //this poped when edit other's config / fired using wrong account
            console.log(err);
            console.log("Check your reqID by --my");
            process.exit();
        })
    }
    else {        //submit a request
        myContract.methods.startRequest(time, target, money, dataID)
        .send({from: myAccount, gas: 80000000, value: money})
        .then(function(ret){                                                        //handle the receipt
            //console.log("-----------------------------------------------------------------")
            console.log("Using parameters: time = ",time,", target = ",target,", price = ",money);
            console.log("Request Submitted! Block: ",ret.blockNumber);
            console.log("-----------------------------------------------------------------")
            if(argv['recpt'])  console.log("Receipt:    <=====######", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Submit request failed!'                  
        }).catch(function(err){
            console.log(err)
            console.log("Check receipt by --recpt");
            process.exit();
        })
    }  
}
function workerFireMessage(){
    if(argv['C'] != undefined) {                            //complete computation, need validation  
        if (argv['R'] == undefined) {
            console.log("No Result ID specified, using default : 191345");
            argv['R'] = 191345;
        }
        myContract.methods.completeRequest(argv['C'], argv['R']).send({from: myAccount, gas:200000})
        .then(function(ret){
            console.log("Complete Request: ReqID = ",argv['C'], " Block = ", ret.blockNumber);
            if(argv['recpt']) console.log("Receipt :    <<====####  ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Complete Request failed! '
        }).catch(function(err){
            console.log(err);    
            process.exit();
        })
    }   
    else if(argv['stop'] || argv['s'] != undefined) {       // call stopProviding
        myContract.methods.stopProviding(argv['s'])
        .send({from:myAccount, gas:200000})
        .then(function(ret){
            console.log("Stop providing: Block = ", ret.blockNumber);
            console.log("-----------------------------------------------------------------");
            if(argv['recpt']) console.log("Receipt :    <<====####  ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Stop provider failed!' 
        }).catch(function(err){
            console.log(err);
            console.log("You can only stop your provider. Check your provID by --my");
            process.exit();
        })
    }
    else if(argv['u'] != undefined) {                       // call updateProviding
        myContract.methods.updateProvider(maxTime, maxTarget, minPrice, argv['u'])
        .send({from: myAccount, gas: 200000})
        .then(function(ret){
            console.log("Update providing: Block = ", ret.blockNumber);
            console.log("Using parameters: time = ",maxTime,", target = ",maxTarget,", price = ",minPrice);
            console.log("-----------------------------------------------------------------");
            if(argv['recpt']) console.log("Receipt :    <<====####  ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Update provider failed!'
        }).catch(function(err){
            console.log(err);
            console.log("You can only update your provider. Check your provID by --my");
            process.exit();
        })
    }
    else {             //default operation                  //start new provider
        myContract.methods.startProviding(maxTime, maxTarget, minPrice)
        .send({from: myAccount, gas: 400000})
        .then(function(ret){
            console.log("Start providing: Block = ", ret.blockNumber);
            console.log("Using parameters: time = ",maxTime,", target = ",maxTarget,", price = ",minPrice);
            console.log("-----------------------------------------------------------------")
            if(argv['recpt']) console.log("Receipt:    <=====###### ", ret);
            if(ret.events['SystemInfo'] == undefined) throw 'Start provider failed!'
        }).catch(function(err){
            console.log(err);
            console.log("Check receipt by --recpt");          
            process.exit();
        })
    }

}
/////////////////////Conditional Display/////////////////////////////////////////////////////////
//list only active pool linked the current account , called by --my
function RequestOnlyMy(myAccount){
    return myContract.methods.getRequestPool().call().then(function(pool){
        console.log("Active Request count = ",pool.length);
        console.log("Active Request Pool: ");
        console.log(pool);
        return pool; 
    })
    .then(function(pool){
        return myContract.methods.getRequestID(myAccount).call().then(function(IDList){
            console.log("-----------------------------------------------------------------");
            console.log("All my posted Requests: ")
            console.log(IDList);
            return IDList;         
        })
    })
    .then(function(IDList){ 
        DisplayNonZeroInList(IDList, 'request');  
    })
}
function ProviderOnlyMy(myAccount){
    return myContract.methods.getProviderPool().call().then(function(pool){
        console.log("Active Provider count = ",pool.length);
        console.log("Active Provider Pool: ");
        console.log(pool);
        return pool;  
    })
    .then(function(pool){
        return myContract.methods.getProviderID(myAccount).call().then(function(IDList){
            console.log("-----------------------------------------------------------------");
            console.log("All my posted provider: ")
            console.log(IDList);
            return IDList;           
        })
    })
    .then(function(IDList){
        DisplayNonZeroInList(IDList, 'provider');    
    })
}
//call by --view [--debug]
//list out  Active Count, Total Count, Active Pool, List out Pool item
function PoolRequests (){      
    return myContract.methods.getRequestCount().call().then(function(totalCount){            
        console.log("-----------------------------------------------------");
        console.log("Total Request since start = ", totalCount);
    }).then(function(){	        
        return myContract.methods.getRequestPool().call().then(function(pool){             
            console.log("Active Request pool: total = ", pool.length);
            console.log(pool);
            return pool;
        })
    }).then(function(pool){	
        ListoutPool(pool, 'request');
    }).catch(function(err){      //catch any error at end of .then() chain!
        console.log("List Pool Request Info Failed! ")
        console.log(err);
        process.exit();
    })               
}
function PoolProviders (){    
    return myContract.methods.getProviderCount().call().then(function(totalCount){
        console.log("-----------------------------------------------------");
        console.log("Total provider since start = ", totalCount);
    }).then(function(){	        
        return myContract.methods.getProviderPool().call().then(function(pool){             
            console.log("Active provider pool: ");
            console.log(pool);
            return pool;
        })
    }).then(function(pool){	
            ListoutPool(pool,'provider');
    }).catch(function(){      //catch any error at end of .then() chain!
        console.log("List All Provider Info Failed! ")
        console.log(err);
        process.exit();
    })
}
//called after submit a new request list out Total count, Active pool, last item
function LatestRequest(){
    return myContract.methods.getRequestCount().call().then(function(totalCount){
        console.log("-----------------------------------------------------------------");
        console.log("Total Request count = ",totalCount);
        return totalCount;
    })
    .then(function(totalCount){
        //get Request pool     
        return myContract.methods.getRequestPool().call().then(function(pool){
            console.log("Active Request count = ",pool.length);
            console.log("Request Pool: ");
            console.log(pool); 
            return totalCount;  
        })
    }).then(function(totalCount){
        //print Request detals (object)
        if(argv['debug']){
            return myContract.methods.getRequest(totalCount-1).call().then(function(ret){
                console.log("-----------------------------------------------------------------");
                console.log("Last Request: ", ret);
            })
        }
    })
}
function LatestProvider(){
    return myContract.methods.getProviderCount().call().then(function(totalCount){
        console.log("-----------------------------------------------------------------");
        console.log("Total provider count = ",totalCount);
        return totalCount;
    })
    .then(function(totalCount){
        //get Provider pool     
        return myContract.methods.getProviderPool().call().then(function(pool){
            console.log("Active Provider count = ",pool.length);
            console.log("Provider Pool: ");
            console.log(pool); 
            return totalCount;  
        })
    }).then(function(totalCount){
        //print provider detals (object)
        if(argv['debug']){
            return myContract.methods.getProvider(totalCount-1).call().then(function(ret){
                console.log("-----------------------------------------------------------------");
                console.log("Last provider: ", ret);                
            })
        }
    })
}
//the most heavy duty, --all
function AllRequests(){
    return myContract.methods.getRequestCount().call().then(function(totalCount){
        console.log("-----------------------------------------------------");
        console.log("Total Request since start = ", totalCount);
        return totalCount;
    }).then(function(totalCount){	
        return myContract.methods.listAllRequests().call().then(function(List){                          
            if(totalCount > 0) console.log("List all the Requests in History:   <<======####")
                DisplayNonZeroInList(List, 'request');	
        })
    }).catch(function(){      //catch any error at end of .then() chain!
        console.log("List Request History Info Failed! ")
        process.exit();
    })               
}
function AllProviders(){
    return myContract.methods.getProviderCount().call().then(function(totalCount){
        console.log("-----------------------------------------------------");
        console.log("Total provider since start = ", totalCount);
        return totalCount;
    }).then(function(totalCount){	
        return myContract.methods.listAllProviders().call().then(function(proList){                          
            if(totalCount > 0) console.log("List all the Providers: ")
                DisplayNonZeroInList(proList, 'provider');
        })
    }).catch(function(err){      //catch any error at end of .then() chain!
        console.log("List All Provider Info Failed! ")
        console.log(err);
        process.exit();
    })               
}
//////////////////////display helpers all here//////////////////////////////////////////////////////
function DisplayRequest(reqID){
    myContract.methods.getRequest(reqID).call().then(function(result){
        console.log(result);
    })
}
function PrintEvent(event){
	if(argv['debug']){	
		console.log("=======================================================  <- Event!");
		console.log(event);
		console.log("=================================================================");
	} else { 
		console.log("=======================================================  <- Event!");
		console.log(event.event, "  ==>  ", event.blockNumber);
		if(event.event == 'SystemInfo')
			console.log("Event: ", web3.utils.hexToAscii(event.returnValues[2]));
		else if(event.event == 'UpdateInfo')
			console.log("Event: ", web3.utils.hexToAscii(event.returnValues[1]));
		else if (event.event == 'PairingInfo')
			console.log("Event: ", web3.utils.hexToAscii(event.returnValues[4]));
		console.log(event.returnValues);
	}
}
function DisplayAfterEvent(eve){
    //update the display
    if(mode == 'user'){      
        if(eve.returnValues[2] == web3.utils.asciiToHex('Request Stopped'))
            RequestOnlyMy(myAccount);
        else (eve.returnValues[2] == web3.utils.asciiToHex('Request Stopped'))
            LatestRequest();
    } 
    else if (mode == 'worker'){
        if(eve.returnValues[2] == web3.utils.asciiToHex('Provider Stopped'))
            ProviderOnlyMy(myAccount);
        else if (eve.returnValues[2] == web3.utils.asciiToHex('Provider Added') || 
        eve.returnValues[2] == web3.utils.asciiToHex('Provider Updated'))
            LatestProvider();
        else if (eve.returnValues[2] == web3.utils.asciiToHex('Request Computation Completed'))
            DisplayRequest(eve.returnValues[0]);
            console.log("Display: Request Completed!")
    }
}
//[important] two display helper
function DisplayNonZeroInList(List, type){
	if(type == 'request')
		for(var i = 0;i < List.length;i++){
			if(List[i]['addr'] != 0){
				if(argv['debug']){
					console.log(List[i]);
					console.log("-----------------------------------------------------")
				} else {
					//simple print:
					console.log("reqID = ", List[i]['reqID']);
					console.log("addr = ", List[i]['addr']);
					console.log("provider = ", List[i]['provider']);
					console.log("status = ",  List[i]['status']);
					console.log("-----------------------------------------------------")							
				}
			}
		}
	else if (type == 'provider')
		for (var i = 0;i < List.length ;i++){
			if(List[i]['addr'] != 0){
				if(argv['debug']){
					console.log(List[i]);
					console.log("-----------------------------------------------------")
				} else{
					console.log("provD = ", List[i]['provID']);
					console.log("addr = ", List[i]['addr']);
					console.log("available = ", List[i]['available']);
					console.log("-----------------------------------------------------")
				}
			}
		}
	else throw 'Not supported type for display'	
}
function ListoutPool(Pool,type){		//--list [--debug]
	//console.log("List out Pool")
	if (type == 'provider'){
		return myContract.methods.listProviders(Pool).call()
		.then(function(proList){
			console.log("-----------------------------------------------------")
			DisplayNonZeroInList(proList,'provider');
		})
	}
	else if (type == 'request'){
		return myContract.methods.listRequests(Pool).call()
		.then(function(pendList){
			console.log("-----------------------------------------------------")
			DisplayNonZeroInList(pendList,'request');
		})
	}
	else throw "Not supported type!"
}