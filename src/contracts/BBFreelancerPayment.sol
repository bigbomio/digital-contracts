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
  event PaymentClaimed(bytes32 jobHash, address indexed sender);
  event PaymentAccepted(bytes32 jobHash, address indexed sender);
  event PaymentRejected(bytes32 jobHash, address indexed sender, uint reason, uint256 rejectedTimestamp);
  event DisputeFinalized(bytes32 jobHash, address indexed winner);

  // hirer ok with finish Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function acceptPayment(bytes jobHash)  public 
  isOwnerJob(jobHash) {
    uint256 status = bbs.getUint(BBLib.toB32(jobHash,'STATUS'));
    require(status >= 2);
    require(status <= 4);
    bbs.setUint(BBLib.toB32(jobHash,'STATUS'), 9);
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    uint256 bid = bbs.getUint(BBLib.toB32(jobHash,freelancer));
    //TODO release funs
    require(bbo.transfer(freelancer, bid));
    emit PaymentAccepted(keccak256(jobHash), msg.sender);
  }
  // hirer not ok with finish Job
  /**
   * @dev 
   * @param jobHash Job Hash
   */
  function rejectPayment(bytes jobHash, uint reason) public 
  isOwnerJob(jobHash) {
    require(bbs.getUint(BBLib.toB32(jobHash,'STATUS')) == 2);
    require(reason > 0);
    bbs.setUint(BBLib.toB32(jobHash,'STATUS'), 4);
    bbs.setUint(BBLib.toB32(jobHash,'REASON'), reason);
    uint256 rejectedTimestamp = block.timestamp.add(bbs.getUint(keccak256('REJECTED_PAYMENT_LIMIT_TIMESTAMP')));
    bbs.setUint(BBLib.toB32(jobHash,'REJECTED_PAYMENT_LIMIT_TIMESTAMP'), rejectedTimestamp);
   emit PaymentRejected(keccak256(jobHash), msg.sender, reason, rejectedTimestamp);
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
    emit PaymentClaimed(keccak256(jobHash), msg.sender);
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


  function refundBBO(bytes jobHash) public  returns(bool) {
      address owner = bbs.getAddress(keccak256(jobHash));
      uint256 lastDeposit = bbs.getUint(BBLib.toB32(jobHash, owner, 'DEPOSIT'));
      if(bbs.getBool(BBLib.toB32(jobHash,'CANCEL')) == true) {
          bbs.setUint(BBLib.toB32(jobHash, owner,'DEPOSIT'), 0);
          if(lastDeposit > 0) {
            return bbo.transfer(owner, lastDeposit);
          }else
            return true;
      } else {
        address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'FREELANCER')));
        uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobHash,freelancer)));
        require(bid > 0);
        require(lastDeposit > bid);
        return bbo.transfer(owner, lastDeposit - bid);
      }

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
    emit DisputeFinalized(keccak256(jobHash), winner);
    return true;
  } 
}
