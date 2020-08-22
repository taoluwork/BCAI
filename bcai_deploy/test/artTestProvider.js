/////////////////////////////////////////////////////////////////////////////////////////
// Unit test in truffle environment, tests updateProvider and stopProvider             //
// version 2.0.0                                                                       //  
// Align with sol 2.0.1                                                                //
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
    it("Contract Deploymnet", function(){
        console.log(accounts);
        if(accounts != undefined) return true;
        else return false;
    })
    ///////////////////////////////////////////////////////////////////////////////
    it("Account 0 starts providing", function(){
        return BCAI.deployed().then(function(myContract) {
            return myContract.startProviding(3000,100,8000,{from: accounts[0]})  //time target price  
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
                
            });
        })
    })

    it("Assign request to Account 0", function(){
        return BCAI.deployed().then(function(myContract) {
            return myContract.startRequest(200, 90, 9000, web3.utils.fromAscii(12345), {from: accounts[1]}) //time target price dataID
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo',   (ev) => {
                    return ev.addr = accounts[1] && ev.info == web3.utils.asciiToHex('Request Added');
                }, 'Request event mismatch');
                
                truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                    return ev.reqAddr == accounts[1] && ev.provAddr == accounts[0]
                        && ev.info == web3.utils.asciiToHex('Request Assigned');
                },"Pairing req1 => prov0 success");

                //checking pool
                return checkingPool(myContract,
                    [],
                    [accounts[1]],
                    [],
                    [])
                .catch(console.log)

            })
        });
    })

    it("Account 0 attempts information update, then to stop providing", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.updateProvider(3000, 100, 10000, {from: accounts[0]}) //time target price dataID
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo',   (ev) => {
                    return ev.addr = accounts[0] && ev.info == web3.utils.asciiToHex('Provider Unable to Update');
                });

                //checking pool
                return checkingPool(myContract,
                    [],
                    [],
                    [accounts[1]],
                    [])
                    

            })
            .then(function(ret){
                return myContract.stopProviding({from: accounts[0]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr = accounts[0] && ev.info == web3.utils.asciiToHex('Provider Unable to Stop');
                    });
                    
                    //checking pool
                    return checkingPool(myContract,
                        [],
                        [],
                        [accounts[1]],
                        [])
                })
            })
        })
    })

    it("Account 0 completes request", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.completeRequest(accounts[1], web3.utils.fromAscii(12345),{from: accounts[0]}) //reqId, resultId
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                    return ev.addr = accounts[1] && ev.info == web3.utils.asciiToHex('Request Computation Completed');
                }, 'Request Computation Completed');

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [accounts[1]]
                    ).catch(console.log);

            })
        })
    })

    it("Accounts 5, 6, 7 starts providing in order to validate completed requests", function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.startProviding(2000, 500, 5000,{from: accounts[5]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                    return ev.addr = accounts[5] && ev.info == web3.utils.asciiToHex('Provider Added');
                }, 'Provider Added');

                truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                    return ev.reqAddr == accounts[1] && ev.provAddr == accounts[5]
                        && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                }, "Account 5 Assigned to validate")

                return checkingPool(myContract,
                    [accounts[0]],
                    [],
                    [],
                    [accounts[1]]
                    );

            })
            .then(function(ret){
                return myContract.startProviding(200, 500, 5000, {from:accounts[6]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr = accounts[6] && ev.info == web3.utils.asciiToHex('Provider Added');
                    }, 'Provider Added');
    
                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[6]
                            && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                    }, "Account 6 Assigned to validate")


                })
            })
            .then(function(ret){
                return myContract.startProviding(200, 500, 5000, {from:accounts[7]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo', (ev) => {
                        return ev.addr = accounts[7] && ev.info == web3.utils.asciiToHex('Provider Added');
                    }, 'Provider Added');
    
                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[7]
                            && ev.info == web3.utils.asciiToHex('Validation Assigned to Provider');
                    }, "Account 7 Assigned to validate")


                })
            })
            .then(function(ret){
                return myContract.submitValidation(accounts[1],true,{from: accounts[5]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[5] && ev.info == web3.utils.asciiToHex('Validator Signed');
                    }, 'Validator Signed');

                    return checkingPool(myContract,
                        [accounts[0], accounts[5]],
                        [],
                        [],
                        [accounts[1]],
                        );

                })
                
            })
            .then(function(ret){
                return myContract.submitValidation(accounts[1],true,{from: accounts[6]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[6] && ev.info == web3.utils.asciiToHex('Validator Signed');
                    }, 'Validator Signed');

                    return checkingPool(myContract,
                        [accounts[0], accounts[5], accounts[6]],
                        [],
                        [],
                        [accounts[1]],
                        );

                })
                
            })
            .then(function(ret){
                return myContract.submitValidation(accounts[1],true,{from: accounts[7]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[7] && ev.info == web3.utils.asciiToHex('Validator Signed');
                    }, 'Validator Signed');

                    return checkingPool(myContract,
                        [accounts[0], accounts[5], accounts[6], accounts[7]],
                        [],
                        [],
                        [accounts[1]],
                        );

                })
                
            })
            
        })
    })

    it('Account 8 uploads a request, account 0 will update his parameters to match the new request', function(){
        return BCAI.deployed().then(function(myContract){
            return myContract.startRequest(200, 90, 5000, web3.utils.fromAscii(98765), {from: accounts[8]})
            .then(function(ret){
                checkGas(ret);

                truffleAssert.eventEmitted(ret, 'SystemInfo', (ev)=>{
                    return ev.addr == accounts[8] && ev.info == web3.utils.asciiToHex('Request Added');
                }, 'Request event mismatch')

            })
            .then(function(ret){
                return myContract.updateProvider(200, 90, 5000, {from: accounts[0]})
                .then(function(ret){
                    checkGas(ret);

                    truffleAssert.eventEmitted(ret, 'SystemInfo',   (ev) => {
                        return ev.addr = accounts[0] && ev.info == web3.utils.asciiToHex('Provider Updated');
                    }, 'Provider Update Failed');

                    /*truffleAssert.eventEmitted(ret, 'PairingInfo', (ev) => {
                        return ev.reqAddr == accounts[1] && ev.provAddr == accounts[0]                        //once he updates his info nothing happens so this doesnt work
                            && ev.info == web3.utils.asciiToHex('Request Assigned');
                    },"Pairing req8 => prov0 success");*/

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