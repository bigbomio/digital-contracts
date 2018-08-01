pragma solidity ^0.4.24;
import './BBFreelancer.sol';

contract BBFreelancerJob is BBFreelancer {

  event JobCreated(bytes jobHash, address indexed owner, uint created, string category);
  event JobCanceled(bytes jobHash);
  event JobStarted(bytes jobHash);
  event JobFinished(bytes jobHash);

   // hirer create & deposit 
  function createJob(bytes jobHash, uint expired, uint256 budget, string category) public 
  jobNotExist(jobHash)
  {
    // check jobHash not null
    require(jobHash.length > 0);
    // expired > now
    require(expired > now);
    // budget
    require(budget>0);

    // save jobHash owner
    bbs.setAddress(keccak256(jobHash), msg.sender);
    // save expired timestamp
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'expired')), expired);
    // save budget 
    bbs.setUint(keccak256(abi.encodePacked(jobHash, 'budget')), budget);
 
    emit JobCreated(jobHash, msg.sender, now, category);
  }
    // hirer  cancel job
  function cancelJob(bytes jobHash) public 
  isOwnerJob(jobHash) 
  jobNotStarted(jobHash) {
    bbs.setBool(keccak256(abi.encodePacked(jobHash,'cancel')), true);
    emit JobCanceled(jobHash);
  }
  // freelancer start Job
  function startJob(bytes jobHash) public 
  isNotCanceled(jobHash)
  jobNotStarted(jobHash)
  isFreelancerOfJob(jobHash) {
    // set status to 1
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 1);
    emit JobStarted(jobHash);
  }
  // freelancer finish Job
  function finishJob(bytes jobHash) public 
  isNotOwnerJob(jobHash) 
  isFreelancerOfJob(jobHash) {
    //status el 1
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) ==1);

    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 2);
    emit JobFinished(jobHash);
  }

}