//load packages
//variables
var addresses = [];
var pendingPool = [];
var providerPool = [];
var providingPool = [];
var validatorPool = [];
var currentPoolType = "none";
var baseurl = "http://localhost:3001";
var address = "";
var passHold= "";
var doasync = true;

//get elements
var addressBar        = document.getElementById("AddressBar");
var poolBody          = document.getElementById("poolBody");

var passwordContainer = document.getElementById("passwordContainer");
passwordContainer.style.display = "none";
var passwordVal       = document.getElementById("passwordVal");
var submitPassword    = document.getElementById("submitPassword");

var startProvidingForm     = document.getElementById("startProvidingForm");
var stopProvidingForm      = document.getElementById("stopProvidingForm");
startProvidingForm.style.display  = "block";
stopProvidingForm.style.display   = "none";

var startProvidingSubmit      = document.getElementById("startProvidingSubmit");
var stopProvidingSubmit       = document.getElementById("stopProvidingSubmit");

var balanceText = document.getElementById('balanceText');
var ratingText = document.getElementById('ratingText');
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

//listeners
startProvidingSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    startProviding()     
});
stopProvidingSubmit.addEventListener("click", ()=>{ 
    event.preventDefault();
    stopProviding();
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
    this.stopProvidingSubmit.disabled = true;
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
            document.getElementById("dropdownMenuButton").innerHTML = "Address" + address;
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
        getRating();
        getStatus();
    }
},5000);


//cli call functions
function getAddresses(){
    $.ajaxSetup({async: false}); //For some reason, initial getaddresses does not work unless async is false
    $.ajax({     
        type: "GET",
        url: baseurl + '/accounts',
        success: function (result) {
            console.log(result);
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

function getRating() {
    $.ajaxSetup({async: doasync});  
    $.ajax({     
        type: "GET",
        url: baseurl + '/rating',
        success: function (result) {
            console.log(result);
            var rating = result.Rating;
            ratingText.innerText = "Rating: " + rating;
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
            console.log(result);
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

function startProviding() {
    startProvidingSubmit.disabled = true;
    var data = {
        Account: address,
        password: passHold
    };
    $.ajaxSetup({ async: doasync });
    $.ajax({
        type: "POST",
        url: baseurl + '/startProviding',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
            startProvidingSubmit.disabled = true; //enable/disable appropriate buttons
            stopProvidingSubmit.disabled = false;
            startProvidingForm.style.display = "none";
            stopProvidingForm.style.display = "block";
        }
    });
}

function stopProviding() {
    stopProvidingSubmit.disabled = true;
    var data = {
        Account: address,
        password: passHold
    };
    $.ajaxSetup({ async: doasync });
    $.ajax({
        type: "POST",
        url: baseurl + '/stopProviding',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data), //this is the sent json data
        success: function (result) {
            console.log(result);
            startProvidingSubmit.disabled = false; //enable/disable appropriate buttons
            stopProvidingSubmit.disabled = true;
            startProvidingForm.style.display = "block";
            stopProvidingForm.style.display = "none";
        }
    });
}