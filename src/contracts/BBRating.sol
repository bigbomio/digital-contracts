pragma solidity ^0.4.24;

import './BBFreelancer.sol';
import './BBLib.sol';
import './BBRatingInterface.sol';


contract BBRating is BBFreelancer {

    event Rating(address indexed relatedAddress, uint256 relatedTo, address indexed whoRate, address indexed rateTo,uint256 totalStar, uint256 totalUser ,uint256 star, bytes commentHash);

    function allowRating(address relatedAddr, address  rateTo, uint256 relatedTo) private returns(bool c){
        return BBRatingInterface(relatedAddr).allowRating(msg.sender, rateTo, relatedTo);
    }


    function rate(uint key, address rateTo, uint256 relatedTo, uint value, bytes commentHash) public {
        address relatedAddress = bbs.getAddress(keccak256(abi.encodePacked(key)));
        require(relatedAddress != address(0x0));
        require(rateTo != address(0x0));
        require(value > 0);
        require(value <= 5);
        require(allowRating(relatedAddress, rateTo, relatedTo));

        uint lastStar = bbs.getUint(keccak256(abi.encodePacked(msg.sender, relatedAddress, relatedTo)));
        require(lastStar != value);
        //update star to relatedTo of sender
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, relatedAddress, relatedTo)), value);

        uint lastTotalStar = bbs.getUint(keccak256(abi.encodePacked(relatedAddress, rateTo)));
        //update total star of relatedTo
        lastTotalStar = lastTotalStar + value - lastStar;
        bbs.setUint(keccak256(abi.encodePacked(relatedAddress, rateTo)), lastTotalStar);

        uint lastTotalRate = bbs.getUint(keccak256(abi.encodePacked(relatedAddress, rateTo,'RATE')));
        if(lastStar == 0) {   
            lastTotalRate = lastTotalRate.add(1);
            bbs.setUint(keccak256(abi.encodePacked(relatedAddress, rateTo,'RATE')), lastTotalRate);
        }

        emit Rating(relatedAddress, relatedTo, msg.sender, rateTo,lastTotalStar, lastTotalRate, value, commentHash);
    }


}