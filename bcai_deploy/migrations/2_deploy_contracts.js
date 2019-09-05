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
        console.log("Wait until deployed:")
        console.log(BCAI.address)
    })
    .then(()=>{
        deployer.deploy(reput, BCAI.address)
        //NOTE: the "return" here is very important as a pitfall.
        // if missing this return, function deploy(BCAI) will not wait until deploy(reput)
        // have a try to delete "return", which will result in wield error hard to debug
    })
    .then(()=>{
        console.log("Wait until Rep:")
        console.log(reput.address)
    })



    //*********************************************************** */
    //an bad example of not using .then to guarentee the dependency of BCAI.address
    deployer.deploy(BCAI)
    console.log("Bcai now: ")
    console.log(BCAI.address)
    deployer.deploy(reput, BCAI.address)
    console.log("Reputation now: ")
    console.log(reput.address)
    console.log("NOTE: we log after the deployment, but the address is not updated.")

    //if the BCAI is already deployed, we can deploy the reputation alone
    //together with the address to feed the constructor's argument
    //deployer.deploy(reput, "0x551F6eB6B1744A90f65Da1f15C4d62838df2441D") 
}
