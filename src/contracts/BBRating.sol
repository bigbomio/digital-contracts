pragma solidity ^0.4.24;

import './BBFreelancer.sol';

contract BBRating is BBFreelancer {

    event Rating(address candidate, address whoRate, uint value, bytes commentHash);

    function checkInteractJob(address client, address freelancer) returns (bool) {
        if(bbs.getBool(keccak256(abi.encodePacked(client,freelancer)))) {
            return true;
        } else {
            return bbs.getBool(keccak256(abi.encodePacked(freelancer,client)));
        }
    }

    function rate(address candidate, uint value, bytes commentHash) public {
        require(checkInteractJob(msg.sender, candidate));
        require(value > 0);
        require(value <= 5);
        require(bbs.getUint(keccak256(abi.encodePacked(msg.sender, candidate))) <= 0);
        //Save rating value
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, candidate)),value);
        //Save comment Hash
        bbs.setBytes(keccak256(abi.encodePacked(msg.sender, candidate,'COMMENT')),commentHash);

        emit Rating(candidate, msg.sender, value, commentHash);
    }
}