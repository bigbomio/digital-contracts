pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';


contract BBRating is BBStandard {

    event Rating(uint256 jobID,  address  whoRate, address indexed rateToAddress, uint256 totalStar, uint256 totalUser ,uint256 star, bytes commentHash);

    
    function allowRating(address sender, address rateToAddress, uint256 jobID) public view returns(bool) {

        address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
        address freelancer = bbs.getAddress(BBLib.toB32(jobID, 'FREELANCER'));
        if(sender != jobOwner && sender != freelancer) {
            return false;
        }
        if(rateToAddress != jobOwner && rateToAddress != freelancer) {
            return false;
        }
        if(sender == rateToAddress) {
            return false;
        }
        uint256 jobStatus = bbs.getUint(BBLib.toB32(jobID ,'JOB_STATUS'));
        if(jobStatus != 5 && jobStatus != 9) {
            return false;
        }
        return true;
    
    }

    function rate(address rateToAddress, uint256 jobID, uint256 value, bytes commentHash) public {
        require(rateToAddress != address(0x0));
        require(value > 0);
        require(value <= 5);
        require(allowRating(msg.sender, rateToAddress, jobID));

        uint lastStar = bbs.getUint(keccak256(abi.encodePacked(msg.sender, rateToAddress, jobID)));
        //update star to relatedTo of sender
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, rateToAddress, jobID)), value);

        uint256 lastTotalStar = bbs.getUint(keccak256(abi.encodePacked( rateToAddress,'RATE_STAR')));
        //update total star of relatedTo
        lastTotalStar = lastTotalStar.add(value);
        lastTotalStar = lastTotalStar.sub(lastStar);
        bbs.setUint(keccak256(abi.encodePacked(rateToAddress, 'RATE_STAR')), lastTotalStar);

        uint lastTotalRate = bbs.getUint(keccak256(abi.encodePacked( rateToAddress,'RATE_USER')));
        if(lastStar == 0) {   
            lastTotalRate = lastTotalRate.add(1);
            bbs.setUint(keccak256(abi.encodePacked(rateToAddress,'RATE_USER')), lastTotalRate);
        }

        emit Rating(jobID, msg.sender, rateToAddress, lastTotalStar, lastTotalRate, value, commentHash);
    }


}