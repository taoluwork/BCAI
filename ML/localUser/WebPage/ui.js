//load packages
//variables
var addresses = [];
var pendingPool = [];
var providerPool = [];
var providingPool = [];
var validatorPool = [];
var choices = [];
var currentPoolType = "none";
var baseurl = "http://localhost:3000";
var address = "";
var passHold= "";
var doasync = true;

//Status from CLI webpagestatus.txt
var status = undefined;
//Make sure after it's submitted, doesn't make container visible again before status changed
var provChoiceShown = false;
var valChoiceShown = false;
var ratingShown = false;

var taskSubmitted = false;

//get elements
var addressBar        = document.getElementById("AddressBar");
var poolBody          = document.getElementById("poolBody");

var provChoiceContainer     = document.getElementById("provChoiceContainer");
var provChoiceTable         = document.getElementById("provChoiceTable");
var provChoiceBody          = document.getElementById("provChoiceBody");
var provChoiceValue         = document.getElementById("provChoiceValue");
var provChoiceSubmit        = document.getElementById("provChoiceSubmit");
provChoiceContainer.style.display = "none";

var valChoiceContainer     = document.getElementById("valChoiceContainer");
var valChoiceTable         = document.getElementById("valChoiceTable");
var valChoiceBody          = document.getElementById("valChoiceBody");
var valChoiceValue         = document.getElementById("valChoiceValue");
var valChoiceSubmit        = document.getElementById("valChoiceSubmit");
valChoiceContainer.style.display = "none";

var ratingContainer     = document.getElementById("ratingContainer");
var ratingValue         = document.getElementById("ratingValue");
var ratingSubmit        = document.getElementById("ratingSubmit");
ratingContainer.style.display = "none";

var passwordContainer = document.getElementById("passwordContainer");
passwordContainer.style.display = "none";
var passwordVal       = document.getElementById("passwordVal");
var submitPassword    = document.getElementById("submitPassword");

var startTaskForm     = document.getElementById("startTaskForm");
var stopTaskForm      = document.getElementById("stopTaskForm");

startTaskForm.style.display  = "block";
stopTaskForm.style.display   = "none";

var startTaskSubmit      = document.getElementById("startTaskSubmit");
var stopTaskSubmit       = document.getElementById("stopTaskSubmit");
   
var startTaskFile        = document.getElementById("startTaskFilePath");

var balanceText = document.getElementById('balanceText');
var statusText = document.getElementById('statusText');
   
var pendingPoolSel       = document.getElementById("pendingPoolSel");
var providerPoolSel      = document.getElementById("providerPoolSel");
var providingPoolSel     = document.getElementById("providingPoolSel");
var validatingPoolSel    = document.getElementById("validatingPoolSel");
var nonePoolSel          = document.getElementById("nonePoolSel");

var poolContainer        = document.getElementById("poolContainer");
poolContainer.style.display      = "none";

submitPassword.addEventListener("click", (event)=>{
    event.preventDefault();
    passHold = passwordVal.value;
    passwordContainer.style.display = "none";
});

startTaskSubmit.addEventListener("click", (event)=>{ 
    event.preventDefault();
    startTask(startTaskFile.value )
});
stopTaskSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    stopTask()
});

provChoiceSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    chooseProvider(provChoiceValue.value);
    
});

valChoiceSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    chooseValidator(valChoiceValue.value);
    
});

ratingSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    rate(ratingValue.value);
    
});

pendingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(pendingPool);
    poolContainer.style.display      = "block";
    $("#pendingPoolSel").addClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
providerPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providerPool);
    poolContainer.style.display      = "block";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").addClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
providingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providingPool);
    poolContainer.style.display      = "block";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").addClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
validatingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(validatorPool);
    poolContainer.style.display      = "block";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").addClass("selected");
    $("#nonePoolSel").removeClass("selected");
}); 

nonePoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    poolContainer.style.display      = "none";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#nonePoolSel").addClass("selected");
});

//Runs when page loads
window.onload = function() { 
    this.stopTaskSubmit.disabled = true;
    getAddresses(); // run loadAddr when page loads
    loadAddr();
};
//loadInfo
function loadAddr(){
    var childElem = addressBar.lastElementChild;
    while(childElem){
        addressBar.removeChild(childElem);
        childElem = addressBar.lastElementChild;
    }
    // if(addresses.length == 0){
    //     var btn = document.createElement("TEXT");
    //     btn.innerHTML = "No addresses loaded";
    //     btn.className = "btn btn-secondary";
    //     addressBar.appendChild(btn);
    // }
    for(var i = 0 ; i < addresses.length; i++){
        //<button type="button" class="btn btn-secondary">addressPlaceHolder1</button>
        if(i == 0 && !address) { //Set first address by default if null and address is found
            if(addresses[i]) {
                address = addresses[i];
                document.getElementById("dropdownMenuButton").innerHTML = "Address: " + address;
                passwordContainer.style.display = "block";
                passHold = "";
            }
        }
        var btn = document.createElement("BUTTON");
        btn.innerHTML = addresses[i];
        btn.className = address == addresses[i] ? "dropdown-item btn selected" : "dropdown-item btn"; //Add selected class if this is selected address
        btn.type="button";
        btn.id = "addressNumb"+i;
        addressBar.appendChild(btn);
        document.getElementById("addressNumb"+i).addEventListener("click",(event)=>{
            passwordContainer.style.display = "block";
            passHold = "";
            address = event.srcElement.innerHTML
            document.getElementById("dropdownMenuButton").innerHTML = "Address: " + address;
            console.log(event.srcElement.innerHTML +"=="+ address)
            var thisaddress = event.srcElement.id.replace("addressNumb", "");
            for(var j = 0; j < addresses.length; j++) {
                if(j == thisaddress) { //Set this button to selected
                    $("#addressNumb"+j).addClass("selected");
                }
                else { //set all others to not selected
                    $("#addressNumb"+j).removeClass("selected");
                }
            }
        });
    }
}

function loadProvChoices() {
    var provchildElem = provChoiceBody.lastElementChild;
    var valchildElem = valChoiceBody.lastElementChild;
    //Clear current rows, excluding header row
    for(var i = 1; i <= provChoiceTable.rows.length; i++) {
        try {
            provChoiceTable.deleteRow(1);
            valChoiceTable.deleteRow(1);
        }
        catch(err) {

        }
    }

    for(var i = 0 ; i < choices.length; i++){

        var row      = document.createElement("TR");
        var headElem = document.createElement("TH");
        headElem.innerHTML = i+1;
        headElem.scope = "row";
        
        var reqAddr  = document.createElement("TD");
        reqAddr.innerHTML =  choices[i];
        
        row.appendChild(headElem);
        row.appendChild(reqAddr);

        provChoiceBody.appendChild(row);
    }
    for(var i = 0 ; i < choices.length; i++){

        var row      = document.createElement("TR");
        var headElem = document.createElement("TH");
        headElem.innerHTML = i+1;
        headElem.scope = "row";
        
        var reqAddr  = document.createElement("TD");
        reqAddr.innerHTML =  choices[i];
        
        row.appendChild(headElem);
        row.appendChild(reqAddr);

        valChoiceBody.appendChild(row);
    }
}

function loadPool(pool){

    var childElem = poolBody.lastElementChild;
    while(childElem){
        poolBody.removeChild(childElem);
        childElem = poolBody.lastElementChild;
    }

    for(var i = 0 ; i < pool.length; i++){

        var row      = document.createElement("TR");
        var headElem = document.createElement("TH");
        headElem.innerHTML = i+1;
        headElem.scope = "row";
        
        var reqAddr  = document.createElement("TD");
        reqAddr.innerHTML =  pool[i];
        
        row.appendChild(headElem);
        row.appendChild(reqAddr);
        poolBody.appendChild(row);
    }
}

setInterval(function update(){
    getAddresses();
    loadAddr();
    if(address != ""){
        getPools();
        getBalance();
        getStatus();
        checkStatus();
        getProvChoices();
        loadProvChoices();
    }
},5000);


//cli call functions
function getAddresses(){
    $.ajaxSetup({async: false});  //For some reason, initial getaddresses does not work unless async is false
    $.ajax({     
        type: "GET",
        url: baseurl + '/accounts',
        success: function (result) {
            // console.log(result);
            addresses = []
            var addr = result.Addresses;
            for(var i=0 ; i < addr.length; i++){
                addresses.push(addr[i].Address);
            }
        }
    });
}

function getBalance() {
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/balance',
        success: function (result) {
            console.log(result);
            var balance = result.Balance;
            balanceText.innerText = "Balance: " + balance;
        }
    });
}


/* Statuses should occur in the following order:
1) Set by execute.py when hosting starts
    Waiting for file to finish hosting.
    [Percentages of files hosting]
2) Set by execute.py when hosting finishes
***Will indicate to this page that it should open the provider choosing form
    Finished hosting file. Please choose a provider, then we will start sending the file.
    [Percentages of file transfer]
3) Set by execute.py when /finish signal received
    Provider downloaded file. Once they execute it, you must choose a validator.
4) Set by userCLI.js once it's time to choose validator
***Will indicate to this page that it should open the validator choosing form
    Provider finished executing file. Please choose a validator.
5) Set by execute.py once it starts downloading the file from the provider.
    Downloading the result from the provider. This may take a while.
6) Set by userCLI.js once a rating can go through
***Will indicate to this page that it should open the rating/finalize form
    Finished downloading result file. Please check it then provide a rating.
7) Set by userCLI.js once request is finalized
    Rating submitted. Your task is completed.
*/

function getStatus() {
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/status',
        success: function (result) {
            console.log(result);
            status = result.Status;
            statusText.innerText = "Status:\n" + status;
        }
    });
}

function checkStatus() {
    if(status.includes("Please choose a provider") && !provChoiceShown && taskSubmitted) {
        provChoiceContainer.style.display = "block";
        provChoiceShown = true;
    }
    else if(status.includes("Please choose a validator") && !valChoiceShown) {
        valChoiceContainer.style.display = "block";
        valChoiceShown = true;
    }
    else if(status.includes("Please check it then provide a rating") && !ratingShown) {
        ratingContainer.style.display = "block";
        ratingShown = true;
    }
    else if(status.includes("Rating submitted")) { //reset flags after task is completed
        provChoiceShown = false;
        valChoiceShown = false;
        ratingShown = false;
        taskSubmitted = false;
    }
}

function getProvChoices() {
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/getProvChoices',
        success: function (result) {
            console.log(result);
            choices = result.Choices;
        }
    });
}

function chooseProvider(choice){
    provChoiceSubmit.disabled = true;
    //Send value of address and rating row
    var choicevalue = provChoiceTable.rows[choice].cells[1].innerText;
    var data = {
        choice: choicevalue
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/chooseProvider',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            // console.log(result);
            provChoiceSubmit.disabled = true; //enable/disable appropriate buttons
            provChoiceContainer.style.display = "none";
        }
    });
}

function chooseValidator(choice){
    valChoiceSubmit.disabled = true;
    //Send value of address and rating row
    var choicevalue = provChoiceTable.rows[choice].cells[1].innerText;
    var data = {
        choice: choicevalue
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/chooseValidator',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            // console.log(result);
            valChoiceSubmit.disabled = true; //enable/disable appropriate buttons
            valChoiceContainer.style.display = "none";
        }
    });
}

function rate(rating){
    ratingSubmit.disabled = true;
    //Send value of address and rating row
    var data = {
        rating: rating
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/rate',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            // console.log(result);
            ratingSubmit.disabled = true; //enable/disable appropriate buttons
            ratingContainer.style.display = "none";
        }
    });
}

function getPools(){
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/pools',
        success: function (result) {
            // console.log(result);
            var provPool    = result.ActiveProviderAddresses;
            var valiPool    = result.ValidatingAddresses;
            var pendPool    = result.PendingAddresses;
            var provingPool = result.ProvidingAddresses;
            providerPool = [];
            providingPool = [];
            validatorPool = [];
            pendingPool = [];
            for(var i = 0 ; i < provPool.length; i++){
                providerPool.push(provPool[i].Address)
            }
            for(var i = 0 ; i < valiPool.length; i++){
                validatorPool.push(valiPool[i].Address)
            }
            for(var i = 0 ; i < pendPool.length; i++){
                pendingPool.push(pendPool[i].Address)
            }
            for(var i = 0 ; i < provingPool.length; i++){
                providingPool.push(provingPool[i].Address)
            }
        }
    });
}

function startTask(startFile){
    startTaskSubmit.disabled = true;
    var data = {
        file: startFile,
        Account: address,
        password: passHold
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/startTask',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            // console.log(result);
            startTaskSubmit.disabled = true; //enable/disable appropriate buttons
            stopTaskSubmit.disabled = false;
            startTaskForm.style.display = "none";
            stopTaskForm.style.display = "block";
            taskSubmitted = true;
        }
    });
}

function stopTask(){
    var data = {
        Account: address,
        password: passHold
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/stopTask',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
            startTaskSubmit.disabled = false; //enable/disable appropriate buttons
            stopTaskSubmit.disabled = true;
            startTaskForm.style.display = "block";
            stopTaskForm.style.display = "none";
        }
    });
}
