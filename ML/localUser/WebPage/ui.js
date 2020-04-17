//load packages
//variables
var addresses = [];
var pendingPool = [];
var providerPool = [];
var providingPool = [];
var validatorPool = [];
var historyPool = [];
var currentPoolType = "none";
var baseurl = "http://localhost:3000";
var address = "";
var passHold= "";
var doasync = true;

//get elements
var addressBar        = document.getElementById("AddressBar");
var poolBody          = document.getElementById("poolBody");
var historyBody       = document.getElementById("historyBody");

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
var historyPoolSel       = document.getElementById("historyPoolSel");
var nonePoolSel          = document.getElementById("nonePoolSel");

var poolContainer        = document.getElementById("poolContainer");
var historyContainer     = document.getElementById("historyContainer");
poolContainer.style.display      = "none";
historyContainer.style.display   = "none";

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

pendingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(pendingPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    $("#pendingPoolSel").addClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#historyPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
providerPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providerPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").addClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#historyPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
providingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providingPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").addClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#historyPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
validatingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(validatorPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").addClass("selected");
    $("#historyPoolSel").removeClass("selected");
    $("#nonePoolSel").removeClass("selected");
}); 
historyPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadHistory();
    poolContainer.style.display      = "none";
    historyContainer.style.display   = "block";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#historyPoolSel").addClass("selected");
    $("#nonePoolSel").removeClass("selected");
});
nonePoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    poolContainer.style.display      = "none";
    historyContainer.style.display   = "none";
    $("#pendingPoolSel").removeClass("selected");
    $("#providerPoolSel").removeClass("selected");
    $("#providingPoolSel").removeClass("selected");
    $("#validatingPoolSel").removeClass("selected");
    $("#historyPoolSel").removeClass("selected");
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
        reqAddr.innerHTML =  pool[0];
        
        row.appendChild(headElem);
        row.appendChild(reqAddr);
        poolBody.appendChild(row);
    }
}

function loadHistory(){
    var childElem = historyBody.lastElementChild;
    while(childElem){
        historyBody.removeChild(childElem);
        childElem = historyBody.lastElementChild;
    }
    for(var i = 0 ; i < historyPool.length; i++){
        var row      = document.createElement("TR");
        var headElem = document.createElement("TH");
        headElem.innerHTML = i+1;
        headElem.scope = "row";

        var type     = document.createElement("TD");
        type.innerHTML =  historyPool[i][0];
        
        var reqAddr  = document.createElement("TD");
        reqAddr.innerHTML =  historyPool[i][1];
        
        row.appendChild(headElem);
        row.appendChild(type);
        row.appendChild(reqAddr);
        historyBody.appendChild(row);
    }
}

setInterval(function update(){
    getAddresses();
    loadAddr();
    if(address != ""){
        getPools();
        getHistory();
        loadHistory();
        getBalance();
        getStatus();
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

function getStatus() {
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/status',
        success: function (result) {
            console.log(result);
            var status = result.Status;
            statusText.innerText = "Status: " + status;
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
function getHistory(){
    var data = {
        Account: address
    };
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/history',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            // console.log(result);
            var hist = result.History;
            historyPool = []
            for(var i= 0 ; i < hist.length; i++){
                historyPool.push([hist[i].Action, hist[i].RequestAddr])
            }
        }
    });
}
function startTask(startFile){
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
            startTaskForm.style.display = "block";
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
            startTaskForm.style.display = "none";
        }
    });
}
