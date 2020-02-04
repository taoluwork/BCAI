pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;
//IDEAS
//Date - could keep track of the date/time of their last job
//New users - should not be treated as behaving badly because they have no ratings

contract bcaiReputation {
    
    mapping (address => reputation) public ratings; //user address -> reputation struct
    
    struct reputation{
        uint128 numRatings;
        uint128 avgRating;
        uint128[5] lastFive;
        bool newUser;
    }
    
    function addRating (address user, uint128 rating) public {
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
    
    function getLastFive (address user) public view returns(uint128 [5] memory) {
        return ratings[user].lastFive;
    }
    
}
