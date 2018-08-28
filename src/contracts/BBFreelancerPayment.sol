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
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS'))) >= 2);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS'))) != 9);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS'))) != 5);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'STATUS')), 9);
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
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
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS'))) == 2);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'STATUS')), 4);
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
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS'))) == 2);
    uint256 status = bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS')));
    uint256 finishDate = bbs.getUint(keccak256(abi.encodePacked(jobHash,'JOB_FINISHED_TIMESTAMP')));
    uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'));
    require((finishDate+paymentLimitTimestamp) <= now );
    //require((finishDate+(14*24*3600)) < now );
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'STATUS')), 5);
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,msg.sender)));
    require(bbo.transfer(msg.sender, bid));
    emit PaymentClaimed(jobHash, msg.sender);
  }
  

  /**
   * @dev finalize Dispute
   * @param jobHash The job Hash 
   */
  function finalizeDispute(bytes jobHash)  public {
    require(bbs.getAddress(keccak256(jobHash)) != 0x0);
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash, 'PAYMENT_FINALIZED')))!=true);

    address winner = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')));
    require(winner!=address(0x0));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
    require(winner==freelancer||winner==jobOwner);
    bbs.setBool(keccak256(abi.encodePacked(jobHash, 'PAYMENT_FINALIZED')), true);
    require(bbo.transfer(winner, bid));
    emit DisputeFinalized(jobHash, winner);
  } 
}