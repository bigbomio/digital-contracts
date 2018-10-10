pragma solidity ^0.4.24;

import './BBFreelancer.sol';
import './BBLib.sol';
import './BBRatingInterface.sol';


contract BBRating is BBFreelancer {

    event Rating(address indexed relatedAddress, bytes relatedTo, address  whoRate, uint256 value, bytes commentHash, bool isAllowRating);

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
        bool isAllowRating = allowRating(relatedAddress, relatedTo);
       // bytes memory rs = BBRatingInterface(relatedAddress).getRating(relatedTo);
        //require();
        //require(relatedAddress.delegatecall(bytes4(keccak256("doRating(bytes,uint256)")),relatedTo, value));

        emit Rating(relatedAddress, commentHash, msg.sender, value, commentHash,isAllowRating);
    }

    function getRating(bytes key, bytes relatedTo) public {
        address relatedAddress = bbs.getAddress(keccak256(abi.encodePacked(key)));
        //require(relatedAddress.delegatecall(bytes4(keccak256("getRating(bytes)")),relatedTo));
        //uint256 result = relatedAddress.delegatecall(bytes4(keccak256("getRating(bytes)")),relatedTo);
    } 
}