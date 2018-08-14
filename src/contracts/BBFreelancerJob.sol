/**
 * Created on 2018-08-13 10:31
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';

/**
 * @title BBFreelancerJob
 */
contract BBFreelancerJob is BBFreelancer {

  event JobCreated(bytes jobHash, address indexed owner, uint expired, uint startBid, uint timeBid, string category, uint256 budget);
  event JobCanceled(bytes jobHash);
  event JobStarted(bytes jobHash);
  event JobFinished(bytes jobHash);

  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function getJob(bytes jobHash) public view returns(address, uint256, uint256, bool, uint256, address){
    address owner = bbs.getAddress(keccak256(jobHash));
    uint256 expired = bbs.getUint(keccak256(abi.encodePacked(jobHash, 'expired')));
    uint256 budget = bbs.getUint(keccak256(abi.encodePacked(jobHash, 'budget')));
    bool cancel = bbs.getBool(keccak256(abi.encodePacked(jobHash, 'cancel')));
    uint256 status = bbs.getUint(keccak256(abi.encodePacked(jobHash, 'status')));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'freelancer')));
    return (owner, expired,budget, cancel, status, freelancer);
  }


  /**
   * @dev 
   * @param jobHash Job Hash
   * @param expired Time 
   * @param budget Buget
   * @param category Tag category
   */
  function createJob(bytes jobHash, uint expired ,uint timeBid, uint256 budget, string category) public 
  jobNotExist(jobHash)
  {
    // check jobHash not null
    require(jobHash.length > 0);
    // expired > now
    require(expired > now);
    // budget
    require(budget > 0);

    require(timeBid > 0);

    require(expired > now + timeBid);

    // save jobHash owner
    bbs.setAddress(keccak256(jobHash), msg.sender);
    // save expired timestamp
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'expired')), expired);

    //Set start time begin to bid = now 
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'timeStartBid')), now);


    // save time freelancer can bid
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'timeBid')), timeBid);

    
    // save budget 
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'budget')), budget);
 
    emit JobCreated(jobHash, msg.sender, expired, now, timeBid, category, budget);
  }
    // hirer  cancel job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function cancelJob(bytes jobHash) public 
  isOwnerJob(jobHash) 
  jobNotStarted(jobHash) {
    bbs.setBool(keccak256(abi.encodePacked(jobHash,'cancel')), true);
    emit JobCanceled(jobHash);
  }
  // freelancer start Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function startJob(bytes jobHash) public 
  isNotCanceled(jobHash)
  jobNotStarted(jobHash)
  isFreelancerOfJob(jobHash) {
    // set status to 1
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 1);
    emit JobStarted(jobHash);
  }
  // freelancer finish Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function finishJob(bytes jobHash) public 
  isNotOwnerJob(jobHash) 
  isFreelancerOfJob(jobHash) {
    //status el 1
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) ==1);

    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 2);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'finishedTimestamp')), now);
    emit JobFinished(jobHash);
  }

}