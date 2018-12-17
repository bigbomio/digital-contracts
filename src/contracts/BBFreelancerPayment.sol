/**
 * Created on 2018-08-13 10:32
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;
import './BBFreelancer.sol';
import './BBLib.sol';
import './BBTCRHelper.sol';
import './zeppelin/token/ERC20/ERC20.sol';

/**
 * @title BBFreelancerPayment
 */
contract BBFreelancerPayment is BBFreelancer{

  event PaymentClaimed(uint256 indexed jobID, address indexed sender);
  event PaymentAccepted(uint256 indexed jobID, address indexed sender);
  event PaymentRejected(uint256 indexed jobID, address indexed sender, uint reason, uint256 rejectedTimestamp);
  event DisputeFinalized(uint256 indexed jobID, address indexed winner);

  BBTCRHelper public tcr = BBTCRHelper(0x0);

  function setTCR(address tcraddress) public onlyOwner {
    tcr = BBTCRHelper(tcraddress);
  }

  uint256 public tokenListID = 0;
  function setTokenListID(uint256 id) public onlyOwner{
    tokenListID = id;
  }

  function isWhiteList(address tokenAddress) public view returns(bool){
    return true;
  //return tcr.isWhitelisted(tokenListID, keccak256(abi.encodePacked(tokenAddress)));
  }
  // hirer ok with finish Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function acceptPayment(uint256 jobID)  public 
  isOwnerJob(jobID) {
    uint256 status = bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS'));
    require(status >= 2);
    require(status <= 4);
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 9);
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,freelancer));
    //release funs
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
  
    require(ERC20(tokenAddress).transfer(freelancer, bid));

    emit PaymentAccepted(jobID, msg.sender);

  }
  // hirer not ok with finish Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function rejectPayment(uint256 jobID, uint reason) public 
  isOwnerJob(jobID) {
    require(bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS')) == 2);
    require(reason > 0);
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 4);
    bbs.setUint(BBLib.toB32(jobID,'JOB_REASON'), reason);
    uint256 rejectedTimestamp = block.timestamp.add(bbs.getUint(keccak256('REJECTED_PAYMENT_LIMIT_TIMESTAMP')));
    bbs.setUint(BBLib.toB32(jobID,'REJECTED_PAYMENT_LIMIT_TIMESTAMP'), rejectedTimestamp);
   emit PaymentRejected(jobID, msg.sender, reason, rejectedTimestamp);

  }
  // freelancer claimeJob with finish Job but hirer not accept payment 
  // need proof of work
  /**
   * @dev 
   * @param jobID Job ID
   */
  function claimePayment(uint256 jobID) public
  {
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    require(msg.sender == freelancer || msg.sender == jobOwner);
    if(msg.sender == freelancer){
      require(bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS')) == 2);
      uint256 finishDate = bbs.getUint(BBLib.toB32(jobID,'JOB_FINISHED_TIMESTAMP'));
      uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'));
      require((finishDate+paymentLimitTimestamp) <= now );
    }else{
      require(bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS')) == 4);
      uint256 rejectedEndTimestamp = bbs.getUint(BBLib.toB32(jobID,'REJECTED_PAYMENT_LIMIT_TIMESTAMP'));
      require(rejectedEndTimestamp <= now );
    }
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 5);
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,freelancer));
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
  
    require(ERC20(tokenAddress).transfer(msg.sender, bid));
    emit PaymentClaimed(jobID, msg.sender);

  }

  /** 
  * @dev check payment status 
  **/
  function checkPayment(uint256 jobID) public view returns(uint256, uint256){
    uint256 finishDate = bbs.getUint(BBLib.toB32(jobID,'JOB_FINISHED_TIMESTAMP'));
    uint256 paymentLimitTimestamp = bbs.getUint(keccak256('PAYMENT_LIMIT_TIMESTAMP'));
    uint256 status = bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS'));
    return (status,finishDate.add(paymentLimitTimestamp));
  }


  function refundBBO(uint256 jobID) public  returns(bool) {
      address owner = bbs.getAddress(BBLib.toB32(jobID));
      uint256 lastDeposit = bbs.getUint(BBLib.toB32(jobID, owner, 'DEPOSIT'));
      address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
    
      if(bbs.getBool(BBLib.toB32(jobID,'JOB_CANCEL')) == true) {
          bbs.setUint(BBLib.toB32(jobID, owner,'DEPOSIT'), 0);
          if(lastDeposit > 0) {
            return ERC20(tokenAddress).transfer(owner, lastDeposit);
          }else
            return true;
      } else {
        address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobID, 'FREELANCER')));
        uint256 bid = bbs.getUint(keccak256(abi.encodePacked(jobID,freelancer)));
        require(bid > 0);
        require(lastDeposit > bid);
        return ERC20(tokenAddress).transfer(owner, lastDeposit - bid);
      }

  }

  /**
   * @dev finalize Dispute
   * @param jobID The job ID 
   */
  function finalizeDispute(uint256 jobID)  public returns(bool) {
    require(bbs.getAddress(BBLib.toB32(jobID)) != 0x0);
    require(bbs.getBool(BBLib.toB32(jobID, 'PAYMENT_FINALIZED'))!=true);
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
    
    address winner = bbs.getAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'));
    require(winner!=address(0x0));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,freelancer));
    require(winner==freelancer||winner==jobOwner);
    bbs.setBool(BBLib.toB32(jobID, 'PAYMENT_FINALIZED'), true);
    require(ERC20(tokenAddress).transfer(winner, bid));
    emit DisputeFinalized(jobID, winner);

    return true;
  } 
}
