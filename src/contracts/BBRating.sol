pragma solidity ^0.4.24;

import './BBFreelancer.sol';
import './BBLib.sol';


contract BBRating is BBFreelancer {

    event Rating(bytes32 indexed jobHash, address whoRate, uint value, bytes commentHash);


    function rate(bytes jobHash, uint value, bytes commentHash) public {
        address owner = bbs.getAddress(keccak256(jobHash));
        address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'FREELANCER')));
        require(msg.sender == owner || msg.sender == freelancer);
        uint jobStatus = bbs.getUint(BBLib.toB32(jobHash,'STATUS'));
        require(jobStatus == 5 || jobStatus == 9);
        require(value > 0);
        require(value <= 5);
        require(bbs.getUint(keccak256(abi.encodePacked(msg.sender, jobHash))) <= 0);
        //Save rating value
        bbs.setUint(keccak256(abi.encodePacked(msg.sender, jobHash)),value);
        //Save comment Hash
        bbs.setBytes(keccak256(abi.encodePacked(msg.sender, jobHash,'COMMENT')),commentHash);

        emit Rating(keccak256(jobHash), msg.sender, value, commentHash);
    }
}