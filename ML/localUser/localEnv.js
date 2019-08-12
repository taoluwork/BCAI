const util = require("util");
const {exec} = require('child_process');
const fs = require('fs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var publicIp = require("public-ip")
const prompts = require('prompts');

var buffer;
var version = '';
var name = '';
var mode; 
var ip;
var ip4;
var ip6;
var training = false;
var ver = false;
var flag = true; // this flag will be shared between the provider and the validator
var conns = [];
var connsI = [];
var reconfigFlag = false;
var website = "130.39.223.54:3000"

//structure of a conn
//ip        -> (string)  the ip address of the connection
//startTime -> (integer) the time when the connection has been started
//endTime   -> (integer) the time when the connection should time out /***/This will not be implemented yet/***/
//socket    -> (object)  the given socket (need a way to reconnect)
//status    -> (boolean) shows if the connections is live (true) or needs to be closed (false)

//structure of modes that will be used throughout the entire file
//0-provider
//1-validator
//2-user

///////////////////////////////////////////////////////////////////////////open the webpage////////////////////////////////////////////////////////////////////////

//this function opens the webpage (currently there is a timming error with loading metamask so when the page opens reload the page)
exec('firefox ' + website , (err,stdout,stderr)=>{
  if(err){
    console.log(err);
  }
}); 
//////////////////////////////////////////////////////////////////////server functions section//////////////////////////////////////////////////////////////////////

//this function is used so that close the socket and remove it from the list of connecitons
function closeSocket(pos){
  conns[pos].socket.disconnect(true);
  conns.splice(pos,1);
  connsI.splice(pos, 1);
  console.log('connection has been closed, there are:' + conns.length + ' left');
  update();
  for(var i = 0 ; i < conns.length ; i++){
    console.log(conns[i].ip);
  }
}

//this function will send the necessary info that the browser lost if it was closed and reopend or reloaded
function browserReconect(socketInst){
  //current mode
  //files if any
  socketInst.emit("browserReconnect", mode, buffer);
}

//this function is called if the localEnv.js is closed then repened while in the middle of a transaction
//this allows the server to not lose the files and connection list
function reconfig(){
  //variables
  if(reconfigFlag === false){
    reconfigFlag = true;
    console.log('reconfiguring files');
    let data = fs.readFileSync("curState.json" );
    let curState = JSON.parse(data);
    buffer  = curState.curBuffer;
    version = curState.curVersion;
    name    = curState.curName;
    mode    = curState.curMode;
    ip      = curState.curIp;
    conns   = curState.curConns;
    connsI  = curState.curConns;
  }
}

//this function updates the data that is sotored in curState.json
//note: a socket.io socket can not be stored in JSON, so there is an array that tracks the connections without the socket
//      if the server is restarted and is supposed to have connectins then the connections will attempt to reconnect themselves
//      and the sockets will be redefiend in the array
function update(){
  reconfigFlag = true;
  let curState = {
    curBuffer  : buffer,
    curVersion : version,
    curName    : name,
    curMode    : mode, 
    curIp      : ip,
    curConns   : connsI
  };
  let data = JSON.stringify(curState);
  fs.writeFileSync("curState.json" , data);
  console.log("updating data");
}

//////////////////////////////////////////////////////////////////////setup/closing section////////////////////////////////////////////////////////////////////////

//exit message
//if this is done while the webpage is open firefox sends error messages
//just keep pressing ctrl + c until it asks if you want to save the state
console.log("To exit the program please type: Ctrl + c")

//this event is triggered when the program is trying to be killed (most generally is triggered by ctrl + c)
//it will ask if the state should be saved or not
process.on('SIGINT', async () => {
  const response = await prompts({
    type: 'text',
    name: 'val',
    message: 'Would you like to save the state? (please type Yes or No)'
  });
 
  if(response.val.toLowerCase() === "yes"){
    update();
    process.exit();
  }
  if(response.val.toLowerCase() === "no"){
    exec('rm curState.json' , (err,stdout,stderr)=>{}).then(process.exit());
  }
  });

//when the program begins it will execute this and look at all the files in the current folder
//if there is a saved state then it will attempt to reconstruct the current state with the data stored
fs.readdirSync('.').forEach(file => {
  if(file === "curState.json"){
    reconfig();
  }
});

//function to generate the public IPv4 and IPv6 addresses 
var getIp = (async() => {
  await publicIp.v4().then(val => {ip4 = val});
  await publicIp.v6().then(val => {ip6 = val});
})

//this calls the IP generating file and then depending on the option that is given it will create the server
//since the IP is necessary for the creation of the socket.io server all the server section resides in this .then call
getIp().then(() => {
  //allow for manual choice (defaults to IPv4)
  if(process.argv[2] === undefined || process.argv[2] === "-4"){
    ip = ip4 + ":3001";
  }
  else if(process.argv[2] === "-6"){
    ip = "[" + ip6 + "]:3001";
  }
  else{
    ip = ip4 + ":3001";
  }

  //////////////////////////////////////////////////////////////////////server section//////////////////////////////////////////////////////////////////////////////

  //this is triggered when a new connection is created
  io.on('connection', function(socket){
    //console.log(socket.handshake.address);

    //if the connection is the from the same computer it will emit the necessary information
    //to the browser and if add or update the information in the comms array
    if(socket.handshake.address.search('127.0.0.1') >= 0) {
      console.log("Hello User")
      socket.emit("whoAmI", ip); 
      var exists = false;
      for(var i = 0 ; i < conns.length ; i++){
        if(conns[i].ip && conns[i].ip === ip){
          exists = true;
          //send stored data up to browser
          browserReconect(socket);
        }
      }
      if(exists === false){
        conns.push({
          ip        : ip,
          startTime : Date.now(),
          ///end time to be implemented in timeout update
          socket    : socket
        });
        connsI.push({
          ip        : ip,
        startTime : Date.now(),
        ///end time to be implemented in timeout update
        });
        update();
      }
    }

    //this is triggered in the local browser knows that the server has been restarted
    //this happens just in case if the file isnt noticed at first
    socket.on('reset', function(){
      if(socket.handshake.address.search('127.0.0.1') >= 0) {
        reconfig();
      }
    });

    //this is called to empty the buffer once the user is done with the contents of it
    socket.on("dumpBuffer", function() {
      if(socket.handshake.address.search('127.0.0.1') >= 0) {
        buffer = undefined;
        update();
      }
    });

    //this is called by connections on other computers
    //it creates/updates the necessary connections
    socket.on("setUp", function(msg){
      console.log(msg);
      var exists = false;
      for(var i = 0 ; i < conns.length ; i++){
        if(conns[i].ip && conns[i].ip === msg){
          exists = true;
          conns[i].socket = socket;
          console.log("Connection updating")
        }
      }
      if(exists === false){
        conns.push({
        ip        : msg,
        startTime : Date.now(),
        ///end time to be implemented in timeout update
        socket    : socket
        });
        connsI.push({
          ip        : msg,
        startTime : Date.now(),
        ///end time to be implemented in timeout update
        });
        console.log("New Connection");
        update();
      }
    });

    //once a connection on another computer is done with the 
    //connection to the computer then it will call for all
    //related information to be pruged
    socket.on("goodBye", function(msg){
      for(var i = 0; i < conns.length; i ++){
        if(conns[i].socket.id === socket.id && conns[i].ip === msg){
          closeSocket(i);
        }
      }
    });

    //this is called by the browser on the local computer when it wishes
    //to transfer the Data file to the server for execution 
    //if the file is not recieved it will call for it agian 
    socket.on('data', function(msg){
      if(socket.handshake.address.search('127.0.0.1') >= 0){ 
        if(msg === undefined || msg == null){
          socket.emit('resendData');
        }
        else{
          console.log("Data recieved sending to be ran...");
          console.log(msg);
          exec('rm data.zip' , (err,stdout,stderr)=>{ 
            console.log(stdout);
            fs.writeFile("data.zip",msg, (err) => {
              if(err){
                console.log(err);
              }
              else{
                update();
              }
            });
          });
        }
      }
    });

    //this is called by the browser on the local computer when it wishes
    //to transfer the Result file to the server for execution
    //if the file is not recieved it will call for it agian 
    socket.on('result', function(msg){
      if(socket.handshake.address.search('127.0.0.1') >= 0){
        if(msg === undefined || msg == null) {
          socket.emit('resendResult');
        }
        else{
          exec('rm result.zip' , (err,stdout,stderr)=>{
            fs.writeFileSync("result.zip", msg, (err) => {
              if(err){
                //console.log(err);
              }
              else{
                update();
              }
            });
          });
        }
      }
    });

    //this is called by the browser on the local computer when it wishes
    //to transfer the Result file to the server for transmission
    //if the file is not recieved it will call for it agian 
    socket.on("setupBuffer", msg => {
      if(socket.handshake.address.search('127.0.0.1') >= 0){
        buffer = msg;
        update();
      }
    });

    //this is called by the browser on the local computer when it wishes
    //to inform the server of what mode it currently is in 
    //this is necessary for the proper execution of the code
    socket.on("setupMode", msg => { 
      if(socket.handshake.address.search('127.0.0.1') >= 0 && msg === "WORKER"){
        mode = 0;
      }
      else if(socket.handshake.address.search('127.0.0.1') >= 0 && msg === "VALIDATOR"){
        mode = 1;
      }
      else if(socket.handshake.address.search('127.0.0.1') >= 0 && msg === "USER"){
        mode = 2;
      }

      console.log("Your Mode is now: " + mode);
      update();
    });

    //this is sent by another computer to recieve the current file
    //(ex. the provider will send request to the user for the data)
    //there are different calls the two connections to ensure that the
    //data is received
    socket.on('request', (msg) =>{
      //check for valid connection
      console.log("Got:request and msg:" + msg);
      var tag = "data";
      var type = "WORKER";
      if(mode === 0){
        tag = "result";
        type = "VALIDATOR";
      }
      if(buffer !== undefined){
        socket.emit('transmitting' + msg, tag, buffer); 
        console.log("emit:transmitting to:" + msg + " with tag:" + tag );
      }
      else{
        console.log("NO FILE FOUND!!", "Please put the results within the field.", "warning");
      }
      socket.emit('fin'+ msg , tag);
      console.log("emit:fin to:" + msg + " with tag:" + tag);
    });
    socket.on('recieved', (msg) => {
      console.log("message was recieved");          
    });
  });

  //creates the server
  http.listen(3001 , function(){
      console.log('listening on: ' + ip);
  });
});

///////////////////////////////////////////////////////////////execution functions/////////////////////////////////////////////////////////////////////////////////////

//this function runs the code on a docker file
async function run(file, versionA){
  console.log("executing: " + file)
  if(versionA === ""){
    console.log('error!!!');
  }
  await exec('sudo docker run -i --rm -v $PWD:/tmp -w /tmp tensorflow/tensorflow:'+versionA+' python ./'+ file, (err,stdout,stderr)=>{ 
    if(err){
      //return;
      console.log(err);
    }
    console.log(stdout);
    if(mode === 0){
      rem(name);
    }
    else if(!err){
      ver = true;
    }
  });
}

//this will unzip a given file ( all files transmitted are required to be zipped)
async function unzipF(file){
    await exec('unzip ' + file , (err,stdout,stderr)=>{
        if(err){
            //console.log(err);
            //return;
            var s;
            for(var i = 0 ; i < conns.length; i++){
              if(conns[i].socket && conns[i].socket.handshake.address.search('127.0.0.1') >= 0){
                s = conns[i].socket;
                if(mode === 0 ){
                  s.emit('resendData');
                  training = false;
                }
                if(mode === 1 || mode === 2 ){
                  s.emit('resendResult');
                  training = false;
                }
              }
            }
        }
        console.log(stdout);
    });
}

//this calls train.py that will parse the file to generate the files that will be executed
async function genFiles(file){
    await exec('sudo docker run -i --rm -v $PWD:/tmp -w /tmp tensorflow/tensorflow:1.12.0 python train.py ' + file , (err,stdout,stderr)=>{
        if(err){
            return;
        }
        console.log(stdout);
    });
}

//this compares the accuracy that is from the provider and the accuracy that the validator that has calculated
async function comp(){
    if(mode !== 0){
        await exec('sudo docker run -i --rm -v $PWD:/tmp -w /tmp tensorflow/tensorflow:1.12.0 python  comp.py ' , (err,stdout,stderr)=>{
            if(err){
              return;
            }
            console.log(stdout);
        });
    }
}

//removes specific files for each mode
async function rem(file){
    if(mode === 0){
        await exec('rm execute.py' , (err,stdout,stderr)=>{
            if(err){
              return;
            }
            console.log(stdout);
          });
          exec('zip result.zip result.h5 result.txt eval.py version.json' , (err,stdout,stderr)=>{
            if(err){
              return;
            }
            console.log(stdout);
            exec('rm result.h5 result.txt eval.py version.json data.zip '+ file , (err,stdout,stderr)=>{
                if(err){
                  return;
                }
                training = false;
                version = '';
                name = '';
                console.log(stdout);
            });
          }); 
    }
    else{
        await    exec('rm result.h5 result.txt version.json eval.py result.zip eval.txt' , (err,stdout,stderr)=>{
                if(err){
                  return;
                }
                ver = false;
                console.log(stdout);
            });
    }
}

//gets the tensorflow version from the file that is generated by train.py
async function getVer(file){
    var obj = await JSON.parse(fs.readFileSync(file , 'utf8'));
    version = obj.ver;
    console.log(version);
    if(mode === 1){
      run("eval.py", version);
    }
}

//this will upload the validation result the server
async function uploadVal(){
  if(flag){
    flag = false;
    var f = false; 
    if(fs.readFileSync('fin.txt' , 'utf8').search('True') >= 0){
      f = true;
    }
    var s;
    for(var i = 0 ; i < conns.length; i++){
      if(conns[i].socket && conns[i].socket.handshake.address.search('127.0.0.1') >= 0){
        s = conns[i].socket;
        s.emit('uploadVal', f);
      }
    }
    exec('rm fin.txt' , (err,stdout,stderr)=>{});
  }
}

//this will upload the result file to the browser
async function uploadResult(){
  if(flag){
    flag = false;
    fs.readFile('result.zip', (err,data)=>{
      if(data !== undefined){ 
        console.log('uploading result');
        var s;
        for(var i = 0 ; i < conns.length; i++){
          if(conns[i].socket && conns[i].socket.handshake.address.search('127.0.0.1') >= 0){
            s = conns[i].socket;
            s.emit('uploadResult', data);
            console.log('uploading...');
          }
        }
      }
      else {
        flag = true;
        console.log("upload failed... Trying again now")
        uploadResult();
      }
    });
  }
}
/////////////////////////////////////////////////////////////////////////////file management section//////////////////////////////////////////////////////////////////////

//this will watch the current file forthe chagnes defined below.
fs.watch('.', (event, file)=>{
    //user mode case
    if(event === 'change' && file === 'result.zip' && mode === 2){ //user recieves files
        exec('mv result.zip ~/Downloads' , (err,stdout,stderr)=>{
            if(err){
              //console.log(err);
              //return;
            } 
            console.log(stdout);
          });
    }
    //validator mode cases
    else if(event === 'change' && file === 'result.zip' && mode === 1){
        unzipF(file);
        flag = true;
    }
    else if(event === 'change' && file === 'version.json' && mode === 1 && ver === false){
      ver = true;
      getVer(file);
    }
    else if(event === 'change' && file === 'eval.txt' && mode == 1){
        comp();
    }
    else if(event === 'change' && file === 'fin.txt' && mode === 1){
        rem('');
        uploadVal();
    }
    //provider mode cases
    else if(event === 'change' && file === 'data.zip' && mode === 0){
        unzipF(file);
        flag = true;
    }
    else if(event === 'change' && file.search('.py') >= 0 && file != 'execute.py' && file != 'eval.py' &&  mode === 0){
        genFiles(file); 
        name = file;
    }
    else if(event === 'change' && file === 'version.json' && mode === 0 && version === ''){
        getVer(file);
    }
    else if(event === 'change' && file === 'execute.py' && mode === 0){
        if(training === false){
            training = true;
            run(file, version);
        }
    }
    else if(event === 'change' && file === 'result.zip' && mode === 0){
      uploadResult();
    }
    //once the files have been run and excess has been deleted send back to the browser for submission
});