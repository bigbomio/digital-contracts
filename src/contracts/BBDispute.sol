pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBFreelancerPayment.sol';

contract BBDispute is BBStandard{
  BBFreelancerPayment public payment = BBFreelancerPayment(0x0);
  function setPayment(address p) onlyOwner public  {
    payment = BBFreelancerPayment(p);
  }
  event PollStarted(uint256 indexed jobID, bytes proofHash, address indexed creator);
  event PollAgainsted(uint256 indexed jobID, bytes proofHash, address indexed creator);
  event PollFinalized(uint256 indexed jobID, uint256 jobOwnerVotes, uint256 freelancerVotes);
  event PollWhiteFlaged(uint256 indexed jobID, address indexed creator);
  event PollExtended(uint256 indexed jobID);
 
  function canCreatePoll(uint256 jobID) private constant returns (bool r){
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID, 'FREELANCER'));
    r = (msg.sender==jobOwner || msg.sender==freelancer);
  }
  function isDisputeJob(uint256 jobID) private constant returns(bool r){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobID ,'JOB_STATUS'));
    address winner = bbs.getAddress(BBLib.toB32(jobID,'DISPUTE_WINNER'));
    r = (jobStatus == 4 && winner==address(0x0));
  }
  function isDisputingJob(uint256 jobID) private constant returns(bool r){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobID ,'JOB_STATUS'));
    address winner = bbs.getAddress(BBLib.toB32(jobID,'DISPUTE_WINNER'));
    r = (jobStatus == 6 && winner==address(0x0));
  }
  function isAgaintsPoll(uint256 jobID) public constant returns(bool r){
    uint256 pID = getPollID(jobID);
    bytes32 proofHash = BBLib.toB32(jobID, pID,'AGAINST_PROOF');
    r = (BBLib.toB32(bbs.getBytes(proofHash)) != BBLib.toB32(""));
  }
  function getPollID(uint256 jobID) internal constant returns(uint256 r){
    r = bbs.getUint(BBLib.toB32(jobID,'POLL_COUNTER'));
  }
	/**
  * @dev finalizePoll for poll
  * @param jobID Job ID
  * 
  */
  function finalizePoll(uint256 jobID) public
  {
    uint256 pID = getPollID(jobID);
    require(isDisputingJob(jobID)==true);
    address creator = bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'));
    require(creator!=address(0x0));
    require(bbs.getUint(BBLib.toB32(jobID, pID,'EVEIDENCE_ENDDATE'))<=now);

    uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, pID,'STAKED_DEPOSIT',creator));

    // check if not have against proof
    if(!isAgaintsPoll(jobID)){      
      // set winner to creator 
      bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'),creator);
      // refun staked for 
      require(bbo.transfer(creator,bboStake));
      // cal finalizePayment
      assert(payment.finalizeDispute(jobID));
    }else{
      require(bbs.getUint(BBLib.toB32(jobID, pID,'REVEAL_ENDDATE'))<=now);
      address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
      address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
      (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobID);
      if(jobOwnerVotes == freelancerVotes){
        // cancel poll
        bbs.setAddress(BBLib.toB32(jobID, 'POLL_STARTED'), address(0x0));
        // refun money staked
        require(bbo.transfer(jobOwner,bboStake));
        require(bbo.transfer(freelancer,bboStake));
        // status to 4
        bbs.setUint(BBLib.toB32(jobID, 'JOB_STATUS'), 4);
        //TODO reset POLL
      }else{
        bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'), (jobOwnerVotes>freelancerVotes)?jobOwner:freelancer);
        //refun money staked for winner
        require(bbo.transfer(bbs.getAddress(BBLib.toB32(jobID,'DISPUTE_WINNER')), bboStake));
        // cal finalizePayment
        assert(payment.finalizeDispute(jobID));
      }
    }
    emit PollFinalized(jobID, jobOwnerVotes, freelancerVotes);
  }

  
  /**
  * @dev getPoll:
  * @param jobID Job ID
  * returns uint ownerVotes, uint freelancerVotes, bool isPass quorum
  * 
  */
  function getPoll(uint256 jobID) public constant returns (uint256, uint256) {
    uint256 pID = getPollID(jobID);
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    uint jobOwnerVotes = bbs.getUint(BBLib.toB32(jobID, pID,'VOTE_FOR',jobOwner));
    uint freelancerVotes = bbs.getUint(BBLib.toB32(jobID, pID,'VOTE_FOR',freelancer));    
    return (jobOwnerVotes, freelancerVotes);
  }
  /**
  * @dev startPoll
  * @param jobID Job ID
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(uint256 jobID, bytes proofHash) public 
  {
    require(isDisputeJob(jobID)==true);
    require(canCreatePoll(jobID)==true);
    require(bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'))==address(0x0));
    return doStartPoll(jobID, proofHash);
  }
  function doStartPoll(uint256 jobID, bytes proofHash) internal {
    uint256 pID = getPollID(jobID);
    uint evidenceDuration = bbs.getUint(BBLib.toB32('EVIDENCE_DURATION'));
    require(evidenceDuration > 0);
    uint commitDuration = bbs.getUint(BBLib.toB32('COMMIT_DURATION'));
    require(commitDuration > 0);
    uint revealDuration = bbs.getUint(BBLib.toB32('REVEAL_DURATION'));
    require(revealDuration > 0);
    // evidenceEndDate
    uint evidenceEndDate = block.timestamp.add(evidenceDuration);
    // commitEndDate
    uint commitEndDate = evidenceEndDate.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);
    
    // require sender must staked 
    uint256 bboStake = bbs.getUint(BBLib.toB32('STAKED_DEPOSIT'));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    //set status to 6
    bbs.setUint(BBLib.toB32(jobID ,'JOB_STATUS'), 6);
    // save staked tokens
    // incres pID
    pID = pID.add(1);
    bbs.setUint(BBLib.toB32(jobID, 'POLL_COUNTER'), pID);
    bbs.setUint(BBLib.toB32(jobID, pID,'STAKED_DEPOSIT',msg.sender), bboStake);
    // save startPoll address
    bbs.setAddress(BBLib.toB32(jobID, 'POLL_STARTED'), msg.sender);
    
    // save evidence,commit, reveal EndDate
    bbs.setUint(BBLib.toB32(jobID, pID,'EVEIDENCE_ENDDATE'), evidenceEndDate);
    bbs.setUint(BBLib.toB32(jobID, pID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(jobID, pID,'REVEAL_ENDDATE'), revealEndDate);
    // save creator proofHash
    bbs.setBytes(BBLib.toB32(jobID, pID,'CREATOR_PROOF'), proofHash);

    emit PollStarted(jobID, proofHash, msg.sender);
  }
  /**
  * @dev againstPoll
  * @param jobID Job ID
  * @param againstProofHash Hash of Against Proof 
  * 
  */
  function againstPoll(uint256 jobID, bytes againstProofHash) public 
  {
    uint256 pID = getPollID(jobID);
    require(canCreatePoll(jobID)==true);
    require(isDisputingJob(jobID)==true);

    address creator = bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'));
    require(creator!=0x0);
    require(creator!=msg.sender);
    require(bbs.getUint(BBLib.toB32(jobID, pID,'EVEIDENCE_ENDDATE')) > now);
    return doAgainstPoll(jobID, againstProofHash, pID, creator);
  }
  function doAgainstPoll(uint256 jobID, bytes againstProofHash, uint256 pID, address creator) internal 
  {
    // require sender must staked bbo equal the creator
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, pID,'STAKED_DEPOSIT',creator));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    bbs.setUint(BBLib.toB32(jobID, pID,'STAKED_DEPOSIT',msg.sender), bboStake);

    bbs.setBytes(BBLib.toB32(jobID, pID,'AGAINST_PROOF'), againstProofHash);
    emit PollAgainsted(jobID, againstProofHash, msg.sender);
  } 

  function whiteflagPoll(uint256 jobID) public{
    uint256 pID = getPollID(jobID);
    require(canCreatePoll(jobID)==true);
    require(isDisputingJob(jobID)==true);
    (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobID);
    require(jobOwnerVotes==0);
    require(freelancerVotes==0);
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    address winner = (msg.sender==jobOwner)?freelancer:jobOwner;
    bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'), winner);
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, pID,'STAKED_DEPOSIT',jobOwner));
    //refun money staked for users
    require(bbo.transfer(jobOwner, bboStake));
    require(bbo.transfer(freelancer, bboStake));
    // // cal finalizePayment
    assert(payment.finalizeDispute(jobID));
    emit PollWhiteFlaged(jobID, msg.sender);
  }

  function extendPoll(uint256 jobID) public{
    require(canCreatePoll(jobID)==true);
    require(isDisputingJob(jobID)==true);
    (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobID);
    require(jobOwnerVotes==0);
    require(freelancerVotes==0);
    
    uint256 pID = getPollID(jobID);
    uint commitDuration = bbs.getUint(BBLib.toB32('COMMIT_DURATION'));
    require(commitDuration > 0);
    uint revealDuration = bbs.getUint(BBLib.toB32('REVEAL_DURATION'));
    require(revealDuration > 0);
    // commitEndDate
    uint commitEndDate = block.timestamp.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);

    bbs.setUint(BBLib.toB32(jobID, pID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(jobID, pID,'REVEAL_ENDDATE'), revealEndDate);

    emit PollExtended(jobID);
  }

}