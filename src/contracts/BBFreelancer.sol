/**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';

/**
 * @title Freelancer contract 
 */
contract BBFreelancer is BBStandard{

  modifier jobNotExist(bytes jobHash){
    require(bbs.getAddress(keccak256(jobHash)) == 0x0);
    _;
  }
  modifier isFreelancerOfJob(uint256 jobID){
    require(bbs.getAddress(keccak256(abi.encodePacked(jobID,'FREELANCER'))) == msg.sender);
    _;
  }
  modifier isNotOwnerJob(uint256 jobID){
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    // not owner
    require(jobOwner!=0x0);
    // not owner
    require(msg.sender != jobOwner);
    _;
  }
  modifier isOwnerJob(uint256 jobID){
    require(bbs.getAddress(BBLib.toB32(jobID))==msg.sender);
    _;
  }

  modifier jobNotStarted(uint256 jobID){
    require(bbs.getUint(keccak256(abi.encodePacked(jobID, 'JOB_STATUS'))) == 0x0);
    _;
  }
  modifier isNotCanceled(uint256 jobID){
    require(bbs.getUint(keccak256(abi.encodePacked(jobID, 'JOB_STATUS'))) != 3);
    _;
  }
  
  function isOwnerOfJob(address sender, uint256 jobID) public view returns (bool) {
      return (bbs.getAddress(BBLib.toB32(jobID)) == sender);
  }
  function isJobStart(uint256 jobID) public view returns (bool) {
      return (bbs.getUint(keccak256(abi.encodePacked(jobID, 'JOB_STATUS'))) != 0x0);
  }
  function isJobCancel(uint256 jobID) public view returns (bool) {
      return bbs.getBool(keccak256(abi.encodePacked(jobID, msg.sender, 'JOB_CANCEL')));
  }
  function isJobExpired(uint256 jobID) public view returns (bool) {
      return (now > bbs.getUint(keccak256(abi.encodePacked(jobID, 'JOB_EXPIRED'))));
  }
  function isJobHasFreelancer(uint256 jobID) public view returns (bool) {
      return (bbs.getAddress(keccak256(abi.encodePacked(jobID,'FREELANCER'))) != 0x0);
  }
  
}