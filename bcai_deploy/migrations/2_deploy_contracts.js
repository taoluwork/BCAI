var BCAI = artifacts.require("TaskContract");
var reputation = artifacts.require("bcaiReputation");
//cannot use .sol name

module.exports = function(deployer) {
    // deployment steps
    deployer.deploy(BCAI);
    deployer.deploy(reputation, BCAI.address);
    
}
