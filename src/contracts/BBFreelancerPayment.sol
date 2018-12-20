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
  event PaymentTokenAdded(address indexed tokenAddress, bool isAdded);
  event TokenDeposit(address indexed sender, address indexed tokenAddress, uint256 amount, uint256 indexed jobID);
  event JobStatus(uint256 indexed jobID, uint256 status);
  event JobInit(uint256 indexed jobID, address freelancer, address owner, uint256 status, address tokenAddress, uint256 bid);

  address constant ETH_TOKEN_ADDRESS  = address(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0);
  
  mapping(address => bool) private tokens;
  function addToken(address tokenAddress, bool isAdded) public onlyOwner {
    require(tokens[tokenAddress] != isAdded);
    
    tokens[tokenAddress] = isAdded;
    emit PaymentTokenAdded(tokenAddress, isAdded);
  
  }
  /** will call when deposited job **/
  function initJob(uint256 jobID, address freelancer, address owner, uint256 status, 
   address tokenAddress, uint256 bid) public onlyOwner {
    bbs.setAddress(BBLib.toB32(jobID), owner);
    bbs.setAddress(BBLib.toB32(jobID, 'FREELANCER'), freelancer);
    bbs.setUint(BBLib.toB32(jobID, 'JOB_STATUS'), status);
    bbs.setUint(BBLib.toB32(jobID, 'JOB_BID'), bid);
    bbs.setAddress(BBLib.toB32(jobID, 'TOKEN_ADDRESS'), tokenAddress);
    emit JobInit(jobID, freelancer, owner, status, tokenAddress, bid);
  }
  /**
   * Job Status (set by chain?)
   * 1. started (sidechain)  --> will call this function to set to on-chain
   * 2. finished  (sidechain) --> will call this function to set to on-chain
   * 3. cancelled (sidechain) --> will call this function to set to on-chain
   * 4. payment rejected  (onchain)
   * 5. payment claimed (onchain)
   * 6. dispute started (onchain)
   * 7. payment pending deposit (sidechain) --> will call this function to set to on-chain
   * 8. payment deposited (onchain)
   * 9. payment accepted (onchain)
  **/
  function updateJobStatus(uint256 jobID, uint256 status) public onlyOwner {
    if(status!=1||status!=2||status!=8 || status != 3)
      revert();
    uint256 currentStatus = bbs.getUint(BBLib.toB32(jobID, 'JOB_STATUS'));
    require(currentStatus != status);
    // if status change to start -> require currentStatus is deposited
    if(status == 1)
      require(currentStatus==8);
    // if status change to finished -> require currentStatus is started
    if(status == 2)
      require(currentStatus==1);
    // if status change to deposited -> require currentStatus is pending deposit
    // require deposit balance >= job bid
    if(status == 8){
      require(currentStatus==7);
      address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
      uint256 jobDeposited = bbs.getUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'));
      uint256 jobBid = bbs.getUint(BBLib.toB32(jobID, 'JOB_BID'));
      require (jobDeposited>=jobBid);
    }
    bbs.setUint(BBLib.toB32(jobID, 'JOB_STATUS'), status);
    emit JobStatus(jobID, status);
  }
  // 
  function deposit(uint256 jobID, address tokenAddress, uint256 amount) public payable {
    uint256 currentStatus = bbs.getUint(BBLib.toB32(jobID, 'JOB_STATUS'));
    require(currentStatus == 0 || currentStatus == 7);
    require(isWhiteList(tokenAddress)==true);
    require(amount > 0);
    if(tokenAddress==ETH_TOKEN_ADDRESS){
      require (amount==msg.value);
    }else{
      require(ERC20(tokenAddress).transferFrom(msg.sender, address(this), amount));
    }
    uint256 currentBalance = bbs.getUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'));
    bbs.setUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'), currentBalance.add(amount));
    uint256 jobBid = bbs.getUint(BBLib.toB32(jobID, 'JOB_BID'));
    emit TokenDeposit(msg.sender, tokenAddress, amount, jobID);
  }

  function isWhiteList(address tokenAddress) public view returns(bool){
    return tokens[tokenAddress];
  }
  // hirer ok with finish Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function acceptPayment(uint256 jobID)  public 
  isOwnerJob(jobID) {
    //TODO freelancer address ??? && owner job
    uint256 status = bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS'));
    require(status >= 2);
    require(status <= 4);
    require(status != 9);
    require(status != 3);
    bbs.setUint(BBLib.toB32(jobID,'JOB_STATUS'), 9);
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,'JOB_BID'));
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
    if(tokenAddress==ETH_TOKEN_ADDRESS){
       freelancer.transfer(bid);
    }else{
      require(ERC20(tokenAddress).transfer(freelancer, bid));
    }
    emit PaymentAccepted(jobID, msg.sender);

  }
  function refundPayment(uint256 jobID) public 
  isOwnerJob(jobID){
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,'JOB_BID'));
    uint256 status = bbs.getUint(BBLib.toB32(jobID,'JOB_STATUS'));
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
    uint256 currentBalance = bbs.getUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'));
    require(bid > 0);
    require(status != 7);
    //cancelled
    if(status == 3){
      require(currentBalance > 0);
      bbs.setUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'), 0);
      if(tokenAddress==ETH_TOKEN_ADDRESS){
         msg.sender.transfer(currentBalance);
      }else{
        require(ERC20(tokenAddress).transfer(msg.sender, currentBalance));
      }
    }else{
      require(currentBalance > bid);
      uint256 amount = currentBalance.sub(bid);
      bbs.setUint(BBLib.toB32(jobID, tokenAddress ,'DEPOSIT'), bid);
      if(tokenAddress==ETH_TOKEN_ADDRESS){
         msg.sender.transfer(amount);
      }else{
        require(ERC20(tokenAddress).transfer(msg.sender, amount));
      }
    }
  }
  // hirer not ok with finish Job
  /**
   * @dev 
   * @param jobID Job ID
   */
  function rejectPayment(uint256 jobID, uint reason) public 
  isOwnerJob(jobID) {
    //TODO freelancer address ??? && owner job
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
    //TODO freelancer address ??? && owner job
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
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,'JOB_BID'));
    address tokenAddress =  bbs.getAddress(BBLib.toB32(jobID,'TOKEN_ADDRESS'));
    if(tokenAddress==ETH_TOKEN_ADDRESS){
       msg.sender.transfer(bid);
    }else{
      require(ERC20(tokenAddress).transfer(msg.sender, bid));
    }
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
    uint256 bid = bbs.getUint(BBLib.toB32(jobID,'JOB_BID'));
    require(winner==freelancer||winner==jobOwner);
    bbs.setBool(BBLib.toB32(jobID, 'PAYMENT_FINALIZED'), true);
    if(tokenAddress==ETH_TOKEN_ADDRESS){
       winner.transfer(bid);
    }else{
      require(ERC20(tokenAddress).transfer(winner, bid));
    }
    emit DisputeFinalized(jobID, winner);

    return true;
  }

}
