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


  event BidCreated(bytes32 indexed jobHash , address indexed owner, uint256 bid, uint256 bidTime);
  event BidCanceled(bytes32 indexed jobHash, address indexed owner);
  event BidAccepted(bytes32 indexed jobHash, uint256 bid,address indexed freelancer);


   // freelancer bid job
  /** 
   * @dev 
   * @param jobHash Job Hash
   * @param bid value of bid amount
   * @param bidTime time to do this job
   */
  function createBid(bytes jobHash, uint256 bid, uint bidTime) public 
   isNotOwnerJob(jobHash)
   isNotCanceled(jobHash)
   jobNotStarted(jobHash) {
    // sender should not cancel previous bid yet
    require( bbs.getBool(BBLib.toB32(jobHash,msg.sender, 'CANCEL')) != true);
    // bid must in range budget
    require(bid <= bbs.getUint(BBLib.toB32(jobHash, 'BUDGET' )));
    //check job expired
    require(now < bbs.getUint(BBLib.toB32(jobHash, 'EXPIRED')));

    require(bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER')) == 0x0);

    require(bidTime > 0);

    // set user bid value
    bbs.setUint(BBLib.toB32(jobHash,msg.sender), bid);
    //set user bidTime value
    bbs.setUint(BBLib.toB32(jobHash,'BID_TIME',msg.sender), bidTime);

    emit BidCreated(keccak256(jobHash), msg.sender, bid, bidTime);
  }

   function createSingleBid(bytes jobHash, uint256 bid, uint bidTime) public {
     //Job owner call
     if(isOwnerOfJob(msg.sender, jobHash)) {
       return;
     }
     //Job has not started
     if(isJobStart(jobHash)) {
       return;
     }
    
    //sender should not cancel previous bid yet
    if(isJobCancel(msg.sender, jobHash)) {
      return;
    }
    //bid must in range budget
    if(bid > bbs.getUint(BBLib.toB32(jobHash, 'BUDGET' ))) {
       return;
    }
    //is job expired
    if(isJobExpired(jobHash)) {
      return;
    }
    if(isJobHasFreelancer(jobHash)) {
      return;
    }
    if(bidTime <= 0) {
      return;
    }
    // set user bid value
    bbs.setUint(BBLib.toB32(jobHash,msg.sender), bid);
    //set user bidTime value
    bbs.setUint(BBLib.toB32(jobHash,'BID_TIME',msg.sender), bidTime);

    emit BidCreated(keccak256(jobHash), msg.sender, bid, bidTime);

  }

  function createMultipleBid(uint256[] jobIDs, uint256[] bids, uint[] bidTimes) public {
      require(jobIDs.length == bids.length);
      require(bidTimes.length == bids.length);
      require(jobIDs.length <= 10);

      for(uint i = 0; i < jobIDs.length; i++) {
        bytes memory _jobHash = bbs.getBytes(BBLib.toB32(jobIDs[i]));
        createSingleBid(_jobHash, bids[i], bidTimes[i]);
      }      
  }
  
  // freelancer cancel bid
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function cancelBid(bytes jobHash) public jobNotStarted(jobHash){
     address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
     //Job ownwer call this function
     if(bbs.getAddress(keccak256(jobHash)) == msg.sender && freelancer != 0x0 ) {
        bbs.setAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')), 0x0);
     } else {
       uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,msg.sender)));
       require(bid > 0);
       bbs.setBool(BBLib.toB32(jobHash,msg.sender, 'CANCEL'), true);
       if(msg.sender == freelancer) {
         bbs.setAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')), 0x0);
       }
     }

    emit BidCanceled(keccak256(jobHash), msg.sender);

  }

  // hirer accept bid
  /**
   * @dev 
   * @param jobHash Job Hash
   * @param freelancer address of the freelancer
   */
  function acceptBid(bytes jobHash, address freelancer) public 
    isOwnerJob(jobHash) 
    jobNotStarted(jobHash)
    isNotCanceled(jobHash){
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    require(bid > 0);
    require(bbs.getBool(BBLib.toB32(jobHash,'CANCEL')) !=true);
    
    uint256 lastDeposit = bbs.getUint(BBLib.toB32(jobHash,msg.sender,'DEPOSIT'));
    //update new freelancer
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')), freelancer);
    if(lastDeposit > bid) {
      //Refun BBO to job owner
      require(payment.refundBBO(jobHash));
      //Storage amount of BBO that Job owner transferred to payment address
      bbs.setUint(BBLib.toB32(jobHash,msg.sender,'DEPOSIT'), bid);
      
    } else if(bid - lastDeposit > 0) {
      //Storage amount of BBO that Job owner transferred to payment address
      bbs.setUint(BBLib.toB32(jobHash,msg.sender,'DEPOSIT'), bid);
      //Deposit more BBO
      require(bbo.transferFrom(msg.sender, address(payment), bid - lastDeposit));
    } 
    emit BidAccepted(keccak256(jobHash), bid ,freelancer);
  }
  
}