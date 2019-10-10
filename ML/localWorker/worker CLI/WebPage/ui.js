//load packages
//variables
var addresses = ["asdf"];
var pendingPool = ["a"];
var providerPool = ["b"];
var providingPool = ["c"];
var validatorPool = ["d"];
var historyPool = [["actionA", "B"]];
var currentPoolType = "none";
var baseurl = "http://localhost:3000";
var address = "0x40657BF5292750477fd7BC048078c7D39055E6a9";

//get elements
var addressBar        = document.getElementById("AddressBar");
var poolBody          = document.getElementById("poolBody");
var historyBody       = document.getElementById("historyBody");

var startProvidingForm     = document.getElementById("startProvidingForm");
var updateProviderForm    = document.getElementById("updateProviderForm");
var stopProvidingForm      = document.getElementById("stopProvidingForm");
startProvidingForm.style.display  = "none";
updateProviderForm.style.display = "none";
stopProvidingForm.style.display   = "none";

var startProvidingSubmit      = document.getElementById("startProvidingSubmit");
var updateProviderSubmit     = document.getElementById("updateProviderSubmit");
var stopProvidingSubmit       = document.getElementById("stopProvidingSubmit");
   
var startProvidingTime        = document.getElementById("startProvidingTime");
var updateProviderTime       = document.getElementById("updateProviderTime");
   
var startProvidingAcc         = document.getElementById("startProvidingAccuracy");
var updateProviderAcc        = document.getElementById("updateProviderAccuracy");
   
var startProvidingCost        = document.getElementById("startProvidingCost");
var updateProviderCost       = document.getElementById("updateProviderCost");
   
var startProvidingFile        = document.getElementById("startProvidingFilePath");
var updateProviderFile       = document.getElementById("updateProviderFilePath");
   
var startActionSel       = document.getElementById("startActionSel");
var updateActionSel      = document.getElementById("updateActionSel");
var stopActionSel        = document.getElementById("stopActionSel");
var noneActionSel        = document.getElementById("noneActionSel");
   
var pendingPoolSel       = document.getElementById("pendingPoolSel");
var providerPoolSel      = document.getElementById("providerPoolSel");
var providingPoolSel     = document.getElementById("providingPoolSel");
var validatingPoolSel    = document.getElementById("validatingPoolSel");
var historyPoolSel       = document.getElementById("historyPoolSel");
var nonePoolSel          = document.getElementById("nonePoolSel");

var pendingpoolHeader    = document.getElementById("pendingPoolHeader");
var providerpoolHeader   = document.getElementById("providerPoolHeader");
var providingpoolHeader  = document.getElementById("providingPoolHeader");
var validatingPoolHeader = document.getElementById("validatingPoolHeader");
pendingpoolHeader.style.display    = "none";
providerpoolHeader.style.display   = "none";
providingpoolHeader.style.display  = "none";
validatingPoolHeader.style.display = "none";

var poolContainer        = document.getElementById("poolContainer");
var historyContainer     = document.getElementById("historyContainer");
poolContainer.style.display      = "none";
historyContainer.style.display   = "none";

//listeners
startProvidingSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
     
});
updateProviderSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    
});
stopProvidingSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
     
});

startActionSel.addEventListener("click", ()=>{
    event.preventDefault();
    startProvidingForm.style.display  = "block";
    updateProviderForm.style.display = "none";
    stopProvidingForm.style.display   = "none";

});
updateActionSel.addEventListener("click", ()=>{
    event.preventDefault();
    startProvidingForm.style.display  = "none";
    updateProviderForm.style.display = "block";
    stopProvidingForm.style.display   = "none";

});
stopActionSel.addEventListener("click", ()=>{
    event.preventDefault();
    startProvidingForm.style.display  = "none";
    updateProviderForm.style.display = "none";
    stopProvidingForm.style.display   = "block";
});
noneActionSel.addEventListener("click", ()=>{
    event.preventDefault();
    startProvidingForm.style.display  = "none";
    updateProviderForm.style.display = "none";
    stopProvidingForm.style.display   = "none";
});

pendingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(pendingPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    pendingpoolHeader.style.display    = "block";
    providerpoolHeader.style.display   = "none";
    providingpoolHeader.style.display  = "none";
    validatingPoolHeader.style.display = "none";
});
providerPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providerPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    pendingpoolHeader.style.display    = "none";
    providerpoolHeader.style.display   = "block";
    providingpoolHeader.style.display  = "none";
    validatingPoolHeader.style.display = "none";
});
providingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(providingPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    pendingpoolHeader.style.display    = "none";
    providerpoolHeader.style.display   = "none";
    providingpoolHeader.style.display  = "block";
    validatingPoolHeader.style.display = "none";
});
validatingPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadPool(validatorPool);
    poolContainer.style.display      = "block";
    historyContainer.style.display   = "none";
    pendingpoolHeader.style.display    = "none";
    providerpoolHeader.style.display   = "none";
    providingpoolHeader.style.display  = "none";
    validatingPoolHeader.style.display = "block";
}); 
historyPoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    loadHistory();
    poolContainer.style.display      = "none";
    historyContainer.style.display   = "block";
});
nonePoolSel.addEventListener("click", ()=>{
    event.preventDefault();
    poolContainer.style.display      = "none";
    historyContainer.style.display   = "none";
});

//loadInfo
function loadAddr(){
    var childElem = addressBar.lastElementChild;
    while(childElem){
        addressBar.removeChild(childElem);
        childElem = addressBar.lastElementChild;
    }
    if(addresses.length == 0){
        var btn = document.createElement("TEXT");
        btn.innerHTML = "No addresses loaded";
        btn.className = "btn btn-secondary";
        addressBar.appendChild(btn);
    }
    for(var i = 0 ; i < addresses.length; i++){
        //<button type="button" class="btn btn-secondary">addressPlaceHolder1</button>
        var btn = document.createElement("BUTTON");
        btn.innerHTML = addresses[i];
        btn.className = "btn btn-secondary";
        addressBar.appendChild(btn);
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
    //call api functions
    getAddresses();
    getPools();
    getHistory();
    //reload info
    loadAddr();
    loadHistory();
},5000);


//cli call functions
function getAddresses(){
    $.ajaxSetup({async: false});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/accounts',
        success: function (result) {
            console.log(result);
            
        }
    });
}
function getPools(){
    $.ajaxSetup({async: false});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/pools',
        success: function (result) {
            console.log(result);
        }
    });
}
function getHistory(){
    var data = {
        Account: address
    };
    $.ajaxSetup({async: false});  
    $.ajax({     
        type: "POST",
        url: baseurl + '/history',
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
        }
    });
}

function startProviding(time, accuracy, cost) {
    var data = {
        time: time,
        accuracy: accuracy,
        cost: cost,
        Account: address
    };
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "POST",
        url: baseurl + '/startProviding',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
        }
    });
}

function updateProvider(time, accuracy, cost) {
    var data = {
        time: time,
        accuracy: accuracy,
        cost: cost
    };
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "POST",
        url: baseurl + '/updateProvider',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
        }
    });
}

function stopProviding() {
    $.ajaxSetup({ async: false });
    $.ajax({
        type: "GET",
        url: baseurl + '/stopProviding',
    });
}