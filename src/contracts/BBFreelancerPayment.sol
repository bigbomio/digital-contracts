/**
 * Created on 2018-08-13 10:32
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';

/**
 * @title BBFreelancerPayment
 */
contract BBFreelancerPayment is BBFreelancer{
  event PaymentClaimed(bytes jobHash, address indexed sender);
  event PaymentAccepted(bytes jobHash, address indexed sender);
  event PaymentRejected(bytes jobHash, address indexed sender);
  event DisputeFinalized(bytes jobHash, address indexed winner);

  // hirer ok with finish Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function acceptPayment(bytes jobHash)  public 
  isOwnerJob(jobHash) {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) >= 2);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) != 9);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) != 5);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 9);
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer')));
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    //TODO release funs
    require(bbo.transfer(freelancer, bid));
    emit PaymentAccepted(jobHash, msg.sender);
  }
  // hirer not ok with finish Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function rejectPayment(bytes jobHash) public 
  isOwnerJob(jobHash) {
    uint timeJob =  bbs.getUint(keccak256(abi.encodePacked(jobHash,'timeDone')));
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) == 2);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 4);
   emit PaymentRejected(jobHash, msg.sender);
  }
  // freelancer claimeJob with finish Job but hirer not accept payment 
  // need proof of work
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function claimePayment(bytes jobHash) public isFreelancerOfJob(jobHash)
  {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) == 2);
    uint256 status = bbs.getUint(keccak256(abi.encodePacked(jobHash,'status')));
    uint256 finishDate = bbs.getUint(keccak256(abi.encodePacked(jobHash,'finishedTimestamp')));
    uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PaymentLimitTimestamp'));
    require((finishDate+paymentLimitTimestamp) <= now );
    //require((finishDate+(14*24*3600)) < now );
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'status')), 5);
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,msg.sender)));
    require(bbo.transfer(msg.sender, bid));
    emit PaymentClaimed(jobHash, msg.sender);
  }
  /**
   * @dev 
   * @param timestamp The time limit 
   */
  function setPaymentLimitTimestamp(uint256 timestamp) public onlyOwner {
    require(timestamp > 0);
    bbs.setUint(keccak256('PaymentLimitTimestamp'), timestamp);
  }
  /**
   * @dev 
   * @return time
   */
  function getPaymentLimitTimestamp () public view onlyOwner returns(uint256 time) {
    time = bbs.getUint(keccak256('PaymentLimitTimestamp'));
  }

  /**
   * @dev finalize Dispute
   * @param jobHash The job Hash 
   */
  function finalizeDispute(bytes jobHash)  public {
    require(bbs.getAddress(keccak256(jobHash)) != 0x0);
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash, 'isFinalized')))!=true);

    address winner = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'disputedWinner')));
    require(winner!=address(0x0));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer')));
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    require(winner==freelancer||winner==jobOwner);
    bbs.setBool(keccak256(abi.encodePacked(jobHash, 'isFinalized')), true);
    require(bbo.transfer(winner, bid));
    emit DisputeFinalized(jobHash, winner);
  } 
}