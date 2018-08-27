/**
 * Created on 2018-08-13 10:29
 * @summary: Biding contract
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBFreelancerPayment.sol';

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
  event BidAccepted(bytes32 indexed jobHash, address indexed freelancer);

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

    require(bid <= bbs.getUint(keccak256(abi.encodePacked(jobHash, BUDGET ))));
    //check job expired
    require(now < bbs.getUint(keccak256(abi.encodePacked(jobHash, EXPIRED))));

    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER))) == 0x0);

    require(bidTime > 0);

    if(bbs.getBool(keccak256(abi.encodePacked(jobHash, msg.sender, CANCEL))) != true){
      // get number of bid total
      uint256 jobBidCounter = bbs.getUint(keccak256(abi.encodePacked(jobHash,BID_COUNTER)));
      // set next user
      bbs.setUint(keccak256(abi.encodePacked(jobHash,BID_COUNTER)), jobBidCounter+1);
      bbs.setAddress(keccak256(abi.encodePacked(jobHash,BID, jobBidCounter+1)), msg.sender);
    }
    // set user bid value
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender)), bid);
    //set user bidTime value
    bbs.setUint(keccak256(abi.encodePacked(jobHash,BID_TIME,msg.sender)), bidTime);

    emit BidCreated(keccak256(jobHash), msg.sender, bid, bidTime, now);
  }


  
  // freelancer cancel bid
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function cancelBid(bytes jobHash) public isNotOwnerJob(jobHash) {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash, msg.sender)))!=0x0);

    // check the job is not has freelancer yet
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER))) == 0x0);
    // set user bid value to 0
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender)), 0);
    bbs.setBool(keccak256(abi.encodePacked(jobHash,msg.sender, CANCEL)), true);
    emit BidCanceled(keccak256(jobHash), msg.sender);

  }

  // hirer accept bid
  /**
   * @dev 
   * @param jobHash Job Hash
   * @param freelancer address of the freelancer
   */
  function acceptBid(bytes jobHash, address freelancer) public {

    require(bbs.getAddress(keccak256(jobHash))==msg.sender);
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash,CANCEL))) !=true);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER))) == 0x0);

    bbs.setAddress(keccak256(abi.encodePacked(jobHash,FREELANCER)), freelancer);
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    require(bbo.transferFrom(msg.sender, address(payment), bid));
    emit BidAccepted(keccak256(jobHash), freelancer);
  }
  
}