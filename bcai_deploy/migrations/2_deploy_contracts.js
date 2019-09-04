// update: this file is updated to deploy two contracts at the same time
// the second contract will rely on the first's address

//NOTE: in practice, it is not necessary to deploy two contracts at the same time,
//I did this only because truffle test will reset the testnet so the predeployed will be reset.
//If you know the pre-deployed contracts' address, it is possible to use it directly on Ropsten
//An example can be found in comment below.




var BCAI = artifacts.require("TaskContract");
var reput = artifacts.require("Reputation");
//cannot use .sol name

module.exports = function(deployer) {
    // deployment steps, one after another to use the address
    deployer.deploy(BCAI)
    .then(()=> {
        console.log("Deployed:")
        console.log(BCAI.address)
    })
    .then(()=>{
        return deployer.deploy(reput, BCAI.address)
        //NOTE: the "return" here is very important as a pitfall.
        // if missing this return, deployment of reput is not guarenteed to finish
        // have a try to delete "return", which will result in wield error hard to debug
    })
    .then(()=>{
        console.log("Rep:")
        console.log(reput.address)
    })


    //if the BCAI is already deployed, we can deploy the reputation alone
    //together with the address to feed the constructor's argument
    //deployer.deploy(reput, "0x551F6eB6B1744A90f65Da1f15C4d62838df2441D") 
}
