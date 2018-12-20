/**
 * Created on 2018-08-13 10:31
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBFreelancerPayment.sol';
import './BBLib.sol';


/**
 * @title BBFreelancerJob
 */
contract BBFreelancerJob is BBFreelancer {
   BBFreelancerPayment public payment = BBFreelancerPayment(0x0);

  /**
   * @dev 
   * @param paymentAddress address of the Payment Contract
   */
  function setPaymentContract(address paymentAddress) onlyOwner public {
    payment = BBFreelancerPayment(paymentAddress);
  }

  event JobCreated(bytes jobHash, uint256 indexed jobID, address indexed owner, uint expired, bytes32 indexed category, uint256  budget, uint256 estimateTime);
  event JobCanceled(uint256 indexed jobID);
  event JobStarted(uint256 indexed jobID);
  event JobFinished(uint256 indexed jobID);
  event JobStatus(uint256 indexed jobID, uint256 status);

  /**
   * @dev 
   * @param jobID Job ID
   */
  function getJob(uint256 jobID) public view returns(address, uint256, uint256, uint256, address){
    address owner = bbs.getAddress(BBLib.toB32(jobID));
    uint256 expired = bbs.getUint(BBLib.toB32(jobID, 'JOB_EXPIRED'));
    uint256 budget = bbs.getUint(BBLib.toB32(jobID, 'JOB_BUDGET'));
    uint256 status = bbs.getUint(BBLib.toB32(jobID, 'JOB_STATUS'));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID, 'FREELANCER'));
    return (owner, expired, budget, status, freelancer);

  }


  /**
   * @dev 
   * @param jobHash Job Hash
   * @param expired Time
   * @param estimateTime Time do the job
   * @param budget Buget
   * @param category Tag category
   */
  function createJob(bytes jobHash, uint expired ,uint estimateTime, uint256 budget, bytes32 category, address tokenAddress) public 
  jobNotExist(jobHash)
  {
    // check jobHash not null
    require(jobHash.length > 0);
    // expired > now
    require(expired > now);
    // budget
    require(budget > 0);

    require(estimateTime > 0);
    require(payment.isWhiteList(tokenAddress)==true);
    //Save jobHash by jobID
    uint256 jobID = bbs.getUint(BBLib.toB32('JOB_ID'));
    jobID++;
    // save jobHash owner
    bbs.setAddress(BBLib.toB32(jobID), msg.sender);

    // save expired timestamp
    bbs.setUint(BBLib.toB32(jobID, 'JOB_EXPIRED'), expired);
    
    bbs.setUint(BBLib.toB32('JOB_ID'),jobID);
    //mapping jobHash with jobID
    bbs.setUint(BBLib.toB32(jobHash,'JOB_HASH'), jobID);
    // save time freelancer can done this job
    bbs.setUint(BBLib.toB32(jobID, 'JOB_ESTIMATE_TIME'), estimateTime);
    // save budget 
    bbs.setUint(BBLib.toB32(jobID, 'JOB_BUDGET'), budget);
    // save token address
    bbs.setAddress(BBLib.toB32(jobID, 'TOKEN_ADDRESS'), tokenAddress);
 
    emit JobCreated(jobHash, jobID, msg.sender, expired, category, budget, estimateTime);
  }
    // hirer  cancel job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function cancelJob(uint256 jobID) public 
  isOwnerJob(jobID)  {

    uint status = bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS'));
    require(status == 0 || status == 1);
    if(status == 1) {
      address freelancer = bbs.getAddress(BBLib.toB32(jobID, 'FREELANCER'));
      uint bidTime = bbs.getUint(BBLib.toB32(jobID, 'BID_TIME', freelancer));
      uint timeStartJob = bbs.getUint(BBLib.toB32(jobID, 'JOB_STARTED_TIMESTAMP'));
      require(now > timeStartJob + bidTime);
    }
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 3);
    //require(payment.refundBBO(jobID));
    emit JobCanceled(jobID);
  }
  // freelancer start Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function startJob(uint256 jobID) public 
  isNotCanceled(jobID)
  jobNotStarted(jobID)
  isFreelancerOfJob(jobID) {
    // set status to 1
    require(bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS')) == 8); // require deposited
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 1);
    //Begin set time start job
    bbs.setUint(BBLib.toB32(jobID,'JOB_STARTED_TIMESTAMP'), now);
    
    emit JobStarted(jobID);
  }
  // freelancer finish Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function finishJob(uint256 jobID) public 
  isNotOwnerJob(jobID) 
  isFreelancerOfJob(jobID) {
    //status el 1
    require(bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS')) ==1);

    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 2);
    bbs.setUint(BBLib.toB32(jobID,'JOB_FINISHED_TIMESTAMP'), now);
    emit JobFinished(jobID);
  }

  function getJobID(bytes jobHash) public view returns(uint256){
      return bbs.getUint(BBLib.toB32(jobHash,'JOB_HASH'));
  }

  /**
   * Job Status (set by chain?)
   * 1. started (sidechain)  --> will call this function to set to on-chain
   * 2. finished  (sidechain) --> will call this function to set to on-chain
   * 3. cancelled (sidechain) --> will call this function to set to on-chain
   * 4. payment rejected  (onchain)
   * 5. payment claimed (onchain)
   * 6. dispute started (onchain)
   * 7. payment pending deposit (sidechain) --> will call this function to set to on-chain
   * 8. payment deposited (onchain)
   * 9. payment accepted (onchain)
  **/
  function updateJobStatus(uint256 jobID, uint256 status) public onlyOwner {
    if(status!=4||status!=5||status!=8 || status != 6|| status != 9)
      revert();
    uint256 currentStatus = bbs.getUint(BBLib.toB32(jobID, 'JOB_STATUS'));
    require(currentStatus != status);
    bbs.setUint(BBLib.toB32(jobID, 'JOB_STATUS'), status);
    emit JobStatus(jobID, status);
  }
}
