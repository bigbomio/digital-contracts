/**
 * Created on 2018-08-13 10:29
 * @summary: Biding contract
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBFreelancerPayment.sol';
import './BBLib.sol';
/**
 * @title BBFreelancerBid
 */
contract BBFreelancerBid is BBFreelancer{

  BBFreelancerPayment public payment = BBFreelancerPayment(0x0);

  /**
   * @dev 
   * @param paymentAddress address of the Payment Contract
   */
  function setPaymentContract(address paymentAddress) onlyOwner public {
    payment = BBFreelancerPayment(paymentAddress);
  }


  event BidCreated(uint256  indexed jobID , address indexed owner, uint256 bid, uint256 bidTime);
  event BidCanceled(uint256 indexed jobID, address indexed owner);
  event BidAccepted(uint256 indexed jobID, uint256 bid,address indexed freelancer);


   // freelancer bid job
  /** 
   * @dev 
   * @param jobID Job ID
   * @param bid value of bid amount
   * @param bidTime time to do this job
   */
  function createBid(uint256 jobID, uint256 bid, uint bidTime) public 
   isNotOwnerJob(jobID)
   isNotCanceled(jobID)
   jobNotStarted(jobID) {
    // sender should not cancel previous bid yet
    require( bbs.getBool(BBLib.toB32(jobID,msg.sender, 'JOB_CANCEL')) != true);
    // bid must in range budget
    require(bid <= bbs.getUint(BBLib.toB32(jobID, 'JOB_BUDGET' )));
    //check job expired
    require(now < bbs.getUint(BBLib.toB32(jobID, 'JOB_EXPIRED')));

    require(bbs.getAddress(BBLib.toB32(jobID,'FREELANCER')) == 0x0);

    require(bidTime > 0);

    // set user bid value
    bbs.setUint(BBLib.toB32(jobID,msg.sender), bid);
    //set user bidTime value
    bbs.setUint(BBLib.toB32(jobID,'BID_TIME',msg.sender), bidTime);

    emit BidCreated(jobID, msg.sender, bid, bidTime);
  }

   function createSingleBid(uint256 jobID, uint256 bid, uint bidTime) public {
     //Job owner call
     if(isOwnerOfJob(msg.sender, jobID)) {
       return;
     }
     //Job has not started
     if(isJobStart(jobID)) {
       return;
     }
    
    //sender should not cancel previous bid yet
    if(isJobCancel(jobID)) {
      return;
    }
    //bid must in range budget
    if(bid > bbs.getUint(BBLib.toB32(jobID, 'JOB_BUDGET' ))) {
       return;
    }
    //is job expired
    if(isJobExpired(jobID)) {
      return;
    }
    if(isJobHasFreelancer(jobID)) {
      return;
    }
    if(bidTime <= 0) {
      return;
    }
    // set user bid value
    bbs.setUint(BBLib.toB32(jobID,msg.sender), bid);
    //set user bidTime value
    bbs.setUint(BBLib.toB32(jobID,'BID_TIME',msg.sender), bidTime);

    emit BidCreated(jobID, msg.sender, bid, bidTime);

  }

  function createMultipleBid(uint256[] jobIDs, uint256[] bids, uint[] bidTimes) public {
      require(jobIDs.length == bids.length);
      require(bidTimes.length == bids.length);
      require(jobIDs.length <= 10);

      for(uint i = 0; i < jobIDs.length; i++) {
        createSingleBid(jobIDs[i], bids[i], bidTimes[i]);
      }      
  }
  
  // freelancer cancel bid
  /**
   * @dev 
   * @param jobID Job ID
   */
  function cancelBid(uint256 jobID) public jobNotStarted(jobID){
     address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobID,'FREELANCER')));
     //Job ownwer call this function
     if(bbs.getAddress(BBLib.toB32(jobID)) == msg.sender && freelancer != 0x0 ) {
        bbs.setAddress(keccak256(abi.encodePacked(jobID,'FREELANCER')), 0x0);
     } else {
       uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobID,msg.sender)));
       require(bid > 0);
       bbs.setBool(BBLib.toB32(jobID,msg.sender, 'JOB_CANCEL'), true);
       if(msg.sender == freelancer) {
         bbs.setAddress(keccak256(abi.encodePacked(jobID,'FREELANCER')), 0x0);
       }
     }

    emit BidCanceled(jobID, msg.sender);

  }

  // hirer accept bid
  /**
   * @dev 
   * @param jobID Job ID
   * @param freelancer address of the freelancer
   */
  function acceptBid(uint256 jobID, address freelancer) public 
    isOwnerJob(jobID) 
    jobNotStarted(jobID)
    isNotCanceled(jobID){
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobID,freelancer)));
    require(bid > 0);
    require(bbs.getBool(BBLib.toB32(jobID,'JOB_CANCEL')) !=true);
    return doAcceptBid(jobID, freelancer, bid);
    
  }

  function doAcceptBid(uint256 jobID, address freelancer, uint256 bid) internal {
    uint256 lastDeposit = bbs.getUint(BBLib.toB32(jobID,msg.sender,'DEPOSIT'));
    //update new freelancer
    bbs.setAddress(keccak256(abi.encodePacked(jobID,'FREELANCER')), freelancer);
    if(lastDeposit > bid) {
      //Refun BBO to job owner
      require(payment.refundBBO(jobID));
      //Storage amount of BBO that Job owner transferred to payment address
      bbs.setUint(BBLib.toB32(jobID,msg.sender,'DEPOSIT'), bid);
      
    } else if(bid - lastDeposit > 0) {
      //Storage amount of BBO that Job owner transferred to payment address
      bbs.setUint(BBLib.toB32(jobID,msg.sender,'DEPOSIT'), bid);
      //Deposit more BBO
      require(bbo.transferFrom(msg.sender, address(payment), bid - lastDeposit));
    } 
    emit BidAccepted(jobID, bid ,freelancer);
  }
  
}