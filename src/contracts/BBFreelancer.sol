/**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';

/**
 * @title Freelancer contract 
 */
contract BBFreelancer is BBStandard{

  modifier jobNotExist(bytes jobHash){
    require(bbs.getAddress(keccak256(jobHash)) == 0x0);
    _;
  }
  modifier isFreelancerOfJob(bytes jobHash){
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER'))) == msg.sender);
    _;
  }
  modifier isNotOwnerJob(bytes jobHash){
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    // not owner
    require(jobOwner!=0x0);
    // not owner
    require(msg.sender != jobOwner);
    _;
  }
  modifier isOwnerJob(bytes jobHash){
    require(bbs.getAddress(keccak256(jobHash))==msg.sender);
    _;
  }

  modifier jobNotStarted(bytes jobHash){
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash, 'STATUS'))) == 0x0);
    _;
  }
  modifier isNotCanceled(bytes jobHash){
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash, 'CANCEL'))) !=true);
    _;
  }
  
  function isOwnerOfJob(address sender, bytes jobHash) public view returns (bool) {
      return (bbs.getAddress(keccak256(jobHash)) == sender);
  }
  function isJobStart(bytes jobHash) public view returns (bool) {
      return (bbs.getUint(keccak256(abi.encodePacked(jobHash, 'STATUS'))) != 0x0);
  }
  function isJobCancel(address sender ,bytes jobHash) public view returns (bool) {
      return bbs.getBool(keccak256(abi.encodePacked(jobHash, sender, 'CANCEL')));
  }
  function isJobExpired(bytes jobHash) public view returns (bool) {
      return (now > bbs.getUint(keccak256(abi.encodePacked(jobHash, 'EXPIRED'))));
  }
  function isJobHasFreelancer(bytes jobHash) public view returns (bool) {
      return (bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER'))) != 0x0);
  }
  
}