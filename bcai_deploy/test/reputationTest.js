////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test in truffle environment, tests basic contract functions                                       //
// version 0.1, align with reputation v0.1       
// NOTE: the whole point of truffle unit test is that the testnet is reset everytime you run this
// The change cannot be stored and you can assume everything is fresh, in comparison to "real" testnet Ropsten or Rinkby                                                         
////////////////////////////////////////////////////////////////////////////////////////////////////////////


//need a truffle environment to run this
//use: truffle test uintTest.js
var BCAI = artifacts.require("TaskContract");
var Rep = artifacts.require("Reputation")
const truffleAssert = require('truffle-assertions');
//handle the BN is essential
var BN = web3.utils.toBN;
var totalGas = 0;


contract("Rep", function(accounts) {
    it("Contract Deploymnet", function(){
        console.log(accounts);
        if(accounts != undefined) return true;
        else return false;
    })
    ///////////////////////////////////////////////////////////////////////////////
    it("Test Rate", function(){
        return Rep.deployed().then(function(myContract) {
            return myContract.Rate(accounts[1],5,{from: accounts[0]})  //time target price  
            .then(function(ret){
                console.log(ret);
                checkGas(ret);
                //myContract.localCount().call().then(ret => {
                //    console.log(ret);
                //})
            });
        })
    })
    it("Test localCount", ()=>{
        return Rep.deployed().then((myContract)=>{
            return myContract.localCount().then(ret=>{
                console.log("Return from the view function:")
                console.log(ret);
                checkGas(ret);
            })
        })
    })
/*
    it("Test Remote", function(){
        return Rep.deployed().then(function(myContract) {
            return myContract.remoteCount()  //time target price  
            .then(function(ret){
                console.log(ret);
                //myContract.remoteCount().then( ret => {
                //    console.log(ret)
                //})
                
                
                //check the event using receipt
                //truffleAssert.prettyPrintEmittedEvents(ret);
            });
        })
    })*/

})


/*

contract("BCAI", function(accounts) {
    ///////////////////////////////////////////////////////////////////////////////
    it("Test Providing", function(){
        return BCAI.deployed().then(function(myContract) {
            return myContract.startProviding(3000,100,8000,{from: accounts[0]})  //time target price  
            .then(function(ret){
                console.log("****************************")
                console.log(ret);
            });
        })
    })
})
*/

//gas helper
function checkGas(ret){
    totalGas += ret.receipt.gasUsed;
    console.log("Gas used here = ", ret.receipt.gasUsed)
    console.log("Total Gas = ", totalGas);
}