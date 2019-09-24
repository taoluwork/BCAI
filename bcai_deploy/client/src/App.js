// this is the main entrance of Application
// version: v3.0.0 align with contract 3.0 and project version v3.0


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
import {store} from 'react-notifications-component';
import "react-notifications-component/dist/theme.css";
import io from 'socket.io-client';
//import openSocket from 'socket.io-client';

import "./App.css";
//import { async, longStackSupport } from "q";
//import { AsyncResource } from "async_hooks";
//import { Accounts } from "web3-eth-accounts/types";
//import { userInfo } from "os";
import {MuiThemeProvider, AppBar, MenuItem, Paper, TextField, RaisedButton, Divider, Drawer, Button, Typography, Box, Toolbar, FormGroup, FormControl, FormControlLabel, InputLabel, Select, Slider, Tooltip } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Switch from '@material-ui/core/Switch';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import { AccountItem, NavbarBalance } from 'ethereum-react-components';
import { string } from "prop-types";


const hex2ascii = require('hex2ascii')




const styles = {
  buttonStyle : {
    color : "white",
    textTransform: 'none',
    fontSize: 16,
    border: '1px solid',
    marginLeft : 50,
    lineHeight: 1.5,
    backgroundColor: '#50cfda',
    fontFamily : "sans-serif",
  },

  buttonStyle2: {
    color : "white",
    textTransform: 'none',
    fontSize: 16,
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: '#50cfda',
    fontFamily : "sans-serif",
    marginTop: 10, 
    marginLeft: 15, 
    marginBottom: 10
  },

  buttonStyle3: {
    color : "white",
    textTransform: 'none',
    fontSize: 16,
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: '#50cfda',
    fontFamily : "sans-serif",
    margin : 10
  },

  buttonStyle4: {
    color : "white",
    textTransform: 'none',
    fontSize: 16,
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: '#50cfda',
    fontFamily : "sans-serif",
    marginTop : 20,
    marginBottom : 20
  },


  AppBarStyle : {
    flexGrow : 1,
  },

  TypoGraphyAppBarStyle: {
    fontFamily : 'sans-serif',
    fontSize : 20,
    fontWeight : "fontWeightBold",
    fontStyle: 'bold',
    color: 'white',
    padding: '6px 12px',
    backgroundColor : '#50cfda',
    paddingLeft : window.screen.width - 800,
    paddingTop : 30,
    paddingBottom : 30
  },

  TypographyStyle: {
    fontFamily : 'sans-serif',
    fontSize : 18,
    fontStyle: 'bold',
    marginBottom : 20,
    color : '#0c6f78',
  },

  TypographyStyle2: {
    fontFamily : 'sans-serif',
    fontSize : 18,
    fontStyle: 'bold',
    color : '#0c6f78',
    marginTop : 20,
    marginLeft : 50,
    marginBottom : 50,
  },

  TypographyStylePools: {
    fontFamily : 'sans-serif',
    fontSize : 18,
    fontStyle: 'bold',
    marginBottom: 12,
    color : '#0c6f78'
  },

  IconStyle: {
    marginRight : 50,
  },

  ToolbarStyle: {
    color : "white",
    backgroundColor : '#50cfda',
    fontFamily : 'roboto',
    fontSize : 30,
  },

  FormGroupStyle:{
    paddingTop : 100,
    paddingLeft : (parseInt(window.screen.width)/2)-100
  },

  SwitchStyle:{
    color: '#50cfda',
    display : 'flex',
    justifyContent : 'center',
  },

  FormStyle:{
    paddingTop: 100,
    paddingBottom : 100
  },

  IdenticonStyle: {
    marginTop : 100,
    display : 'flex',
    justifyContent : 'center'
  },

  inputStyle : {
    display : 'none',
  },

  sliderStyle : {
    width : 250,
    color : '#0c6f78', 
    marginLeft : 50
  },

  textFieldStyle : {
    marginLeft : 50,
    width : 250,
    fontSize : 30,
    
  }
}



/*
const FormSchema = t.struct({
  time: t.Number,
  target: t.Number,
  price: t.Number,
  account: t.String
})*/


function valuetextSlider(value) {
  return '${value}';
}

function createData(name, value){
  return {name, value};
}


class App extends Component {
  state = {
    //web3, account, contract instance, update later by setState()
    web3: null,
    accounts: null,
    myAccount: null,
    myContract: null,
    debug: false,
    count: 0,

    open : false,
    screen : "Main Menu",

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
    ether : 0,
    fileName : "",
    tempSocket: null, //added by TL 0812, missing declaration in state.

    defaultTime : 1,
    defaultTarget : 1,
    defaultPrice : 1,
  };

  constructor(props) {
    super(props)
    this.state = { mode: "USER", screen: "Main Menu" };
    //the following bind enable calling the function directly using func() syntax
    //NOTE: adding bind for new added functions is necessary
    //If missed bind may result in error : "cannot access property of undefined"
    this.captureFile  = this.captureFile.bind(this);
    this.showPools    = this.showPools.bind(this);
    this.TimeChange   = this.TimeChange.bind(this);
    this.TargetChange = this.TargetChange.bind(this);
    this.PriceChange  = this.PriceChange.bind(this);
    this.DefaultPriceChange = this.DefaultPriceChange.bind(this);
    this.DefaultTargetChange = this.DefaultTargetChange.bind(this);
    this.DefaultTimeChange = this.DefaultTimeChange.bind(this);
    this.submitRequest = this.submitRequest.bind(this);
    this.submitJob    = this.submitJob.bind(this);
    this.submitValidation = this.submitValidation.bind(this);
    this.serverSubmit = this.serverSubmit.bind(this);
    this.changeMode   = this.changeMode.bind(this);
    this.changeAccount = this.changeAccount.bind(this);
    this.showIDs      = this.showIDs.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.applyAsProvider = this.applyAsProvider.bind(this);
    this.submitValidationTrue   = this.submitValidationTrue.bind(this);
    this.submitValidationFalse  = this.submitValidationFalse.bind(this);
    this.stopJob      = this.stopJob.bind(this);
    this.stopProviding = this.stopProviding.bind(this);
    this.buildSocket  = this.buildSocket.bind(this);
    this.DownloadInfo = this.DownloadInfo.bind(this);
    this.notificationDOMRef = React.createRef();
    this.notificationInboxDOMRef = React.createRef();
    this.handleToggle = this.handleToggle.bind(this);
    this.drawerClose = this.drawerClose.bind(this);
    this.checkMenuItem = this.checkMenuItem.bind(this);
    this.switchStatus = this.switchStatus.bind(this);



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
      var etherAmt = await web3.eth.getBalance(accounts[0])/1000000000000000000;
      console.log("the amount of ether is ");
      console.log(etherAmt);
      this.setState({ web3, accounts, myContract: instance, myAccount: accounts[0], events: [] , socket , data: undefined , result: undefined, ether: etherAmt})
      this.setState({defaultTime : 1, defaultPrice : 1, defaultTarget : 1, count : 0,})
      this.setState({RequestStartTime: 0})
      console.log("contract set up!");
      this.showPools();
      web3.currentProvider.on('accountsChanged', async (accounts) => {
        const newAccount = await web3.eth.getAccounts(); 
        this.setState({accounts: newAccount });
        console.log(accounts);
      });
      
      
      //this is an example for web3's subscribe, wait a short period and see the effect in console
      //you can add functional method into the callback functions (under console.log)
      // official doc: https://web3js.readthedocs.io/en/v1.2.1/web3-eth-subscribe.html?highlight=monitor%20block#subscribe-newblockheaders
      // NOTE: this can also be used as a counter or timer.
      // NOTE: using arrow function instead of old-school function is necessary, 
      // refer to this link: https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      web3.eth.subscribe('newBlockHeaders', (err, result) => {
        if(err) console.log("ERRRR", err, result);
        console.log("================================================   <- updated! #", result.number);
        console.log(result);
        this.showPools();
        this.checkEvents();
      })
      
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
  TargetChange(event, value) {
    event.preventDefault();
    if (value !== "")   //under extreme cases, user will input empty by mistake
    {
      this.setState({Target: value })
    }
    else
    {
      this.setState({Target: undefined})
    }
  }
  PriceChange(event, value) {
    event.preventDefault();
    if (value !== "") {  //under extreme cases, user will input empty by mistake
      this.setState({ Price: event.target.value })
    }
    else
      this.setState({Price: undefined})
  }


  DefaultTimeChange(event) {
    event.preventDefault();
    if (event.target.value !== "")   //under extreme cases, user will input empty by mistake
      this.setState({defaultTime: event.target.value })
    else
      this.setState({defaultTime: undefined})
  }
  DefaultTargetChange(event, value) {
    event.preventDefault();
    if (value !== "")   //under extreme cases, user will input empty by mistake
    {
      this.setState({defaultTarget: value })
    }
    else
    {
      this.setState({defaultTarget: undefined})
    }
  }
  DefaultPriceChange(event) {
    event.preventDefault();
    if (event.target.value !== "")   //under extreme cases, user will input empty by mistake
      this.setState({defaultPrice: event.target.value })
    else
      this.setState({defaultPrice: undefined})
  }



  //file readers: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  captureFile(event) {    //using filereader to load file into buffer after selection
    event.preventDefault()
    console.log("capture file")
    const file = event.target.files[0]
    this.setState({fileName : event.target.files[0].name});
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
            socket.emit("click"); //if this is clicked too early then we either need to force this emit to happen latter or like 10 times to assume that the metamask button will load in time
          }
          else{
            document.getElementById('falseButton').click();
            socket.emit("click"); //if this is clicked too early then we either need to force this emit to happen latter or like 10 times to assume that the metamask button will load in time
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
          socket.emit("click"); //if this is clicked too early then we either need to force this emit to happen latter or like 10 times to assume that the metamask button will load in time
        }
        if(this.state.mode === 'USER'){
          document.getElementById('modeButton').click();
          document.getElementById('submitButton').click();
          socket.emit("click"); //if this is clicked too early then we either need to force this emit to happen latter or like 10 times to assume that the metamask button will load in time
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
      socket.on("taskCompleted", ()=>{
        this.state.tempSocket.emit("goodBye", this.state.myIP);
        this.state.tempSocket.disconnect(true);
        this.setState({result : undefined , resultID : undefined , tempSocket: undefined});
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
    //if(this.state.resultID === undefined){
      this.state.myContract.stopRequest({from: this.state.myAccount})
      .then(ret => {
        console.log("Job removed from pendingPool");
        this.state.socket.emit("dumpBuffer");
        this.setState({dataID : undefined , data : undefined , resultID : undefined , result : undefined}); //////this is done to remove the ids and files which is no longer valid
      })
      .catch(err => {
        console.log(err)
      })
    //}
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //NOTE!!!!!! this is curently done in order to delete the resultID once a job has been finished
    //this needs to be automated some how
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //else if(this.state.resultID !== undefined){
    //  this.state.tempSocket.emit("goodBye", this.state.myIP);
    //  this.state.tempSocket.disconnect(true);
    //  this.setState({result : undefined , resultID : undefined , tempSocket: undefined});
    //}
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
      this.setState({dataID : undefined , data : undefined , resultID : undefined , result : undefined}); //////this is done to remove the ids and files which is no longer valid
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
  //TODO: add assigned address to any assignment notification.


  checkEvents = async () => {
    var myEvents = [];
    var list = document.getElementById("historyBar");
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

      //Request Stopped
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Stopped") {
        myEvents = [];
        list.innerHTML = "";
      }

      //Request Added
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Added" && this.state.myAccount === this.state.events[i].args.reqAddr) {
        pastEvents.slice(0,1);
        this.setState({events : pastEvents});
        myEvents = [];
        list.innerHTML = ""
        myEvents.push("Task submitted");
      }

      // Request Assigned
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Assigned") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Provider Found", "Your task is being completed by: " + this.state.events[i].args.provAddr, "success")

          myEvents.push("Provider Found at: " + this.state.events[i].args.provAddr);
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addLongNotification("You Have Been Assigned A Task", "You have been chosen to complete a request for: " + this.state.events[i].args.reqAddr + " The server id is:" + hex2ascii(this.state.events[i].args.extra) , "info");
          this.setState({dataID : hex2ascii(this.state.events[i].args.extra), resultID : undefined});
          myEvents.push("Assigned to a task from: " + this.state.events[i].args.reqAddr );
          document.getElementById("dataButton").click();
        }
      }

      // Request Computation Complete
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Request Computation Completed") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Awaiting validation", "Your task is finished and waiting to be validated", "info")
          myEvents.push("Validation is now being completed");
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Awaiting validation", "You have completed a task an are waiting for validation", "info");
          myEvents.push("Validation is now being completed");
        }
      }

      // Validation Assigned to Provider
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validation Assigned to Provider") {
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Validator Found", "A validator (" + this.state.events[i].provAddr + ") was found for your task but more are still needed", "info")
          myEvents.push("Validator " + this.state.events[i].provAddr + " assigned");
        }
        if (this.state.events[i] && this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addLongNotification("You are a validator", "You need to validate the task for: " + this.state.events[i].reqAddr + " as true or false. The server id is:"
            + hex2ascii(this.state.events[i].args.extra), "info");
            this.setState({resultID : hex2ascii(this.state.events[i].args.extra)});
            console.log(hex2ascii(this.state.events[i].args.extra));
            this.setState({dataID : undefined});
          myEvents.push("You are a validator for: " + this.state.events[i].reqAddr );
          document.getElementById("resultButton").click();
        }
      }

      // Not Enough validators
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Not Enough Validators") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Not Enough Validators", "More validators are needed before the result can be sent to you"
            + this.state.events[i].args.provAddr, "warning")
          myEvents.push("Not enough validators found yet");
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Not Enough Validators", "There were not enough validators to verfiy your resulting work. Please wait."
            + this.state.events[i].args.reqAddr, "info");
          myEvents.push("Not enough validators found yet");
        }
      }


      // Enough Validators
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Enough Validators") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("All Validators Found", "Your task is being validated. Please hold.", "success")

          myEvents.push("All validators have been found");
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("All Validators Found", "Your work is being validated. Please hold.", "info");
          myEvents.push("All validators have been found");
        }
      }


      // Validator Signed
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validator Signed") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addNotification("Validator signed", "Validator " + this.state.events[i].args.provAddr + " has signed", "info")

          myEvents.push("Validator " + this.state.events[i].args.provAddr + " has signed");
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("You Have signed your validation", "You have validated the request for: " + this.state.events[i].args.reqAddr, "info");

          myEvents.push("You have signed  a validaton for " + this.state.events[i].args.reqAddr );
        }
      }


      // Validation Complete
      if (this.state.events[i].args && hex2ascii(this.state.events[i].args.info) === "Validation Complete") {
        if (this.state.myAccount === this.state.events[i].args.reqAddr) {
          this.addLongNotification("Job Done", "Please download your resultant file from the server at: " + hex2ascii(this.state.events[i].args.extra), "success")

          this.setState({resultID : hex2ascii(this.state.events[i].args.extra)});
          myEvents.push("Your job has been finished");
          document.getElementById("resultButton").click();
        }
        if (this.state.myAccount === this.state.events[i].args.provAddr) {
          this.addNotification("Work Validated!", "Your work was validated and you should receive payment soon", "info");

          myEvents.push("Your work has been validated");
        }
        console.log(this.state.events[i].blockNumber);
        this.setState({dataID: undefined, RequestStartTime: this.state.events[i].blockNumber+1});
        
      }
    }
    var list = document.getElementById("historyBar");
    //console.log(list.innerHTML)
    for (var j = 0; j < myEvents.length; j++){
      var el = document.createElement("li");
      el.appendChild(document.createTextNode(myEvents[j]));
      list.appendChild(el);
    }
  }

  addNotification(title, message, type) {
    this.notificationDOMRef.current.addNotification({
      title: title,
      message: message,
      type: type,
      container: "bottom-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 2000
        },
      dismissable: { click: true }
    });
  }


  addLongNotification(title, message, type) {
    this.notificationDOMRef.current.addNotification({
      title: title,
      message: message,
      type: type,
      container: "bottom-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ['animated', 'fadeOut'],
      dismiss: {
          duration: 2000
        },
      dismissable: { click: true }
    });
  }

  showApplyButton() {
    if (this.state.mode === 'WORKER') {
      return (
        <Button onClick={this.applyAsProvider} style={styles.buttonStyle3}>
          Submit Provider Application
          </Button>
      );
    }
  }

  showValidationButtons() {
    if (this.state.mode === 'WORKER' && this.state.resultID !== undefined && this.state.dataID === undefined) {
      return (
        <div>
          <Typography style = {styles.TypographyStyle}>
            VALIDATIONS
          </Typography>
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
        <form onSubmit={this.downloadEvent}  name="data" id="dataButton">
          <button>Download the data</button>  
        </form>
      </div>
      );
    }
    if(this.state.resultID !== undefined && this.state.dataID === undefined){
      return(
      <div>
        <p>resultID is: {"" + this.state.resultID}</p>
        <form onSubmit={this.downloadEvent}  name="result" id="resultButton">
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
        <Button onClick={this.applyAsProvider} style={styles.buttonStyle4}>
          Apply to be Provider
          </Button>
      );
    }
  }
  // upload script or result
  showUploadModule() {
    if (this.state.mode === "USER" ){
      return (
        <div>
          <Typography style = {styles.TypographyStyle}>
            UPLOAD TASK SCRIPT
          </Typography>
        <form onSubmit={this.serverSubmit}>
          <input
            id = "contained-button-file"
            type = "file"
            style = {styles.inputStyle}
            onChange = {this.captureFile}
            accept = ".zip, .rar, .7zip"
            />
            <label htmlFor = "contained-button-file">
            <Tooltip title = "only zip files are accepted">
              <Button variant = "contained" input = "file" component = "span" style = {styles.buttonStyle4} id = "filebutton">
                upload task
              </Button>
            </Tooltip>
            </label>
            <Typography style = {styles.TypographyStyle}>
              {this.state.fileName}
            </Typography>
          <Button style = {styles.buttonStyle4} onClick = {this.submitRequest} >
            Submit Task
          </Button>
          
          {/*<input type='submit' value="Upload to server"></input>*/}
        </form></div>
      )
    }
    if (this.state.mode === 'WORKER' && this.state.buffer === undefined && this.state.dataID !== undefined) {
      return(
        <div>
          <Typography style = {styles.TypographyStyle}>
            SUBMIT RESULT PACKAGE
          </Typography>
          <Typography style = {styles.TypographyStyle}>
            Please wait a submit button will appear once the script has been executed
          </Typography>
        </div>
      );
    }
    if (this.state.mode === 'WORKER' && this.state.buffer !== undefined ) {
      //there needs to be a resend function if the data is null(reupload button)
      return (
        <div>
          <Typography style = {styles.TypographyStyle}>
            SUBMIT RESULT PACKAGE
          </Typography>
          <form onSubmit={this.serverSubmit}>
          
          {/*<input type='submit' value="Upload to server"></input>*/}
       
        <Button id={'submitButton'} onClick={this.submitJob} style={styles.buttonStyle4}>
          Submit Result
        </Button>
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
        <Button onClick={this.stopProviding} style={styles.buttonStyle4}>
          Stop Working
          </Button>
      )
    }
    if(this.state.mode === 'USER'){
      return(
        <Button onClick={this.stopJob} style={styles.buttonStyle4}>
          Remove Job
          </Button>
      )
    }
  }

  historyBar(){
    return(
      <div>
        <ul id={"historyBar"} style={{ height:"200px" , overflow:"auto", marginRight:"40%", marginLeft:"40%" , listStyleType:"none"}}>
        </ul>
      </div>
    )
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  drawerClose(newScreen){
    this.setState({
      open:false,
      screen: newScreen,
    });
  }


  checkMenuItem() {
    if(this.state.mode == "USER")
    {
      return(
        <MenuItem onClick={() => this.drawerClose("Submit Task")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Submit Task</MenuItem>
      );
    }
    else{
      return(
        <MenuItem onClick={() => this.drawerClose("Provider Task")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Provider Task</MenuItem>
      );
    }
  }

  switchStatus(){
    if(this.state.mode == "USER")
    {;
      return "change to provider";
    }
    else{
      return "change to user";
    }
  }






  

  

  /////////////////////////////////////////////////////////////////////////////////
  //components of react: https://reactjs.org/docs/forms.html  
  render() {
    //console.log(this.state.screen);

    var rows = [
      createData('PROVIDER', this.state.providerCount),
      createData('PENDING', this.state.pendingCount),
      createData('PROVIDING', this.state.providingCount),
      createData('VALIDATING', this.state.validatingCount),
    ];
    
    
    this.state.mode === "USER" ? document.body.style = 'background:#F5F2D1;' : document.body.style = 'background:#E7F5D1;'

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    

    if(this.state.screen == "Submit Task" || this.state.screen == "Provider Task")
    {
      return(
        <div className = "App">
           <MuiThemeProvider>
          <div className = {styles.AppBarStyle}>
              <AppBar  title = "Material-UI" >
                <Toolbar style = {styles.ToolbarStyle}>
                  <IconButton  edge = "start" color="inherit" style = {styles.IconStyle} aria-label="menu" marginRight = {200}>
                    <MenuIcon onClick = {this.handleToggle}/>
                  </IconButton>
                  iChain Application
                  <div style = {{marginLeft : 1250}}>
                    <NavbarBalance balance={Math.round(this.state.ether, 4)}/>
                  </div>
                </Toolbar>
              </AppBar>
            </div>
          </MuiThemeProvider>
          <ReactNotification ref={this.notificationDOMRef} />
          <MuiThemeProvider>
            <div>
              <Drawer
                docked = {false}
                width = {300}
                open = {this.state.open}
                onRequestChange = {(open) => this.setState({open})}
              >

                <Paper style={{ height: 90, width: 300, background: '#22b9c6' }}>
                  <Typography style = {{color : "white", display : 'flex', justifyContent : 'center', marginTop : 35, fontFamily : 'sans-serif', fontWeight : "fontWeightBold", }}>
                    ICHAIN OPTIONS
                  </Typography>
                </Paper>
                <MenuItem onClick={() => this.drawerClose("Main Menu")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Main Menu</MenuItem>
                {this.checkMenuItem()}
                <MenuItem onClick={() => this.drawerClose("Settings")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Settings</MenuItem>
            </Drawer>
            </div>
          </MuiThemeProvider>

          <form onSubmit={this.startRequestSubmit} style = {styles.FormStyle}>
            <Typography style = {styles.TypographyStyle}>
              {this.state.mode === 'USER' ? "SUBMIT YOUR TASK" : "APPLY TO BE PROVIDER"}
            </Typography>
              <Typography style = {styles.TypographyStyle}>
              <TextField
                type="number"
                id="time"
                label="Time (s)"
                valueLabelDisplay = "auto"
                defaultValue = {this.state.defaultTime}
                onChange={(event, value) => this.TimeChange(event, value)}
                style = {styles.textFieldStyle}
              />
              </Typography> 
              <Typography style = {styles.TypographyStyle}>
                Target
              <Slider
                defaultValue = {this.state.defaultTarget}
                type = "number"
                getAriaValueText = {valuetextSlider}
                aria-labelledby="discrete-slider"
                valueLabelDisplay = "auto"
                step = {1}
                min = {1}
                max = {100}
                onChange = {(event, value) => this.TargetChange(event, value)}
                style = {styles.sliderStyle}
                />
              </Typography>
              <Typography style = {styles.TypographyStyle}>
                <TextField
                type="number"
                id="price"
                label="Price (in Wei)"
                valueLabelDisplay = "auto"
                defaultValue = {this.state.defaultPrice}
                onChange={(event, value) => this.PriceChange(event, value)}
                style = {styles.textFieldStyle}
              />
              </Typography>
              
              <p>
                <br></br>
                {this.showIDs()}
                {this.showSubmitButton()}
              </p>
          </form>
          {this.showUploadModule()}
          {this.showStopButtons()}
          {this.showValidationButtons()}
          {this.showUserDivider()}
        </div>
      )
    }



    if(this.state.screen == "Settings")
    {
      return(
        <div className = "App">
           <MuiThemeProvider>
          <div style = {styles.AppBarStyle}>
              <AppBar  title = "Material-UI" >
                <Toolbar style = {styles.ToolbarStyle}>
                  <IconButton  edge = "start" color="inherit" style = {styles.IconStyle} aria-label="menu" marginRight = {200}>
                    <MenuIcon onClick = {this.handleToggle}/>
                  </IconButton>
                  iChain Application
                </Toolbar>
              </AppBar>
            </div>
          </MuiThemeProvider>
          <ReactNotification ref={this.notificationDOMRef} />
          <MuiThemeProvider>
            <div>
              <FormGroup style = {styles.FormGroupStyle}>
                <FormControlLabel
                  control={
                    <Switch style = {styles.SwitchStyle} checked = {this.state.mode == "USER"} onChange ={this.changeMode} value = "mode" color = "primary"/>

                  }
                  label = {this.switchStatus()}
                 />
              </FormGroup>
              
              <Drawer
                docked = {false}
                width = {300}
                open = {this.state.open}
                onRequestChange = {(open) => this.setState({open})}
              >

                <Paper style={{ height: 90, width: 300, background: '#22b9c6' }}>
                  <Typography style = {{color : "white", display : 'flex', justifyContent : 'center', marginTop : 35, fontFamily : 'sans-serif', fontWeight : "fontWeightBold", }}>
                    iCHAIN OPTIONS
                  </Typography>
                </Paper>
                <MenuItem onClick={() => this.drawerClose("Main Menu")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Main Menu</MenuItem>
                {this.checkMenuItem()}
                <MenuItem onClick={() => this.drawerClose("Settings")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Settings</MenuItem>
            </Drawer>

            </div>
            
          </MuiThemeProvider>
          <div style = {{marginTop : 50, marginBottom : 50}}>
          </div>
          <Typography style = {styles.TypographyStyle}>
              {this.state.mode === 'USER' ? "DEFAULT USER SETTINGS" : "DEFAULT PROVIDER SETTINGS"}
              </Typography>
              <Typography style = {styles.TypographyStyle}>
              <TextField
                type="number"
                id="time"
                label="Time (s)"
                valueLabelDisplay = "auto"
                defaultValue = {this.state.defaultTime}
                onChange={(event, value) => this.DefaultTimeChange(event, value)}
                style = {styles.textFieldStyle}
              />
              </Typography> 
              <Typography style = {styles.TypographyStyle}>
                Target
              <Slider
                defaultValue = {this.state.defaultTarget}
                type = "number"
                getAriaValueText = {valuetextSlider}
                aria-labelledby="discrete-slider"
                valueLabelDisplay = "auto"
                step = {1}
                min = {1}
                max = {100}
                onChange = {(event, value) => this.DefaultTargetChange(event, value)}
                style = {styles.sliderStyle}
                />
              </Typography>
              <Typography style = {styles.TypographyStyle}>
                <TextField
                type="number"
                id="price"
                label="Price (in Wei)"
                valueLabelDisplay = "auto"
                defaultValue = {this.state.defaultPrice}
                onChange={(event, value) => this.DefaultPriceChange(event, value)}
                style = {styles.textFieldStyle}
              />
              </Typography>

        </div>
      )
    }

    if (this.state.screen == "Main Menu")
    {
      return (
        <div className = "App">
          <MuiThemeProvider>
          <div>
              <AppBar  title = "Material-UI" style = {styles.AppBarStyle}>
                <Toolbar style = {styles.ToolbarStyle}>
                  <IconButton  edge = "start" color="inherit" style = {styles.IconStyle} aria-label="menu" marginRight = {200}>
                    <MenuIcon onClick = {this.handleToggle}/>
                  </IconButton>
                  iChain Application
                </Toolbar>
              </AppBar>
            </div>

          </MuiThemeProvider>
          <ReactNotification ref={this.notificationDOMRef} />

          <MuiThemeProvider>
            <div>
              <Drawer
                docked = {false}
                width = {300}
                open = {this.state.open}
                onRequestChange = {(open) => this.setState({open})}
              >
                <Paper style={{ height: 90, width: 300, background: '#22b9c6' }}>
                  <Typography style = {{color : "white", display : 'flex', justifyContent : 'center', marginTop : 35, fontFamily : 'sans-serif', fontWeight : "fontWeightBold", }}>
                    ICHAIN OPTIONS
                  </Typography>
                </Paper>
                <MenuItem onClick={() => this.drawerClose("Main Menu")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Main Menu</MenuItem>
                {this.checkMenuItem()}
                <MenuItem onClick={() => this.drawerClose("Settings")} style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>Settings</MenuItem>
            </Drawer>
            </div>
          </MuiThemeProvider>
          <MuiThemeProvider>
            <div style = {styles.IdenticonStyle}>
            <AccountItem name="Current Account" address={this.state.myAccount} balance = {this.state.ether}/>  
          </div>
          </MuiThemeProvider>
          <div style = {{marginTop : 50}}>
            <Typography style = {styles.TypographyStyle}>
              ACCOUNT HISTORY
            </Typography>
          {this.historyBar()}
          </div>
          <Typography style = {styles.TypographyStyle}>
            CURRENT ACCOUNT
            <Button style = {styles.buttonStyle} onClick = {this.checkEvents}>
              check status
            </Button>
          </Typography>
          <Typography style = {styles.TypographyStyle}>
              CURRENT STATE OF CONTRACT
              <Button style = {styles.buttonStyle} onClick = {this.showPools}>
                refresh
              </Button>
            </Typography>
          <Paper style = {{marginTop: 30, width : '50%', overflowX: 'auto', left: '25%', position: 'absolute'}}>
            <Table style = {{minWidth: 650, backgroundColor : 'white'}}>
              <TableHead>
                <TableRow>
                  <TableCell style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>POOL</TableCell>
                  <TableCell align = "right" style = {{color :'#0c6f78', fontFamily : 'sans-serif'}}>COUNT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key = {row.name}>
                    <TableCell component = "th" scope = "row" style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>
                      {row.name}
                    </TableCell>
                    <TableCell align = "right" style = {{color : '#0c6f78', fontFamily : 'sans-serif'}}>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <div style={{ marginTop: 100 }}>
            
            <Typography style = {styles.TypographyStylePools}>
              Provider Pool = {this.state.providerCount}
            </Typography>
            <Typography style = {styles.TypographyStylePools}>
              Pending Pool = {this.state.pendingCount}
            </Typography>
            <Typography style = {styles.TypographyStylePools}>
              Providing Pool = {this.state.providingCount}
            </Typography>
            <Typography style = {styles.TypographyStylePools}>
              Validating Pool = {this.state.validatingCount}
            </Typography>
            
          </div>


        </div>
        
        );
      }
  }
}


export default App;
