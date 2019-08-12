var BCAI = artifacts.require("TaskContract");
//cannot use .sol name

module.exports = function(deployer) {
    // deployment steps
    deployer.deploy(BCAI);
    
}
