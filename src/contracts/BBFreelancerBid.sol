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

  BBFreelancerPayment payment = BBFreelancerPayment(0x0);

  /**
   * @dev 
   * @param paymentAddress address of the Payment Contract
   */
  function setPaymentContract(address paymentAddress) onlyOwner public {
    payment = BBFreelancerPayment(paymentAddress);
  }
  /**
   * @dev 
   */
  function getPaymentContract() onlyOwner public returns (address)  {
    return payment;
  }

  event BidCreated(bytes32 indexed jobHash , address indexed owner, uint256 bid, uint256 bidTime, uint created);
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

    emit BidCreated(keccak256(jobHash), msg.sender, bid, bidTime, now);
  }


  
  // freelancer cancel bid
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function cancelBid(bytes jobHash) jobNotStarted(jobHash){
     address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
     //Job ownwer call this function
     if(bbs.getAddress(keccak256(jobHash)) == msg.sender && freelancer != 0x0 ) {
        bbs.setUint(BBLib.toB32(jobHash, freelancer), 0);
        bbs.setAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')), 0x0);
     } else {
       uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,msg.sender)));
       require(bid > 0);
       bbs.setUint(BBLib.toB32(jobHash, msg.sender), 0);
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
    
    uint256 lastBid = bbs.getUint(BBLib.toB32(jobHash,msg.sender,'PAYMENT'));
    if(lastBid == 0) {
      require(bbo.transferFrom(msg.sender, address(payment), bid));
    } else if(lastBid > bid) {
      //Refun BBO to job owner
      bbs.setUint(BBLib.toB32(jobHash,msg.sender,'REFUND'), lastBid - bid);
      require(payment.refundBBO(jobHash));
      bbs.setUint(BBLib.toB32(jobHash,msg.sender,'REFUND'), 0);
    } else if(lastBid < bid){
      //Deposit more BBO
      require(bbo.transferFrom(msg.sender, address(payment), bid - lastBid));
    } 
    //Storage amount of BBO that Job owner transferred to payment address
    bbs.setUint(BBLib.toB32(jobHash,msg.sender,'PAYMENT'), bid);
    //update new freelancer
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')), freelancer);
    
    emit BidAccepted(keccak256(jobHash), bid ,freelancer);
  
  }
  
}