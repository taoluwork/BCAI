/////////////////////////////////////////////////////////////////////////////////////
//version 2.0
//Author: Taurus
//Copyright: tlu4@lsu.edu
//
//NOTE: non-view functions cannot return values, only possible way is event
//Changes from v0.9x. Each node has unique address as identifier. All pools removed 
//All req and prov handled in the mapping.
//update 12/12: pools cannot be removed, since we need to track who are active, cannot search in mapping.
///////////////////////////////////////////////////////////////////////////////////////
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;   //return self-defined type

contract TaskContract {
    //list
    mapping (address => Provider) public providerList;   //All here
    mapping (address => Request)  public requestList;    //All here
    mapping (address => uint256)  public balanceList;    //reqID => balance
 
    //ID - counter
    uint256 private providerCount;                       //+1 each time
    uint256 private requestCount;

    constructor() public {                               //sol 5.0 syntax
        providerCount = 0;
        requestCount = 0;
    }

    struct Request {
        uint256 reqID;                      //requestID is not identifier 
        uint256 blockNumber;                //record the time of submition
        address payable provider;           //record the provider assigned to this request
        uint64  time;                       //time
        uint16  target;                     //target 0-100.00
        uint256 price;                      //the max amount he can pay
        bytes   dataID;                     //dataID used to fetch the off-chain data
        bytes   resultID;                   //dataID to fetch the result
        uint64  numValidations;             //user defined the validation
        address payable []  validators;     //multisignature from validations
        bool[]  signatures;                 //true or false array
        bool    isValid;                    //the final flag
        byte    status;                     //0: 'pending', 1:'providing', 2: validating, 3: complete
    }

    struct Provider {
        uint256 provID;
        uint256 blockNumber;
        uint64  maxTime;                    //max time
        uint16  maxTarget;                  //max target he need
        uint256 minPrice;                   //lowest price can accept
        bool    available;                  //if ready to be assigned
    }

    event SystemInfo        (address payable addr, bytes info);
    event PairingInfo       (address payable reqAddr, address payable provAddr, bytes info);

    address payable [] providerPool;
    address payable [] pendingPool;
    address payable [] providingPool;
    address payable [] validatingPool;
    /////////////////////////////////////////////////////////////////////////////////////

    
    // Function called to become a provider. New on List, Map and Pool. 
    // NOTE: cannot use to update. You must stop a previous one and start a new one.
    // TIPS: gas cost: don't create local copy and write back, modify the storage directly.
    //gas cost 165K without event / 167K with event / 92K overwrite
    function startProviding(uint64 maxTime, uint16 maxTarget, uint64 minPrice) public returns (bool) {
        if(providerList[msg.sender].blockNumber == 0){              //this is new
            // register a new provider object in the List and map              
            providerList[msg.sender].provID         = providerCount;    //cost 50k per item edit
            providerList[msg.sender].blockNumber    = block.number;           
            providerList[msg.sender].maxTime        = maxTime;
            providerList[msg.sender].maxTime        = maxTime;       
            providerList[msg.sender].maxTarget      = maxTarget;
            providerList[msg.sender].minPrice       = minPrice;
            providerList[msg.sender].available      = true;             //turn on the flag at LAST
            // ready for the next       
            providerPool.push(msg.sender);
            emit SystemInfo (msg.sender, "Provider Added");
            providerCount++;
            assignProvider(msg.sender);
            return true;
        } else {
            if(providerList[msg.sender].available == true){                //can only modify available provider
                providerList[msg.sender].blockNumber    = block.number;         
                providerList[msg.sender].maxTime        = maxTime;       
                providerList[msg.sender].maxTarget      = maxTarget;
                providerList[msg.sender].minPrice       = minPrice;
                emit SystemInfo(msg.sender,'Provider Updated');
                assignProvider(msg.sender);
                return true;
            }
        }
    }
    // Stop a provider, if you know a provider ID. Get em using getProvID()
    // Must be sent from the provider address or it will be failed.
    function stopProviding() public returns (bool) {
        // If the sender is currently an active provider
        if (providerList[msg.sender].available == true){               //can only stop available provider            
            delete providerList[msg.sender];                           //delete from List
            return ArrayPop(providerPool, msg.sender);                 //delete from Pool    
            emit SystemInfo(msg.sender, 'Provider Stopped');         
        }
    }
    //update a provider, you must know the provID and must sent from right addr
    function updateProvider(uint64 maxTime, uint16 maxTarget, uint64 minPrice) public returns (bool) {      
        if(providerList[msg.sender].available == true){                //can only modify available provider
            providerList[msg.sender].blockNumber    = block.number;         
            providerList[msg.sender].maxTime        = maxTime;       
            providerList[msg.sender].maxTarget      = maxTarget;
            providerList[msg.sender].minPrice       = minPrice;
            emit SystemInfo(msg.sender,'Provider Updated');
            assignProvider(msg.sender);
            return true;
        }
    }

    // Send a request from user to blockchain.
    // Assumes price is including the cost for verification
    function startRequest(uint64 time, uint16 target, uint64 price, bytes memory dataID) payable public returns (bool) {
        if(requestList[msg.sender].blockNumber == 0){
            //register on List
            requestList[msg.sender].reqID         = requestCount;
            requestList[msg.sender].blockNumber   = block.number;  
            requestList[msg.sender].provider      = address(0);      
            requestList[msg.sender].time          = time;    
            requestList[msg.sender].target        = target;
            requestList[msg.sender].price         = price;
            requestList[msg.sender].dataID        = dataID;
            requestList[msg.sender].numValidations = 1;
            requestList[msg.sender].status = '0' ;     //pending 0x30, not 0
            pendingPool.push(msg.sender);
            emit SystemInfo (msg.sender, "Request Added");
            
            requestCount++;     
            assignRequest(msg.sender);
            return true;
        } else {
            if(requestList[msg.sender].status == '0' ){                   //can only update pending request
                requestList[msg.sender].blockNumber    = block.number;         
                requestList[msg.sender].time        = time;       
                requestList[msg.sender].target      = target;
                requestList[msg.sender].price       = price;
                requestList[msg.sender].dataID      = dataID;
                emit SystemInfo(msg.sender, 'Request Updated');
                return true;
            }
        }
    }
    function stopRequest() public returns (bool){
        if (requestList[msg.sender].status == '0'){                   //can only cancel owned pending request             
            delete requestList[msg.sender];                           //delete from List             
            emit SystemInfo(msg.sender, 'Request Stopped');
            return ArrayPop(pendingPool, msg.sender);                 //delete from Pool   
        }
    }
    function updateRequest(uint64 time, uint16 target, uint64 price, bytes memory dataID) payable public returns (bool) {      
        if(requestList[msg.sender].status == '0' ){                   //can only update pending request
            requestList[msg.sender].blockNumber    = block.number;         
            requestList[msg.sender].time        = time;       
            requestList[msg.sender].target      = target;
            requestList[msg.sender].price       = price;
            requestList[msg.sender].dataID      = dataID;
            emit SystemInfo(msg.sender, 'Request Updated');
            return true;
        }
    }

    // Search in the requestPool, find a job for current provider. Triggered by startProviding
    // Return true if a match or false if not.
    // Returns: 0: successfully assigned
    //          1: searched all providers but find no match
    //          2: no available provider right now
    //          3: failure during poping pool
    function assignProvider(address payable provAddr) private returns (byte){
        if(pendingPool.length == 0) return '2';
        else {
            //search throught the requestPool
            for (uint64 i = 0; i < pendingPool.length; i++){
                //save the re-usable reqID , may save gas
                address payable reqAddr = pendingPool[i];    
                if( requestList[reqAddr].time     <= providerList[provAddr].maxTime &&
                    requestList[reqAddr].target   <= providerList[provAddr].maxTarget &&
                    requestList[reqAddr].price    >= providerList[provAddr].minPrice){
                        //meet the requirement, assign the task
                        //update provider
                        providerList[provAddr].available = false;
                        ArrayPop(providerPool, provAddr);

                        //update request
                        requestList[reqAddr].provider = provAddr;
                        requestList[reqAddr].status = '1';    //providing
                        ArrayPop(pendingPool, reqAddr);

                        //update balanceList            addr here is requester's
                        balanceList[reqAddr] += requestList[reqAddr].price; 

                        providingPool.push(reqAddr);                       
                        //status move from pending to providing
                        emit PairingInfo(reqAddr, provAddr, "Request Assigned");
                        return '0';                   
                }                
            }
            //after for loop and no match
            return '1';
        }
    }

    // Assigning one task to one of the available providers. Only called from requestTask (private)
    // Search in the providerPool, if no match in the end, return false
    //could only assign one task at a time
    //auto sel the first searching result for now, no comparation between multiple availability.
    //TODO: need ot add preference next patch
    // Returns: 0: successfully assigned
    //          1: searched all providers but find no match
    //          2: no available provider right now
    //          3: failure during poping pool
    function assignRequest(address payable reqAddr) private returns (byte) {
        //provider availability is checked in pool not in list
        if (providerPool.length == 0)   return '2';
        else {            //if any provider in pool
            for (uint64 i = 0; i < providerPool.length; i++) {
                // save the provider's addr, reusable and save gas cost
                address payable provAddr  = providerPool[i];
                if(provAddr != address(0) && providerList[provAddr].available == true){
                    // Check if request conditions meet the providers requirements
                    if (requestList[reqAddr].target <= providerList[provAddr].maxTarget && 
                        requestList[reqAddr].time <= providerList[provAddr].maxTime && 
                        requestList[reqAddr].price >= providerList[provAddr].minPrice) {
                        
                        //update provider:
                        providerList[provAddr].available = false;
                        ArrayPop(providerPool, provAddr);

                        //update request
                        requestList[reqAddr].provider = provAddr;
                        requestList[reqAddr].status = '1';    //providing
                        ArrayPop(pendingPool, reqAddr);

                        //update balanceList              
                        balanceList[reqAddr] += requestList[reqAddr].price; 

                        providingPool.push(reqAddr);
                        emit PairingInfo(reqAddr, provAddr, "Request Assigned"); // Let provider listen for this event to see he was selected
                        return '0';
                    }
                }
            }
            // No provider was found matching the criteria -- request failed
            //requestList[reqID].addr.transfer(requestList[reqID].price); // Returns the ether to the sender
            return '1';
        }
    }

    // Provider will call this when they are done and the data is available.
    // This will invoke the validation stage but only when the request got enough validators
    // that req could be moved from pool and marked,
    // Or that req stays providing
    function completeRequest(address payable reqAddr, bytes memory resultID) public returns (bool) {
        // Confirm msg.sender is actually the provider of the task he claims
        if (msg.sender == requestList[reqAddr].provider) {
            //change request obj
            requestList[reqAddr].status = '2';    //validating
            requestList[reqAddr].resultID = resultID;
            //move from providing pool to validating Pool.
            ArrayPop(providingPool, reqAddr);
            validatingPool.push(reqAddr);
            //release provider (not necessarily depend on provider)
            //providerList[providerID[msg.sender]].available = true;
            emit SystemInfo(reqAddr, 'Request Computation Completed');
            //start validation process
            return validateRequest(reqAddr);
        }
        else {
            return false;
        }
    }

    // Called by assignRequest before finalizing stuff. Contract checks with validators
    // Returns false if there wasnt enough free providers to send out the required number of validation requests
    // need validation from 1/10 of nodes -- could change
    function validateRequest(address payable reqAddr) public returns (bool) {
        uint64 numValidatorsNeeded = requestList[reqAddr].numValidations; 
        //uint numValidators = providerCount / 10; 
        uint64 validatorsFound = 0;
        //select # of available provider from the pool and force em to do the validation
        for (uint64 i = 0; i < providerPool.length; i++) {
            //get provider ID
            address payable provID = providerPool[i];
            if(provID != requestList[reqAddr].provider){   //validator and computer cannot be same
                //EVENT: informs validator that they were selected and need to validate
                emit PairingInfo(reqAddr, provID, 'Validation Assigned to Provider');
                validatorsFound++;
                //remove the providers availablity and pop from pool
                providerList[provID].available = false;
                ArrayPop(providerPool, provID);
            } else continue;
            //check whether got enough validator
            if(validatorsFound < numValidatorsNeeded){
                continue;
            }
            else{       //enough validator
                emit SystemInfo(reqAddr, 'Enough Validators');
                return true;
                break;
            }
            //loop until certain # of validators selected
        }   
        //exit loop without enough validators    
        emit SystemInfo(reqAddr, 'Not Enough Validators');
    }

    // needs to be more secure by ensuring the submission is coming from someone legit 
    // similar to completeTask but this will sign the validation list of the target Task
    //TODO: the money part is ommited for now
    function submitValidation(address payable reqAddr, bool result) public returns (bool) {
        // Pay the validator 
        // uint partialPayment = requestList[reqID].price / 100; // amount each validator is paid
        // msg.sender.transfer(partialPayment);
        // balanceList[requestList[reqID].addr] -= partialPayment;
        if(msg.sender != requestList[reqAddr].provider) {     //validator cannot be provider
            requestList[reqAddr].validators.push(msg.sender);     //push array
            requestList[reqAddr].signatures.push(result);     //edit mapping
        }
        //emit ValidationInfo(reqID, provID, 'Validator Signed');
        //check if valid
        
        emit PairingInfo(reqAddr, msg.sender, 'Validator Signed');
       
        // If enough validations have been submitted
        if (requestList[reqAddr].validators.length == requestList[reqAddr].numValidations) {
            //return checkValidation(reqID, requestList[reqID].price - requestList[reqID].numValidationsNeeded * partialPayment);
            //checkValidation(reqID);
        }
    }
    
    function checkValidation(address payable reqAddr) public returns (bool) {
        // Add up successful validations
        bool flag = false;
        uint64 successCount = 0;
        for (uint64 i=0; i<requestList[reqAddr].validators.length; i++) {
            if (requestList[reqAddr].signatures[i] == true) successCount++;
        }
        // if 2/3 of validation attempts were successful
        // TODO: determine the fraction
        if (successCount  >= requestList[reqAddr].numValidations) { 
            // if 2/3 of validations were valid then provider gets remainder of money
            //requestList[reqID].provider.transfer(payment); 
            //balanceList[requestList[reqID].addr] -= payment;
            //TODO: [important] leave out the payment part for now.
            requestList[reqAddr].isValid = true; // Task was successfully completed! 
            flag = true;
        }
        // otherwise, work was invalid, the providers payment goes back to requester
        else {
            //requestList[reqID].addr.transfer(payment);
            //balanceList[requestList[reqID].addr] -= payment;
        }
        // EVENT: task is done whether successful or not
        //emit TaskCompleted(requestList[reqID].addr, reqID);
        emit SystemInfo(reqAddr, 'Validation Complete');
        //popout from pool
        flag = flag && ArrayPop(validatingPool, reqAddr);

        return flag;
    }

/////////////////////////////////////////////////////////////////////
    // Used to dynamically remove elements from array of open provider spaces. 
    // Using a swap and delete method, search for the desired addr throughout the whole array
    // delete the desired and swap the whole with last element
    function ArrayPop(address payable [] storage array, address payable target) private returns (bool) {
        for(uint64 i = 0; i < array.length; i++){
            if (array[i] == target) {
                //swap last element with hole
                array[i] = array[array.length-1];
                //delete last item
                delete array[array.length-1];
                //decrease size
                array.length -= 1;
                return true;
            }
        }
        return false;   //fail to search: no matching in pool
    }
    /////////////////////////////////////////////////////////////////////////////////
    //some helpers defined here

    function getProvider(address payable ID) public view returns(Provider memory){
        return providerList[ID];
    }
    function getRequest(address payable ID) public view returns (Request memory){
	    return requestList[ID];
    }
    function getProviderCount() public view returns (uint256){
        return providerCount;
    }
    function getRequestCount() public view returns (uint256){
        return requestCount;
    }

    function getProviderPool() public view returns (address payable [] memory){
        return providerPool;
    }
    function getPendingPool() public view returns (address payable [] memory){
        return pendingPool;
    }
    function getValidatingPool() public view returns (address payable [] memory){
        return validatingPool;
    }
    function getProvidingPool() public view returns (address payable [] memory){
        return providingPool;
    }

    function getProviderPoolSize() public view returns (uint256){
        return providerPool.length;
    }
    function getRequestPoolSize() public view returns (uint256){
        return pendingPool.length;
    }


    //function getBalance(address addr) public view returns (uint256){
    //    return balanceList[addr];
    //}
    function listRequests(address payable[] memory IDList) public view returns(Request[50] memory){
	    Request[50] memory allRequest;
	    for (uint64 i = 0; i < IDList.length; i++){
		    allRequest[i] = getRequest(IDList[i]);
	    }
	    return allRequest;
    }
    function listProviders(address payable[] memory IDList) public view returns(Provider[50] memory){
        Provider[50] memory allProvider;
        //address addr;
        for (uint64 i = 0; i < IDList.length;i++){
            allProvider[i] = getProvider(IDList[i]);
        }
        return allProvider;
    }
/*    function listAllRequests() public view returns(Request[50] memory){
	    Request[50] memory allRequest;
	    for (uint64 i = 0; i < requestCount; i++){
		    allRequest[i] = getRequest(i);
	    }
	    return allRequest;
    }
    function listAllProviders() public view returns(Provider[50] memory){
	    Provider[50] memory allProvider;
	    for (uint64 i = 0; i < providerCount; i++){
		    allProvider[i] = getProvider(i);
	    }
	    return allProvider;
    }
*/

}
