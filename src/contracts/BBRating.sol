pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBRatingInterface.sol';


contract BBRating is BBStandard {

    event Rating(uint indexed key, uint256 relatedTo,  address indexed rateTo,uint256 totalStar, uint256 totalUser ,uint256 star, bytes commentHash);

    function allowRating(address relatedAddr, address  rateTo, uint256 relatedTo) private returns(bool){
        return BBRatingInterface(relatedAddr).allowRating(msg.sender, rateTo, relatedTo);
    }


    function rate(uint key, address rateTo, uint256 relatedTo, uint value, bytes commentHash) public {
        address relatedAddress = bbs.getAddress(keccak256(abi.encodePacked(key)));
        require(relatedAddress != address(0x0));
        require(rateTo != address(0x0));
        require(value > 0);
        require(value <= 5);
        require(allowRating(relatedAddress, rateTo, relatedTo));

        uint lastStar = bbs.getUint(keccak256(abi.encodePacked(msg.sender, key, rateTo, relatedTo)));
        //update star to relatedTo of sender
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, key, rateTo, relatedTo)), value);

        uint lastTotalStar = bbs.getUint(keccak256(abi.encodePacked(key, rateTo)));
        //update total star of relatedTo
        lastTotalStar = lastTotalStar.add(value);
        lastTotalStar = lastTotalStar.sub(lastStar);
        bbs.setUint(keccak256(abi.encodePacked(key, rateTo)), lastTotalStar);

        uint lastTotalRate = bbs.getUint(keccak256(abi.encodePacked(key, rateTo,'RATE')));
        if(lastStar == 0) {   
            lastTotalRate = lastTotalRate.add(1);
            bbs.setUint(keccak256(abi.encodePacked(key, rateTo,'RATE')), lastTotalRate);
        }

        emit Rating(key, relatedTo, rateTo,lastTotalStar, lastTotalRate, value, commentHash);
    }


}