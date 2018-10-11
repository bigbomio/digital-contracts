pragma solidity ^0.4.24;

import './BBFreelancer.sol';
import './BBLib.sol';
import './BBRatingInterface.sol';


contract BBRating is BBFreelancer {

    event Rating(address indexed relatedAddress, uint256 relatedTo, address  whoRate, uint256 star, bytes commentHash);

    function addRelatedAddress(bytes key, address relatedAddress) public onlyOwner {
        require(relatedAddress!=address(0x0));
        bbs.setAddress(keccak256(abi.encodePacked(key)), relatedAddress);
    }

    function allowRating(address relatedAddr, uint256 relatedTo) private returns(bool c){
        return BBRatingInterface(relatedAddr).allowRating(msg.sender, relatedTo);
    }


    function rate(bytes key, uint256 relatedTo, uint value, bytes commentHash) public {
        address relatedAddress = bbs.getAddress(keccak256(abi.encodePacked(key)));
        require(relatedAddress != address(0x0));
        require(value > 0);
        require(value <= 5);
        require(allowRating(relatedAddress, relatedTo));
        uint lastStar = bbs.getUint(keccak256(abi.encodePacked(msg.sender, relatedAddress, relatedTo)));
        require(lastStar != value);
        //update star to relatedTo of sender
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, relatedAddress, relatedTo)), value);

        bytes32 relatedToValue = BBRatingInterface(relatedAddress).getRelatedTo(msg.sender, relatedTo);

        uint lastTotalStar = bbs.getUint(keccak256(abi.encodePacked(relatedAddress, relatedToValue)));
        //update total star of relatedTo
        lastTotalStar = lastTotalStar + value - lastStar;
        bbs.setUint(keccak256(abi.encodePacked(relatedAddress, relatedToValue)), lastTotalStar);

        if(lastStar == 0) {
            uint lastTotalRate = bbs.getUint(keccak256(abi.encodePacked(relatedAddress, relatedToValue,'RATE')));
            lastTotalRate = lastTotalRate.add(1);
            bbs.setUint(keccak256(abi.encodePacked(relatedAddress, relatedToValue,'RATE')), lastTotalRate);
        }


        emit Rating(relatedAddress, relatedTo, msg.sender, value, commentHash);
    }

    function getRating(bytes key, uint256 relatedTo) public  constant returns (uint256,uint256,uint256,uint256)  {
        address relatedAddress = bbs.getAddress(keccak256(abi.encodePacked(key)));
        return  BBRatingInterface(relatedAddress).getRating(relatedAddress, relatedTo);
    } 
}