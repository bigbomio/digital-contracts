/**
 * Created on 2018-08-13 10:32
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBLib.sol';

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
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) >= 2);
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) != 9);
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) != 5);
    bbs.setUint(BBLib.toB32(jobHash,'STATUS'), 9);
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    uint256 bid = bbs.getUint(BBLib.toB32(jobHash,freelancer));
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
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) == 2);
    bbs.setUint(BBLib.toB32(jobHash,'STATUS'), 4);
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
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) == 2);
    uint256 finishDate = bbs.getUint(BBLib.toB32(jobHash,'JOB_FINISHED_TIMESTAMP'));
    uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'));
    require((finishDate+paymentLimitTimestamp) <= now );
    //require((finishDate+(14*24*3600)) < now );
    bbs.setUint(BBLib.toB32(jobHash,'STATUS'), 5);
    uint256 bid = bbs.getUint(BBLib.toB32(jobHash,msg.sender));
    require(bbo.transfer(msg.sender, bid));
    emit PaymentClaimed(jobHash, msg.sender);
  }

  /** 
  * @dev check payment status 
  **/
  function checkPayment(bytes jobHash) public view returns(uint256, uint256){
    uint256 finishDate = bbs.getUint(BBLib.toB32(jobHash,'JOB_FINISHED_TIMESTAMP'));
    uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'));
    uint256 status = bbs.getUint(BBLib.toB32(jobHash,'STATUS'));

    return (status,finishDate.add(paymentLimitTimestamp));
  }

  function withdrawAllBBO(bytes jobHash) public  returns(bool) {
      require(bbs.getBool(BBLib.toB32(jobHash,'CANCEL')) == true);
      address owner = bbs.getAddress(keccak256(jobHash));
      uint256  amount = bbs.getUint(BBLib.toB32(jobHash, owner,'DEPOSIT'));
      bbs.setUint(BBLib.toB32(jobHash, owner,'DEPOSIT'), 0);
      if(amount > 0) {
         return bbo.transfer(owner, amount);
      }

  }

  function refundBBO(bytes jobHash) public  returns(bool) {
      address owner = bbs.getAddress(keccak256(jobHash));
      address freelancer = bbs.getAddress(keccak256(jobHash, 'FREELANCER'));
      uint256 lastDeposit = bbs.getUint(BBLib.toB32(jobHash, owner, 'DEPOSIT'));
      uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
      require(bid > 0);
      require(lastDeposit > bid);
      return bbo.transfer(owner, lastDeposit - bid);

  }

  /**
   * @dev finalize Dispute
   * @param jobHash The job Hash 
   */
  function finalizeDispute(bytes jobHash)  public returns(bool) {
    require(bbs.getAddress(keccak256(jobHash)) != 0x0);
    require(bbs.getBool(BBLib.toB32(jobHash, 'PAYMENT_FINALIZED'))!=true);

    address winner = bbs.getAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'));
    require(winner!=address(0x0));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    uint256 bid = bbs.getUint(BBLib.toB32(jobHash,freelancer));
    require(winner==freelancer||winner==jobOwner);
    bbs.setBool(BBLib.toB32(jobHash, 'PAYMENT_FINALIZED'), true);
    require(bbo.transfer(winner, bid));
    emit DisputeFinalized(jobHash, winner);
    return true;
  } 
}
