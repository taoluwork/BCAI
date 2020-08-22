/////////////////////////////////////////////////////////////////////////////////////
//version 3.0.0
//Author: Taurus, Samuel Pritchett
//Copyright: tlu4@lsu.edu
//
//update from 2.1 -> 3.0, keep alignment with the project version v3.0, which is a stable release version.
///////////////////////////////////////////////////////////////////////////////////////
//NOTE:
//This design uses account address as the identifier, meaning each address could only have one req/prov associated.
//When submit new or update existing req/prov, previous record are overwriten.
//Each address could only have one req or prov, not at same time.

//TODO: add conflict detection of the address. Check whether existing req or prov from your address is 'not complete',(being proccessed).
//TODO: Aug.2019, add a hard-reset function. Totally remove one request or stop provider from the pool
//      , no matter their status (being processed or pending), because sometimes, one will stuck in the pool.
////////////////////////////////////////////////////////////////////////////////////

pragma solidity >=0.5.1;
pragma experimental ABIEncoderV2;           //enable returning self-defined type, used in helper return provider and request
                                            //do not disable, provider is returned for debuging reason.
contract bcaiReputation {

    mapping (address => reputation) public ratings; //user address -> reputation struct

    struct reputation{
        uint128 numRatings;
        uint128 avgRating;
        uint128[5] lastFive;
        bool newUser;
    }

    function addRating (address user, uint128 rating) internal {
        if(ratings[user].numRatings != 0){
            ratings[user].avgRating = (rating + (ratings[user].numRatings * ratings[user].avgRating)) / (ratings[user].numRatings + 1);
            ratings[user].numRatings++;
            for(uint8 i = 4; i != 0; i--){//shift the array so we can add newest rating
                ratings[user].lastFive[i] = ratings[user].lastFive[i - 1];
            }
            ratings[user].lastFive[0] = rating;

            if(ratings[user].numRatings == 5){
                ratings[user].newUser = false;
            }
        }
        else {//this is their first rating, simpler logic
            ratings[user].avgRating = rating;
            ratings[user].lastFive[0] = rating;
            ratings[user].numRatings++;
        }
    }

    function getNumRatings (address user) public view returns(uint128){
        return ratings[user].numRatings;
    }

    function getAvgRating (address user) public view returns(uint128){
        return ratings[user].avgRating;
    }

    function getLastFive (address user) public view returns(uint128[5] memory) {
        return ratings[user].lastFive;
    }

}

contract TaskContract is bcaiReputation{

    uint256 price = 10000000000000000;      // 10000000000000000 Wei = 0.01 ETH

    mapping (address => Provider) public providerList;   //provAddr => provider struct
    mapping (address => Request)  public requestList;    //reqAddr => request struct

    struct Request {
        uint256 blockNumber;                //record the time of submission
        address payable provider;           //record the provider assigned to this request
        uint256 deposit;                    //the amount he put down for a deposit          
        uint256 price;                      //the amount of wei provider is owed for the work (set to price for now)
        bytes   dataID;                     //dataID used to fetch the off-chain data, interact with ipfs
        bytes   resultID;                   //dataID to fetch the off-chain result, via ipfs
        address validator;                  //validators' addr, update when assigned the task to validators
        bool    signature;                  //true or false array, update only when validator submit result
        bool    isValid;                    //the final flag
        byte    status;                     //one byte indicating the status: 0: 'pending', 1:'providing', 2: 'validating', 3: 'complete'
    }

    struct Provider {
        uint256 blockNumber;                //record the time of submission
        bool    available;                  //if ready to be assigned
    }

    //should try best to reduce type of events in order to remove unnecessary confusion. -> reuse events with same format
    //no need seperate events for each type, just put whatever info passed in bytes info
    event IPFSInfo          (address payable reqAddr, bytes info, bytes extra);
    event SystemInfo        (address payable reqAddr, bytes info);          //systemInfo is only informative, not trigger anything.
    event PairingInfo       (address payable reqAddr, address payable provAddr, bytes info);
    //NOTE: [by TaoLu] extra here are actually dataID, which can also be accessed via reqAddr.
    //      extra may not be necessary but it makes easier of app to handle info. This retains the tradeoff of gas cost and easyness.
    event PairingInfoLong   (address payable reqAddr, address payable provAddr, bytes info, bytes extra);


    //Pools stores the address of req or prov, thus indicate the stages.
    address payable[] providerPool;        //provAddr only when more providers > req, or empty
    address payable[] pendingPool;         //reqAddr only when more requests > prov, or empty
    address payable[] providingPool;       //reqAddr
    address payable[] validatingPool;      //reqAddr
    /////////////////////////////////////////////////////////////////////////////////////

    // Function called to become a provider. Add address on List, and Pool if not instantly assigned.
    // TIPS on gas cost: don't create local copy and write back, modify the storage directly.
    //      gas cost 165K without event / 167K with event / 92K overwrite
    function startProviding() public returns (bool) {
        if(providerList[msg.sender].blockNumber == 0){                  //if this is new
            providerList[msg.sender].blockNumber = block.number;
            providerList[msg.sender].available = true;
            providerPool.push(msg.sender);
            emit SystemInfo (msg.sender, "Provider Added");
            return true;
        }
        // else {                                                          //this address has been recorded before
        //     return updateProvider(maxTime, maxTarget, minPrice);        //this could be an update
        // }
    }
    // Stop a provider. Must be sent from the provider address or it will be failed.
    function stopProviding() public returns (bool) {
        // If the sender is currently an active provider
        if (providerList[msg.sender].available == true){               //can only stop available provider
            delete providerList[msg.sender];                           //delete from List
            emit SystemInfo(msg.sender, 'Provider Stopped');
            return ArrayPop(providerPool, msg.sender);                 //delete from Pool
        }
        else{
            emit SystemInfo(msg.sender, 'Provider Unable to Stop');
            return false;
        }
    }

    //update a provider, you must know the provAddr and must sent from right addr
    // function updateProvider(uint64 maxTime, uint16 maxTarget, uint64 minPrice) public returns (bool) {
    //     if(providerList[msg.sender].available == true){                //can only modify available provider
    //         providerList[msg.sender].blockNumber = block.number;
    //         providerList[msg.sender].maxTime = maxTime;
    //         providerList[msg.sender].maxTarget = maxTarget;
    //         providerList[msg.sender].minPrice = minPrice;
    //         emit SystemInfo(msg.sender,'Provider Updated');
    //         return true;
    //     }
    //     else{
    //         emit SystemInfo(msg.sender, 'Provider Unable to Update');
    //         return false;
    //     }
    // }

    // Send a request from user to blockchain. Assumes price is including the cost for verification
    // NOTE: use bytes memory as argument will increase the gas cost, one alternative will be uint type, may consifer in future.
    function startRequest(bytes memory dataID) public payable returns (bool) {
        require(msg.value >= price, 'Not enough ether');
        if(requestList[msg.sender].blockNumber == 0){   //never submitted before
            //register on List
            requestList[msg.sender].blockNumber = block.number;
            requestList[msg.sender].provider = address(0);
            requestList[msg.sender].validator = address(0);
            requestList[msg.sender].deposit = msg.value;          //how much ether was sent to contract by the user, their "deposit"
            requestList[msg.sender].price = price;                //set to price here, in future will need to be calculated and set later
            requestList[msg.sender].dataID = dataID;
            requestList[msg.sender].status = '0';       //pending = 0x30, is in ascii not number 0
            pendingPool.push(msg.sender);
            emit IPFSInfo (msg.sender, "Request Added", dataID);
            return true;
        } else {    //submitted before
            return updateRequest(dataID);
        }
    }
    function stopRequest() public returns (bool){
        if (requestList[msg.sender].status == '0'){          //can only cancel owned pending request, ('0' = 0x30)
            delete requestList[msg.sender];                  //delete from List
            emit SystemInfo(msg.sender, 'Request Stopped');
            return ArrayPop(pendingPool, msg.sender);        //delete from Pool
        }
        else{
            emit SystemInfo(msg.sender, 'Request Unable to Stop');
            return false;
        }
    }
    function updateRequest(bytes memory dataID) public payable returns (bool) {
        if(requestList[msg.sender].status == '0' ){                   //can only update pending request
            requestList[msg.sender].blockNumber = block.number;
            requestList[msg.sender].dataID = dataID;
            emit SystemInfo(msg.sender, 'Request Updated');
            return true;
        }
        else{
            emit SystemInfo(msg.sender, 'Request Unable to Update');
            return false;
        }
    }


    //Add provAddr to request as a provider if they are available and their prices match up
    //     Called by user who wants to choose provAddr to work for them
    //     Returns '0' on success, '1' on failure
    function chooseProvider(address payable provAddr) public returns (byte){
        if(requestList[msg.sender].status == '0'){ //Since this is ascii '0' its actually 0x30, users who have not submitted a task shouldn't get through here
            if(providerList[provAddr].available == true){ //if chosen provider is in the providerPool and their prices match
                
                providerList[provAddr].available = false;
                ArrayPop(providerPool, provAddr);

                requestList[msg.sender].provider = provAddr;
                requestList[msg.sender].status = '1';
                ArrayPop(pendingPool, msg.sender);
                providingPool.push(msg.sender);                

                emit PairingInfoLong(msg.sender, provAddr, "Request Assigned", requestList[msg.sender].dataID);
                return '0';
            }
            else{
                emit SystemInfo(msg.sender, 'Chosen provider is not available to work');
                return '1';
            }
        }
        else if(requestList[msg.sender].status == '2' && requestList[msg.sender].provider != provAddr){
            providerList[provAddr].available = false;
            ArrayPop(providerPool, provAddr);

            requestList[msg.sender].validator = provAddr;
            requestList[msg.sender].signature = false;
            emit PairingInfoLong(msg.sender, provAddr, 'Validation Assigned to Provider', requestList[msg.sender].resultID);
            return '0';
        }
        else{
            if(requestList[msg.sender].status == '1'){
                emit SystemInfo(msg.sender, 'Your request already has a provider assigned');
            }
            else{
                emit SystemInfo(msg.sender, 'You do not have a request');
            }
            return '1';
        }
    }

    // Provider will call this when they are done and the result data is available.
    // This will invoke the validation stage. Only when the request got enough validators,
    // that req could be moved from pool and marked. Or that req stays providing
    function completeRequest(address payable reqAddr, bytes memory resultID) public returns (bool) {
        // Confirm msg.sender is actually the provider of the task he claims
        if (msg.sender == requestList[reqAddr].provider) {
            //change request obj
            requestList[reqAddr].status = '2';    //validating
            requestList[reqAddr].resultID = resultID;
            //move from providing pool to validating Pool.
            ArrayPop(providingPool, reqAddr);
            validatingPool.push(reqAddr);
            //release provider (not necessarily depend on provider) back into providerPool
            providerList[msg.sender].available = true;
            providerPool.push(msg.sender);
            emit IPFSInfo(reqAddr, 'Request Computation Completed',requestList[reqAddr].resultID);
            //start validation process
            return true;
        }
        else {
            return false;
        }
    }

    // needs to be more secure by ensuring the submission is coming from someone legit
    // similar to completeTask but this will sign the validation list of the target Task
    // TODO: the money part is ommited for now
    function submitValidation(address payable reqAddr, bool result) public returns (bool) {
        if(msg.sender != requestList[reqAddr].provider) {     //validator cannot be provider
            if(requestList[reqAddr].validator == msg.sender && requestList[reqAddr].signature == false){ // this is the validator and no signature yet

                    //The way the project is coded right now, this is gauranteed to run. If this doesn't run something is wrong.
                    if(requestList[reqAddr].deposit >= requestList[reqAddr].price){ //if the deposit is enough to pay
                        requestList[reqAddr].provider.transfer(requestList[reqAddr].price); //send price to provider
                        emit SystemInfo(requestList[reqAddr].provider, 'You have been paid'); //alert provider
                        if(requestList[reqAddr].deposit >= requestList[reqAddr].price){ //if deposit was greater than price
                            reqAddr.transfer(requestList[reqAddr].deposit - requestList[reqAddr].price); //return remaining eth back to user
                            emit SystemInfo(reqAddr, 'You have recieved part of your deposit back'); //alert user
                        }
                    }
                    // else { //deposit was not enough, need more ether
                    //     emit PairingInfo(reqAddr, requestList[reqAddr].provider, 'Deposit insufficient, )
                    // }

                    requestList[reqAddr].signature = result;
                    requestList[reqAddr].isValid = result;
                    providerList[msg.sender].available = true;          //release validator
                    providerPool.push(msg.sender);
                    emit PairingInfo(reqAddr, msg.sender, 'Validator Signed');
                    emit IPFSInfo(reqAddr, 'Validation Complete', requestList[reqAddr].resultID);
                }
            }
            
        else   //submit vali from provider
            return false;
    }

    // finalize the completed result, move everything out of current pools
    function finalizeRequest(address payable reqAddr, bool toRate, uint8 rating) public returns (bool) {
        if(requestList[reqAddr].isValid){
            ArrayPop(validatingPool, reqAddr);
            if(toRate){ //If user wishes to, let them rate the provider
                addRating(requestList[reqAddr].provider, rating);
            }
            delete requestList[reqAddr]; //delete user from mapping
        }
    }

/////////////////////////////////////////////////////////////////////
    // Used to dynamically remove elements from array of open provider spaces.
    // Using a swap and delete method, search for the desired addr throughout the whole array
    // delete the desired and swap the hole with last element
    function ArrayPop(address payable[] storage array, address payable target) private returns (bool) {
        for(uint64 i = 0; i < array.length; i++){
            if (array[i] == target) {
                array[i] = array[array.length-1];   //swap last element with hole
                delete array[array.length-1];       //delete last item
                array.length -= 1;                  //decrease size
                return true;
            }
        }
        return false;   //fail to search: no matching in pool
    }
    
    /////////////////////////////////////////////////////////////////////////////////
    //some helpers defined here
    //NOTE: these helpers will use up the code space, (in Ethereum code lenght is limited)
    //      can be removed in future to free up space.

    // function getProvider(address payable ID) public view returns(Provider memory){
    //     return providerList[ID];
    // }
    // function getRequest(address payable ID) public view returns (Request memory){
	//     return requestList[ID];
    // }

    function getProviderPool() public view returns (address payable[] memory){
        return providerPool;
    }
    function getPendingPool() public view returns (address payable[] memory){
        return pendingPool;
    }
    function getValidatingPool() public view returns (address payable[] memory){
        return validatingPool;
    }
    function getProvidingPool() public view returns (address payable[] memory){
        return providingPool;
    }

    // function getProviderPoolSize() public view returns (uint256){
    //     return providerPool.length;
    // }
    // function getRequestPoolSize() public view returns (uint256){
    //     return pendingPool.length;
    // }
}
