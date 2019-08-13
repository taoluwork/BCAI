/////////////////////////////////////////////////////////////////////////////////////////
// Unit test in truffle environment, tests findValidation                              //
// version 2.0.0                                                                       //  
// Align with sol 2.0.2                                                                //
// Author: Samuel Pritchett spritc6@lsu.edu                                            //  
/////////////////////////////////////////////////////////////////////////////////////////

//need a truffle environment to run this
//use: truffle test uintTest.js
var BCAI = artifacts.require("TaskContract");
//npm install -g truffle-assertions
const truffleAssert = require('truffle-assertions');
//npm install -g bignumber.js
var BigNumber = require('bignumber.js') //not used use web3.utils.BN [important]
//handle the BN is essential
var BN = web3.utils.toBN;
var totalGas = 0;
var showGas = true;

contract("BCAI", function(accounts) {
    it("Contract Deployment", function(){
        console.log(accounts);
        if(accounts != undefined) return true;
        else return false;
    })
    ///////////////////////////////////////////////////////////////////////
    it("Account 0 starts providing", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.startProviding(3000, 100, 8000, {from: accounts[0]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret,'SystemInfo',  (ev) => {
                    return ev.addr == accounts[0] && ev.info == web3.utils.asciiToHex('Provider Added');
                },'Provider event mismatch');

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [] );

            })
        })
    })

    it("Assign request to Account 0", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.startRequest(200, 90, 9000, web3.utils.fromAscii(45678), {from: accounts[1]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo',   (ev) => {
                    return ev.addr = accounts[1] && ev.info == web3.utils.asciiToHex('Request Added');
                }, "Account 0 Becomes Provider");
                
                truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                    return ev.reqAddr == accounts[1] && ev.provAddr == accounts[0]
                        && ev.info == web3.utils.asciiToHex('Request Assigned');
                },"Paired Account 0 to Request 1");

                return checkingPool(myContract,
                    [],
                    [],
                    [accounts[1]],
                    [])

            })
        })
    })

    it("Account 0 completes request, not enough validators", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.completeRequest(accounts[1], web3.utils.fromAscii(45678), {from: accounts[0]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) =>{
                    return ev.addr = accounts[1] && ev.info == web3.utils.asciiToHex('Request Computation Completed');
                }, 'Request Computation Completed');

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [accounts[1]])

            })
            .then(function(ret){
                return myContract.validateRequest(accounts[1], {from: accounts[0]})
                .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) =>{
                    return ev.addr == accounts[1] && ev.info == web3.utils.asciiToHex('Not Enough Validators');
                }, 'Request validation fails')

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [accounts[1]])

                })
            })
        })
    })

    it("Account 2, 3, 4 start providing, get assigned to validate", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.startProviding(3000, 100, 8000, {from: accounts[2]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                    return ev.addr == accounts[2] && ev.info == web3.utils.asciiToHex('Provider Added');
                }, "Account 2 Becomes Provider");

                truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                    return ev.reqAddr == accounts[1] && ev.provAddr == accounts[2]
                        && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                }, "Account 2 Assigned to validate")

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [accounts[1]])
            })
            .then(function(ret){
                return myContract.startProviding(3000, 100, 8000, {from: accounts[3]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr == accounts[3] && ev.info == web3.utils.asciiToHex('Provider Added');
                    }, "Account 3 Becomes Provider");

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[3]
                            && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                    }, "Account 3 Assigned to validate")

                    return checkingPool(myContract,
                        [accounts[0]],
                        [],
                        [],
                        [accounts[1]]
                        );
                })
            })
            .then(function(ret){
                return myContract.startProviding(3000, 100, 8000, {from: accounts[4]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr == accounts[4] && ev.info == web3.utils.asciiToHex('Provider Added');
                    }, "Account 4 Becomes Provider");

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[4]
                            && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                    }, "Account 4 Assigned to validate")

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr == accounts[1] && ev.info == web3.utils.asciiToHex('Enough Validators');
                    }, "Account 1's Request Has Enough Validators")

                    return checkingPool(myContract,
                        [accounts[0]],
                        [],
                        [],
                        [accounts[1]])

                })
            })
        })
    })

    it("Accounts 2-4 submit validations", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.submitValidation(accounts[1], true,{from: accounts[2]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                    return ev.reqAddr == accounts[1] && ev.provAddr == accounts[2]
                        && ev.info == web3.utils.asciiToHex('Validator Signed');
                }, 'Account 2 Signs Validation')
            })
            .then(function(ret){
                return myContract.submitValidation(accounts[1], true, {from: accounts[3]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[3]
                            && ev.info == web3.utils.asciiToHex('Validator Signed');
                    }, 'Account 3 Signs Validation')

                })
            })
            .then(function(ret){
                return myContract.submitValidation(accounts[1], true, {from: accounts[4]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[4]
                            && ev.info == web3.utils.asciiToHex('Validator Signed');
                    }, 'Account 4 Signs Validation')

                    return checkingPool(myContract,
                        [accounts[0], accounts[2], accounts[3], accounts[4]],
                        [],
                        [],
                        [accounts[1]])

                })
            })
        })
    })
})


function checkingPool(myContract, providers, pendPool, provPool, valiPool){
    return myContract.getProviderPool.call().then(function(pool){
        //console.log(pool);
        //expect(pool).deep.equal(pendPool);
        assert.deepEqual(providers, pool);
    })
    .then(function(){    
        return myContract.getPendingPool.call().then(function(pool){
        //console.log(pool);
        //expect(pool).deep.equal(pendPool);
        assert.deepEqual(pendPool, pool);
        })
    })
    .then(function(){
        return myContract.getProvidingPool.call().then(function(pool){
            //console.log(pool);
            assert.deepEqual(provPool, pool);
        })
    
    }).then(function(){
        return myContract.getValidatingPool.call().then(function(pool){
            //console.log(pool);
            assert.deepEqual(valiPool, pool);
        })
    })
}


function checkGas(ret){
    totalGas += ret.receipt.gasUsed;
    if(showGas) console.log("Gas used here = ", ret.receipt.gasUsed)
    //console.log("Total Gas = ", totalGas);
}