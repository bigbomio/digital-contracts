pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBFreelancerPayment.sol';

contract BBFreelancerBid is BBFreelancer{

  BBFreelancerPayment payment = BBFreelancerPayment(0x0);

  function setPaymentContract(address paymentAddress) onlyOwner public {
    payment = BBFreelancerPayment(paymentAddress);
  }
  function getPaymentContract() onlyOwner public returns (address)  {
    return payment;
  }

  event BidCreated(bytes jobHash, address indexed owner, uint256 bid, uint created);
  event BidCanceled(bytes jobHash, address indexed owner);
  event BidAccepted(bytes jobHash, address indexed freelancer);

   // freelancer bid job
  function createBid(bytes jobHash, uint256 bid) public 
   isNotOwnerJob(jobHash)
   isNotCanceled(jobHash)
   jobNotStarted(jobHash) {
    
    // bid must in range budget
    require(bid <= bbs.getUint(keccak256(abi.encodePacked(jobHash, 'budget'))));
    if(bbs.getBool(keccak256(abi.encodePacked(jobHash, msg.sender, 'cancel'))) != true){
      // get number of bid total
      uint256 jobBidCounter = bbs.getUint(keccak256(abi.encodePacked(jobHash,'bidCount')));
      // set next user
      bbs.setUint(keccak256(abi.encodePacked(jobHash,'bidCount')), jobBidCounter+1);
      bbs.setAddress(keccak256(abi.encodePacked(jobHash,'bid', jobBidCounter+1)), msg.sender);
    }
    // set user bid value
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender)), bid);

    emit BidCreated(jobHash, msg.sender, bid, now);
  }
  // freelancer cancel bid
  function cancelBid(bytes jobHash) public isNotOwnerJob(jobHash) {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash, msg.sender)))!=0x0);

    // check the job is not has freelancer yet
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer'))) == 0x0);
    // set user bid value to 0
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender)), 0);
    bbs.setBool(keccak256(abi.encodePacked(jobHash,msg.sender, 'cancel')), true);
    emit BidCanceled(jobHash, msg.sender);
  }

  // hirer accept bid
  function acceptBid(bytes jobHash, address freelancer) public {

    require(bbs.getAddress(keccak256(jobHash))==msg.sender);
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash,'cancel'))) !=true);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer'))) == 0x0);

    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'freelancer')), freelancer);
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    require(bbo.transferFrom(msg.sender, address(payment), bid));
    emit BidAccepted(jobHash, freelancer);
  }
  
}