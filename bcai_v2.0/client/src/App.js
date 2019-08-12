// this is the main entrance of Application
// version: v2.1.0, align with bcai_2.1.0.sol


// TODO: fix the async function dependency. e.g. Need returned dataID to send Tx                          [needed for provider]
// TODO: add notification of updating request             [need test] //I did not find these --Pedro

// TODO: update appearance -- material-ui

// TODO: currently the stop job button will delete the result ID after a user has finished recieving their data. this needs to be replaced with an automatic method
// TODO: add timeouts to the socket emits that ask for data to be resent (right now these are called multiple times since it takes longer for the data to be moved
//       than for the resend message to be called)

import React, { Component } from "react";
import TaskContract from "./contracts/TaskContract.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
//import t from 'tcomb-form';
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import io from 'socket.io-client';
//import openSocket from 'socket.io-client';

import "./App.css";
//import { async, longStackSupport } from "q";
//import { AsyncResource } from "async_hooks";
//import { Accounts } from "web3-eth-accounts/types";
//import { userInfo } from "os";
const hex2ascii = require('hex2ascii')

/*
const FormSchema = t.struct({
  time: t.Number,
  target: t.Number,
  price: t.Number,
  account: t.String
})*/

class App extends Component {
  state = {
    //web3, account, contract instance, update later by setState()
    web3: null,
    accounts: null,
    myAccount: null,
    myContract: null,
    debug: false,
    count: 0,

    //user level variable
    mode: "USER",
    events: [],
    ValidationResult: false,
    Time: 0,
    Target: 0,
    Price: 0,
    dataID: null,
    resultID: null, //TODO
    RequestStartTime: 0,

    //variables to display status
    providerCount: 0,
    pendingCount: 0,
    validatingCount: 0,
    providingCount: 0,
    providerList: null,

    tempSocket: null, //added by TL 0812, missing declaration in state.
    
  };

  constructor(props) {
    super(props)
    this.state = { mode: "USER", };
    //the following bind enable calling the function directly using func() syntax
    //NOTE: adding bind for new added functions is necessary
    //If missed bind may result in error : "cannot access property of undefined"
    this.captureFile = this.captureFile.bind(this);
    this.showPools = this.showPools.bind(this);
    this.TimeChange = this.TimeChange.bind(this);
    this.TargetChange = this.TargetChange.bind(this);
    this.PriceChange = this.PriceChange.bind(this);
    this.submitRequest = this.submitRequest.bind(this);
    this.submitJob = this.submitJob.bind(this);
    this.submitValidation = this.submitValidation.bind(this);
    this.serverSubmit = this.serverSubmit.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.changeAccount = this.changeAccount.bind(this);
    this.showIDs = this.showIDs.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.applyAsProvider = this.applyAsProvider.bind(this);
    this.submitValidationTrue = this.submitValidationTrue.bind(this);
    this.submitValidationFalse = this.submitValidationFalse.bind(this);
    this.stopJob = this.stopJob.bind(this);
    this.stopProviding = this.stopProviding.bind(this);
    this.buildSocket = this.buildSocket.bind(this);
    this.DownloadInfo = this.DownloadInfo.bind(this);
    this.notificationDOMRef = React.createRef();
  }

  //initiate the page
  componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const Contract = truffleContract(TaskContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();
      const socket = await this.buildSocket('http://localhost:3001');
      console.log("here is the instance " + instance);
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, myContract: instance, myAccount: accounts[0], events: [] , socket , data: undefined , result: undefined})
      this.setState({Time: 1, Price : 1, Target : 1, count : 0})
      this.setState({RequestStartTime: 0})
      console.log("contract set up!");
      this.showPools();
      web3.currentProvider.on('accountsChanged', async (accounts) => {
        const newAccount = await web3.eth.getAccounts(); 
        this.setState({accounts: newAccount });
        console.log(accounts);
      });
      
    }
    catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

 
  
  /////// Supporting functions for app ////////////////////////////////////////////////////////////////////
  //NOTE:[important] using => is very important,this pass the context without changing the this ref.
  //https://medium.com/@thejasonfile/callback-functions-in-react-e822ebede766
  //NOTE: event.preventDefault() is important to stop page from refreshing itself after an event happen.
  //[Tutorial] some tricks about async and await: https://flaviocopes.com/javascript-async-await/
  //https://medium.com/codebuddies/getting-to-know-asynchronous-javascript-callbacks-promises-and-async-await-17e0673281ee
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  TimeChange(event) {
    event.preventDefault();
    if (event.target.value !== "")   //under extreme cases, user will input empty by mistake
      this.setState({Time: event.target.value })
    else
      this.setState({Time: undefined})
  }
  TargetChange(event) {
    event.preventDefault();
    if (event.target.value !== "")   //under extreme cases, user will input empty by mistake
      this.setState({Target: event.target.value })
    else
      this.setState({Target: undefined})
  }
  PriceChange(event) {
    event.preventDefault();
    if (event.target.value !== "")   //under extreme cases, user will input empty by mistake
      this.setState({Price: event.target.value })
    else
      this.setState({Price: undefined})
  }

  //file readers: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  captureFile(event) {    //using filereader to load file into buffer after selection
    event.preventDefault()
    console.log("capture file")
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log("buffer", this.state.buffer);
    }
  }


  //this function will build the client sockets necessay for socket.io
  buildSocket = async(loc) => {
    var socket ;
    //this is entered if the location that the server is not within the current computer
    if(loc.indexOf('localhost') === -1){
      
      //create the connection
      socket = io.connect("http://" + loc + "/");
      
      //once the connection is created call to setup the connection correctly and ask for the data
      socket.on("connect", () => {
        socket.emit('setUp', this.state.myIP);
        socket.emit('request', this.state.myIP);
      });

      //this is called when a server send data in responce to this current computer's request
      socket.on('transmitting' + this.state.myIP, (tag , dat)=>{
        console.log("Got:transmitting and tag:" + tag + " and data:" + dat + " was received.")
        if(dat !== undefined){                     
            socket.emit('recieved', this.state.myIP); 
            console.log("emit:recieved msg:" + this.state.myIP);
            if(tag === "data"){
                this.setState({data: dat});
            }
            if(tag === "result"){
                this.setState({result: dat});
            }
        }
        //if the data is not recieved it will be asked for again
        else{ 
            socket.emit('request', this.state.myIP);
            console.log('emit:request msg:' + this.state.myIP); 
        }
      });

      //this is recieved after the server has send the data
      //if the data is not received that it will request for the data agian
      //if the data is recieved then it will close the connection
      socket.on('fin', (msg) => {
        console.log("Got:fin and msg:" + msg);
        if((msg === "data" && this.state.data === undefined) || (msg === "result" && this.state.result === undefined)){ 
          socket.emit('request', this.state.myIP); 
          console.log('emit:request msg:' + this.state.myIP);
        }
        else{
            console.log("Finished and the socket will close now")
            socket.disconnect(true);        }
      });
    }

    //if you are attmepting to connect to a server that is on the current computer
    //this is necessary for the browser to send the data to other computers and to
    //ececute the code
    else{
      socket = io(loc);

      //this is sent so that the browser is able to learn what its public ip is
      //this is not easily gotten so the local server deals with it
      socket.on('whoAmI', (msg) =>{
        if(this.state.ip === undefined){
          console.log("whoAmI just fired : " + msg)
          console.log(typeof msg);
          this.setState({myIP : msg});
          if(this.state.buffer !== undefined){
            socket.emit('setupMode', this.state.mode);
            socket.emit("setupBuffer", this.state.buffer);
          }
        }
        else{
          socket.emit("reset");
        }
      });

      //this is triggered when the local server does not correctly receive data
      socket.on('resendData', () => {
        socket.emit('data', this.state.data);
      });

      //this is triggered when the local server does not correctly receive data
      socket.on('resendResult', () => {
        socket.emit('result', this.state.result);
      });

      //this is triggered when the current mode is validator and the result has
      //been found by the local server
      socket.on('uploadVal', (val) => {
        if(this.state.mode === 'WORKER'){
          if(val){
            document.getElementById("trueButton").click();
          }
          else{
            document.getElementById('falseButton').click();
          }
        }
      });

      //this is triggered when the current mode is proider and the code has been trained
      //and needs to be uploaded
      socket.on('uploadResult', (data) => {
        console.log('recieved uploadResult')
        this.setState({buffer : data});
        console.log(this.state.buffer);
        if(this.state.mode === 'WORKER'){  
          document.getElementById('submitButton').click();
        }
        if(this.state.mode === 'USER'){
          document.getElementById('modeButton').click();
          document.getElementById('submitButton').click();
        }
      })

      //if the browser has been disconnected this will trigger to make sure that the 
      //browser has the state data
      socket.on( "browserReconnect" , (newMode, newBuffer) => {
        //the integer version of mode selection is defined in localEnv.js 
        //(copied here for ease of understanding)
        //0-provider
        //1-validator
        //2-user
        if( (newMode === 0 || newMode === 1) && this.state.mode !== "WORKER" ){
          document.getElementById('modeButton').click();
        }
        if( (newBuffer !== undefined || newBuffer !== null) && this.state.buffer === undefined){
          this.setState({buffer : newBuffer});
          console.log(this.state.buffer)
        }
      });
    }
    return socket;//return so that we can still interact with it later on
  }

  //It will create a socket and depending on the current mode it will send it with that
  //specific tag
  DownloadInfo = async(event) => {
    var tag = undefined;
    var m = undefined;
    if(event.target.name === "data"){
      tag = this.state.dataID;
      m = "WORKER";
    }
    if(event.target.name === "result"){
      tag = this.state.resultID;
      if(this.state.mode === "USER"){
        m = "USER";
      }
      else{
        m = "VALIDATOR";
            }
    }
    var tempSocket = await this.buildSocket(tag);
    this.state.socket.emit("setupMode", m);
    tempSocket.emit("request", this.state.myIP);
    console.log(this.state);
    this.setState({tempSocket : tempSocket});
    return tempSocket;
  }

  //submit the file in buffer to the local server
  //NOTE: wrap the callback function file.add() into a promiss-pattern call, see details in below link.
  //https://medium.com/codebuddies/getting-to-know-asynchronous-javascript-callbacks-promises-and-async-await-17e0673281ee
  serverSubmit =  async (event) => {  //declare this as async and it will return a promise, even not explicitly
    event.preventDefault();   //stop refreshing
    console.log("submiting...")
    this.addNotification("Uploading file...", "Awaiting response from server", "info");
    if(this.state.mode === "USER"){
      this.setState({dataID : this.state.myIP});
    }
    else{
      this.setState({resultID : this.state.myIP});
    }
    //this.state.socket.emit("setupMode", this.state.mode);
    this.state.socket.emit('setupBuffer', this.state.buffer);
    console.log(this.state.buffer);
    console.log(typeof this.state.buffer);
    return this.state.myIP;
  }


  //seach for all events related to current(provider) addr, return the reqAddrs
  matchReq = async (provAddr) => {
    let reqAddr = await this.state.myContract.getPastEvents("allEvents", {fromBlock: this.state.RequestStartTime, toBlock: 'latest'})
      .then(pastEvents => { //NOTE:[IMPORTANT] this.state.event is not updated in this stage
        console.log("returned all events:", pastEvents) 
        if (pastEvents === undefined) return undefined
        else {
          // Look for pairing info events
          for (var i = pastEvents.length - 1; i >= 0; i--) {
            console.log("------------", this.state.web3.utils.hexToAscii(pastEvents[i].args.info))
            console.log(  "prov", pastEvents[i].args.provAddr)
            console.log(  "req",  pastEvents[i].args.reqAddr)
            // Request Addr exist and provAddr matches
            if (pastEvents[i].args.reqAddr && provAddr === pastEvents[i].args.provAddr ) {
                return pastEvents[i].args.reqAddr
            }
          }
          return undefined  // not find
        }
      })
      .catch(err => {return err})
      console.log(reqAddr)
      return reqAddr
  }

  //upload the file to localserver and send the TX at the same time. No addtional button is needed
  submitRequest = async (event) => {
    event.preventDefault();
    //Combine the startRequest with the local server, so user do not need click additional button
    let returnHash = await this.serverSubmit(event);
    if (returnHash !== undefined){
      this.state.myContract.startRequest(this.state.Time, this.state.Target,
        this.state.Price, this.state.web3.utils.asciiToHex(this.state.myIP),
        { from: this.state.myAccount, value: this.state.Price })
        .then(ret => {
          console.log(ret);
          this.addLongNotification("Request Submission Succeed", "Request submitted to contract.", "success")
          var StartTime = ret.receipt.blockNumber;  //record the block# when submitted, all following events will be tracked from now on
          this.setState({RequestStartTime : StartTime})
          console.log("Event Tracking start at #", this.state.RequestStartTime)
          this.setState({resultID :undefined, result: undefined});
        })
        .catch(err => {
          console.log(err);
          this.addNotification("Request Submission Failed", "Please check your configuration", "warning")
        })
    }
    else {
      console.log("IP Address undefined")
    }
//    this.addNotification("Sending Request to Ethereum Blockchain", "You will be notified when the tx is finished", "info");
    
    //print output only after the state setting
    console.log("maxTime = ",   this.state.Time);
    console.log("minTarget = ", this.state.Target);
    console.log("maxPrice = ",  this.state.Price);
    console.log("dataID = ",    this.state.dataID);
  }


  //submitJob will check whether you are assigned a task first.
  //Only if you are assigned, it will send the TX
  //This check is also done in smart contract, you cannot submit result to other's task.
  //Given that, checking in client is still necessary because checking onchain consumes gas.
  submitJob = async (event) => {
    event.preventDefault();
    let reqAddr = await this.matchReq(this.state.myAccount)
    console.log("RequestAddr = ", reqAddr)
    if (reqAddr === undefined){
      this.addNotification("Result Submission Failed", "You are not assigned a task", "warning")
    }
    else {
      let resultHash = await this.serverSubmit(event)
      if (resultHash !== undefined){
        console.log("ResultHash = ", resultHash)
        this.state.myContract.completeRequest(reqAddr, this.state.web3.utils.asciiToHex(resultHash),
          { from: this.state.myAccount, gas:500000 }).then(ret => {
            console.log("Submit Result Return:", ret);
            var StartTime = ret.receipt.blockNumber;  //record the block# when submitted, all following events will be tracked from now on
            this.setState({RequestStartTime : StartTime})
            this.addNotification("Result Submission Succeed", "Work submitted to contract", "success")

            //disconnect the socket
            this.state.tempSocket.emit("goodBye", this.state.myIP);
            this.state.tempSocket.disconnect(true);
            this.setState({data : undefined , dataID : undefined , tempSocket: undefined});
          })
      }
      else { console.log("Failed to submit to local server")}
    }
  }

  stopJob(event) {
    event.preventDefault();
    console.log("stopJob: " + this.state.resultID)
    if(this.state.resultID === undefined){
      this.state.myContract.stopRequest({from: this.state.myAccount})
      .then(ret => {
        console.log("Job removed from pendingPool");
        this.state.socket.emit("dumpBuffer");
      })
      .catch(err => {
        console.log(err)
      })
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //NOTE!!!!!! this is curently done in order to delete the resultID once a job has been finished
    //this needs to be automated some how
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if(this.state.resultID !== undefined){
      this.state.tempSocket.emit("goodBye", this.state.myIP);
      this.state.tempSocket.disconnect(true);
      this.setState({result : undefined , resultID : undefined , tempSocket: undefined});
    }
  }

  submitValidationTrue (event) {
    event.preventDefault();
    this.setState({ValidationResult: true});
    this.submitValidation(event);
    this.state.socket.emit("dumpBuffer");
  }

  submitValidationFalse (event){
    event.preventDefault();
    this.setState({ValidationResult: false});
    this.submitValidation(event);
    this.state.socket.emit("dumpBuffer");
  }

  submitValidation = async (event) => {
    event.preventDefault();
    let req = await this.matchReq(this.state.myAccount)
    console.log("submit vali for: ", req);
    if (req === undefined){
      this.addNotification("Validation Submission Failed", "You are not assigned as Validator", "warning")
    }
    else {
      console.log("submit result = ", this.state.ValidationResult)
      this.state.myContract.submitValidation(req, this.state.ValidationResult,
        { from: this.state.myAccount, gas: 200000 })
        .then(ret => {
          console.log(ret);
          this.addNotification("Validation Submission Succeeded", "Validation submitted to contract", "success")

          //disconnect the temp socket
          this.state.tempSocket.emit("goodBye", this.state.myIP);
          this.state.tempSocket.disconnect(true);
          this.setState({result : undefined , resultID : undefined , tempSocket: undefined});
        })
        .catch(err => { //most common err here is out-of-gas VM error
          console.log(err);
          this.addNotification("Validation Submission Error!", "Please check console for error", "warning")
        })
    }
  }

  applyAsProvider(event) {
    event.preventDefault();
    this.addNotification("Worker application submitted!", "Stand by for approval from the contract", "info")
    this.state.myContract.startProviding(this.state.Time, this.state.Target,
      this.state.Price, { from: this.state.myAccount })
      .then(ret => {
        this.addNotification("Worker application approved", "Your computer is now registered on the blockchain", "success")
        console.log("Submit Result Return:", ret);
        var StartTime = ret.receipt.blockNumber;  //record the block# when submitted, all following events will be tracked from now on
        this.setState({RequestStartTime : StartTime})
      })
      .catch(err => {
        console.log(err)
        this.addNotification("Worker application failed", "Please check your configuration", "warning")
      })
  }

  stopProviding(event)  {
    event.preventDefault();
    this.state.myContract.stopProviding({from: this.state.myAccount})
    .then(ret => {
      console.log("Worker removed from providerPool");
    })
    .catch(err => {
      console.log(err)

    })
  }

  changeMode(event) {
    event.preventDefault()
    if (this.state.mode === "USER"){
      this.setState({ mode: "WORKER" })
      this.setState({ count: 0, myAccount: this.state.accounts[0]})
    } 
    else if (this.state.mode === "WORKER"){
      this.setState({ mode: "USER" })
      this.setState({ count: 0, myAccount: this.state.accounts[0]})
    } 
    else throw String("Setting mode error!")
  }

  changeAccount(event) {
    event.preventDefault();
    this.setState({ myAccount: this.state.accounts[event.target.value] ,
    count: event.target.value})
  }

  downloadEvent =  async (event) => {
    event.preventDefault();
    var tag = event.target.name
    let returnVal = await this.DownloadInfo(event)
      .then(result => {
        return result;
      }).catch(err => {
        console.log("Download Error!", err);
        return undefined
      })
    console.log(returnVal);
    if(tag === "data"){
      this.state.socket.emit(tag, this.state.data);
    }
    if(tag === "result"){
      this.state.socket.emit(tag, this.state.result);
    }
  }

  ////// Supporting functions for display //////////////////////////////////////////////////////////////////
  showPools() {		//optional [--list] 
    this.state.myContract.getProviderPool.call().then(provPool => {
      console.log("=======================================================");
      console.log("Active provider pool: Total = ", provPool.length);
      console.log(provPool);
      this.setState({ providerCount: provPool.length })
      this.setState({ providerList: provPool })
    })

    this.state.myContract.getPendingPool.call().then(reqPool => {
      console.log("=======================================================")
      console.log("Pending pool:  Total = ", reqPool.length);
      console.log(reqPool);
      this.setState({ pendingCount: reqPool.length })
    })

    this.state.myContract.getProvidingPool.call().then(providingPool => {
      console.log("=======================================================")
      console.log("Providing pool:  Total = ", providingPool.length);
      console.log(providingPool);
      this.setState({ providingCount: providingPool.length })
    })

    this.state.myContract.getValidatingPool.call().then(valiPool => {
      console.log("=======================================================")
      console.log("Validating pool:  Total = ", valiPool.length);
      console.log(valiPool);
      this.setState({ validatingCount: valiPool.length })
    })
  }


  // Workflow:


  // Some bugs to note:
  // Validating pool isnt always cleared

  // For validators, account[3] is always skipped, making the validators accounts 1, 2, and 4

  // only 1 validator is currently working - this is because ctrct.getPastEvents() only
  // gets the events that were emitted within the last call to the contract on the blockchain
  // - any events emitted before that call are erased and must be fetched in other ways.

  // The number of provider pool sometimes spontaneously increments when performing certain tasks

  // The code to watch for events needs to be changed entirely most likely




  //USER
  // Ensure User mode is active
  // choose job file 
  // uploads file to local server
  // [OPTIONAL] fill out time target price and account
  // submit task to contract
  // eventually check status will print the dataID to fetch from the server at the location of dataID

  //PROVIDER
  // Ensure Worker mode is active
  // look for notification with dataID
  // Fetch the data from the other server
  // do the computational work to get result data 
  // choose result data file
  // upload result file to the local server for others to pull from
  // Submit result to contract

  //NEW APPLICANT
  // Ensure Worker mode is active
  // Fill out the time, target and price, and make sure the right account is selected
  // Hit Apply to Become a Provider
  // Await notification 



  // Checking status of account. 
  //note: CheckEvents has been edited to keep track of only the current transaction's information and
  //      is used to identify the resultID and dataID if necessary for that person's specific role
  checkEvents = async () => {
    let pastEvents = await this.state.myContract.getPastEvents("allEvents", {fromBlock:  this.state.RequestStartTime, toBlock: 'latest'});
    console.log("Event range: ", this.state.RequestStartTime)
    console.log("All events:", pastEvents)

    for(var i = 0 ; i < pastEvents.length; i++){
      if((pastEvents[i].args && hex2ascii(pastEvents[i].args.info) === "Validator Signed" && this.state.myAccount === pastEvents[i].args.provAddr) || 
        (pastEvents[i].args && hex2ascii(pastEvents[i].args.info) === "Validation Complete" && this.state.myAccount === pastEvents[i].args.provAddr) ){
        pastEvents.splice(0,i+1);
        this.setState({dataID: undefined, resultID : undefined, events:pastEvents});
      }
      else if(pastEvents[i].args && hex2ascii(pastEvents[i].args.info) === "Validation Complete" && this.state.myAccount === pastEvents[i].args.reqAddr){
        pastEvents.splice(0,i);
        this.setState({dataID: undefined, events:pastEvents});
      }
    }

    this.setState({
        events: pastEvents
    });

    // For pairing info events
    for (var i = 0; i < this.state.events.length; i++) {
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Added" && this.state.myAccount === this.state.events[i].args.reqAddr) {
        pastEvents.slice(0,1);
        this.setState({events : pastEvents});
      }
      // Request Assigned
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Assigned") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Provider Found", "Your task is being completed", "success")
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addLongNotification("You Have Been Assigned A Task", "You have been chosen to complete a request. The server data ID is: " + this.state.dataID , "info");
          this.setState({dataID : hex2ascii(this.state.events[i].args.extra), resultID : undefined});
        }
      }

      // Request Computation Complete
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Computation Completed") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Awaiting validation", "Your task is finished and waiting to be validated", "info")
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Awaiting validation", "You have completed a task an are waiting for validation"
            + this.state.events[i].args.reqAddr, "info");
        }
      }

      // Validation Assigned to Provider
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validation Assigned to Provider") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Validator Found", "A validator was found for your task but more are still needed", "info")
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addLongNotification("You are a validator", "You need to validate the task as true or false. The server id is:"
            + hex2ascii(this.state.events[i].args.extra), "info");
            this.setState({resultID : hex2ascii(this.state.events[i].args.extra)});
            console.log(hex2ascii(this.state.events[i].args.extra));
            this.setState({dataID : undefined});
        }
      }

      // Not Enough validators
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Not Enough Validators") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Not Enough Validators", "More validators are needed before the result can be sent to you"
            + this.state.events[i].args.provAddr, "warning")
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Not Enough Validators", "There were not enough validators to verfiy your resulting work. Please wait."
            + this.state.events[i].args.reqAddr, "info");
        }
      }


      // Enough Validators
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Enough Validators") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("All Validators Found", "Your task is being validated. Please hold.", "success")
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("All Validators Found", "Your work is being validated. Please hold.", "info");
        }
      }


      // Validator Signed
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validator Signed") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Validator signed", "Your task is being validated", "info")
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("You Have signed your validation", "You have validated the request from address", "info");
        }
      }


      // Validation Complete
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validation Complete") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addLongNotification("Job Done", "Please download your resultant file from server using the hash " + hex2ascii(this.state.events[i].args.extra), "success")
          this.setState({resultID : hex2ascii(this.state.events[i].args.extra)});
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Work Validated!", "Your work was validated and you should receive payment soon", "info");
        }
        console.log(this.state.events[i].blockNumber);
        this.setState({dataID: undefined, RequestStartTime: this.state.events[i].blockNumber+1});
        
      }
    }

  }

  addNotification(title, message, type) {
    this.notificationDOMRef.current.addNotification({
      title: title,
      message: message,
      type: type,
      insert: "top",
      container: "top-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: { duration: 5000 },
      dismissable: { click: true }
    });
  }

  addLongNotification(title, message, type) {
    this.notificationDOMRef.current.addNotification({
      title: title,
      message: message,
      type: type,
      insert: "top",
      container: "top-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: { duration: 20000 },
      dismissable: { click: true }
    });
  }

  showApplyButton() {
    if (this.state.mode === 'WORKER') {
      return (
        <button onClick={this.applyAsProvider} style={{ margin: 10 }}>
          Submit Provider Application
          </button>
      );
    }
  }

  showValidationButtons() {
    if (this.state.mode === 'WORKER' && this.state.resultID !== undefined && this.state.dataID === undefined) {
      return (
        <div>
          <h2> VALIDATIONS </h2>
          <p>
          <button id={'trueButton'} onClick={this.submitValidationTrue} style={{ marginBottom: 5 , marginRight : 10}} >
            TRUE
          </button>
          <button id={'falseButton'} onClick={this.submitValidationFalse} style={{ marginBottom: 5 , marginLeft: 10}}>
            FALSE
          </button>
          </p>
          Current Validation Result: {'' + this.state.ValidationResult}
        </div>
      );
    }
  }

  showIDs(){
    if(this.state.dataID !== undefined && this.state.resultID === undefined){
      return(
      <div>
        <p>
          DataID is: {"" + this.state.dataID}
        </p>
        <form onSubmit={this.downloadEvent}  name="data">
          <button>Download the data</button>  
        </form>
      </div>
      );
    }
    if(this.state.resultID !== undefined && this.state.dataID === undefined){
      return(
      <div>
        <p>resultID is: {"" + this.state.resultID}</p>
        <form onSubmit={this.downloadEvent}  name="result">
          <button>Download the result</button>  
        </form>
      </div>
      );
    }
    if(this.state.dataID !== undefined && this.state.resultID !== undefined){
      return(
        <div>
          <p>
            DataID is: {"" + this.state.dataID}
          </p>
          <form onSubmit={this.downloadEvent}  name="data">
            <button>Download the data</button>  
          </form>
          <p>resultID is: {"" + this.state.resultID}</p>
          <form onSubmit={this.downloadEvent}  name="result">
            <button>Download the result</button>  
          </form>
        </div>
        );
    }
  }

  // apply provider or nothing
  showSubmitButton() {
    if (this.state.mode === 'USER') {
      return
    }
    if (this.state.mode === 'WORKER') {
      return (
        <button onClick={this.applyAsProvider} style={{ margin: 10 }}>
          Apply Provider
          </button>
      );
    }
  }
  // upload script or result
  showUploadModule() {
    if (this.state.mode === "USER" ){
      return (
        <div><h2>{"UPLOAD TASK SCRIPT" }</h2>
        <form onSubmit={this.serverSubmit}>
          <input type='file' id='fileInput' onChange={this.captureFile}></input>
          <button onClick={this.submitRequest} style={{ margin: 10 }}>
          Submit Task
          </button>
          {/*<input type='submit' value="Upload to server"></input>*/}
        </form></div>
      )
    }
    if (this.state.mode === 'WORKER' && this.state.buffer === undefined && this.state.dataID !== undefined) {
      return(
        <div>
          <h2>SUBMIT RESULT PACKAGE</h2>
          <p>Please wait a submit button will appear once the script has been executed</p>
        </div>
      );
    }
    if (this.state.mode === 'WORKER' && this.state.buffer !== undefined ) {
      //there needs to be a resend function if the data is null(reupload button)
      return (
        <div><h2>SUBMIT RESULT PACKAGE</h2>
          <form onSubmit={this.serverSubmit}>
          
          {/*<input type='submit' value="Upload to server"></input>*/}
       
        <button id={'submitButton'} onClick={this.submitJob} style={{ marginTop: 10, marginLeft: 15, marginBottom: 10 }}>
          Submit Result
        </button>
        </form></div>
      );
    }
  }
  //used to align User mode with worker mode
  showUserDivider(){
    if (this.state.mode === "USER")
      return (
        <div style={{marginBottom: 190}}></div>
      )
  }

  //stop providing/request buttons
  showStopButtons(){
    if(this.state.mode === 'WORKER'){
      return(
        <button onClick={this.stopProviding} style={{ margin: 10 }}>
          Stop Working
          </button>
      )
    }
    if(this.state.mode === 'USER'){
      return(
        <button onClick={this.stopJob} style={{ margin: 10 }}>
          Remove Job
          </button>
      )
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  //components of react: https://reactjs.org/docs/forms.html  
  render() {

    this.state.mode === "USER" ? document.body.style = 'background:#F5F2D1;' : document.body.style = 'background:#E7F5D1;'

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <ReactNotification ref={this.notificationDOMRef} />
        <h1 style={{ marginBottom: 30 }}>Welcome to the BCAI Dapp</h1>
        <button id={'modeButton'} onClick={this.changeMode} style={{ fontsize: 40, height:60, width: 120, marginBottom: 20 }}>{this.state.mode} MODE</button>

        

        <form onSubmit={this.startRequestSubmit}>
        <h2>{this.state.mode === 'USER' ? "SUBMIT YOUR TASK (in a zip file name data.zip)" : "APPLY TO BE PROVIDER"}</h2>
          <p><label>
            Time : (in seconds)
          <input type="number" value={this.state.Time} onChange={this.TimeChange} />
          </label></p>
          <p><label>
            Target : (0-100)
          <input type="number" value={this.state.Target} onChange={this.TargetChange} />
          </label></p>
          <p><label>
            Price : (in wei)
          <input type="number" value={this.state.Price} onChange={this.PriceChange} />
          </label></p>
          <p>Use account:          <div> {this.state.myAccount}  </div> 
            <br></br>
            {this.showIDs()}
            {this.showSubmitButton()}
          </p>
        </form>
        {this.showUploadModule()}
        {this.showStopButtons()}
        {this.showValidationButtons()}
        {this.showUserDivider()}
        

        <h2 style={{ marginTop: 20 }}>CURRENT ACCOUNT
        <button onClick={this.checkEvents} style={{marginLeft : 20, marginBottom: 10 }}> Check Status </button></h2>
        

        <div style={{ marginTop: 5 }}>
          <h2 style={{ margin: 1 }}>CURRENT STATE OF CONTRACT
          <button onClick={this.showPools} style={{marginLeft: 20}}>
            Refresh
          </button></h2>
          <p>Provider Pool = {this.state.providerCount}</p>
          <p>Pending Pool = {this.state.pendingCount}</p>
          <p>Providing Pool = {this.state.providingCount}</p>
          <p>Validating Pool = {this.state.validatingCount}</p>
          
        </div>

      </div>
    );
  }
}

export default App;
