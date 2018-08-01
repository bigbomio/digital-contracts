pragma solidity ^0.4.24;
import './BBFreelancer.sol';

contract BBFreelancerPayment is BBFreelancer{
  event PaymentClaimed(bytes jobHash, address indexed sender);
  event PaymentAccepted(bytes jobHash, address indexed sender);
  event PaymentRejected(bytes jobHash, address indexed sender);

  // hirer ok with finish Job
  function acceptPayment(bytes jobHash)  public 
  isOwnerJob(jobHash) {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) >= 2);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) != 9);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 9);
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer')));
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    //TODO release funs
    require(bbo.transfer(freelancer, bid));
    emit PaymentAccepted(jobHash, msg.sender);
  }
  // hirer not ok with finish Job
  function rejectPayment(bytes jobHash) public 
  isOwnerJob(jobHash) {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) == 2);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 4);
   emit PaymentRejected(jobHash, msg.sender);
  }
  // freelancer claimeJob with finish Job but hirer not accept payment 
  // need proof of work
  function claimePayment(bytes jobHash) public isFreelancerOfJob(jobHash)
  {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) >= 2);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) != 9);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 5);
    emit PaymentClaimed(jobHash, msg.sender);
  }
}