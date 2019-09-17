// version 0.1
// Taurus @2019
// This is an example of how to set up multiple contract that can call each other
// goal:
// 1. contract can call a remote function
// 2. both contract can call each other


//NOTE: [Tutorial] https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c


pragma solidity ^0.5.0;
//pragma experimental ABIEncoderV2;           //enable returning self-defined type, used in helper return provider and request
                                            //do not disable, provider is returned for debuging reason.


//declare the existing contract before use it.
// Option 1: use import
//import './bcai.sol';     //file name must match
// Option 2: declare whatever you need
contract TaskContract{
    function startProviding(uint64 maxTime, uint16 maxTarget, uint64 minPrice) public returns (bool);
    function getProviderCount() public view returns (uint256);
}



contract Reputation {
    //list
    mapping (address => uint32)   public ratingList;   //provAddr => provider struct

    //ID - counter
    uint256 public providerCount;                       //+1 each time;

    TaskContract tc;      //declare an existing contract object

    constructor(address preDeployed) public {                               //sol 5.0 syntax
        providerCount = 0;
        tc = TaskContract(preDeployed);     // instanciate a contract using address
        //NOTE instantiate can also be done within local functions, but will require sending address as well
    }


    // an example of local function can be call by outside to modify local mapping
    function Rate(address provID, uint32 rating) public returns (bool){
        ratingList[provID] = rating;
        providerCount += 1;
        return true;
    }

    // an exapme of calling an existing contract (ex. BCAI)
    function remoteStart(uint64 maxTime, uint16 maxTarget, uint64 minPrice) public returns (bool){
        tc.startProviding(maxTime, maxTarget, minPrice);
    }

    function localCount() public view returns (uint256){
        return providerCount;
    }

    function remoteCount() public view returns (uint256){
        return tc.getProviderCount();
    }

}

//NOTE: Now don't forget to check the deploy script at ./migrations/2_deploy_contracts.js