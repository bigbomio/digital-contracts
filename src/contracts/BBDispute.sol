pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBFreelancerPayment.sol';

contract BBDispute is BBStandard{
  BBFreelancerPayment public payment = BBFreelancerPayment(0x0);
  function setPayment(address p) onlyOwner public  {
    payment = BBFreelancerPayment(p);
  }
  event PollStarted(bytes32 indexed indexJobHash, bytes proofHash, address indexed creator, bytes jobHash);
  event PollAgainsted(bytes32 indexed indexJobHash, address indexed creator,  bytes proofHash, bytes jobHash);
  event PollFinalized(bytes32 indexed indexJobHash, uint256 jobOwnerVotes, uint256 freelancerVotes, bytes jobHash);
  event PollWhiteFlaged(bytes32 indexed indexJobHash, address indexed creator, bytes jobHash);
  event PollExtended(bytes32 indexed indexJobHash, bytes jobHash);
 
  function canCreatePoll(bytes jobHash) private constant returns (bool r){
    address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash, 'FREELANCER'));
    r = (msg.sender==jobOwner || msg.sender==freelancer);
  }
  function isDisputeJob(bytes jobHash) private constant returns(bool r){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobHash ,'STATUS'));
    address winner = bbs.getAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER'));
    r = (jobStatus == 4 && winner==address(0x0));
  }
  function isDisputingJob(bytes jobHash) private constant returns(bool r){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobHash ,'STATUS'));
    address winner = bbs.getAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER'));
    r = (jobStatus == 6 && winner==address(0x0));
  }
  function isAgaintsPoll(bytes jobHash) public constant returns(bool r){
    r = BBLib.toB32(bbs.getBytes(BBLib.toB32(jobHash, getPollID(jobHash),'AGAINST_PROOF')))!=BBLib.toB32("");
  }
  function getPollID(bytes jobHash) internal constant returns(uint256 r){
    r = bbs.getUint(BBLib.toB32(jobHash,'POLL_COUNTER'));
  }
	/**
  * @dev finalizePoll for poll
  * @param jobHash Job Hash
  * 
  */
  function finalizePoll(bytes jobHash) public
  {
    uint256 pID = getPollID(jobHash);
    require(isDisputingJob(jobHash)==true);
    address creator = bbs.getAddress(BBLib.toB32(jobHash, 'POLL_STARTED'));
    require(creator!=address(0x0));
    require(bbs.getUint(BBLib.toB32(jobHash, pID,'EVEIDENCE_ENDDATE'))<=now);

    uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash, pID,'STAKED_DEPOSIT',creator));

    // check if not have against proof
    if(!isAgaintsPoll(jobHash)){      
      // set winner to creator 
      bbs.setAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'),creator);
      // refun staked for 
      require(bbo.transfer(creator,bboStake));
      // cal finalizePayment
      assert(payment.finalizeDispute(jobHash));
    }else{
      require(bbs.getUint(BBLib.toB32(jobHash, pID,'REVEAL_ENDDATE'))<=now);
      address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
      address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
      (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobHash);
      if(jobOwnerVotes == freelancerVotes){
        // cancel poll
        bbs.setAddress(BBLib.toB32(jobHash, 'POLL_STARTED'), address(0x0));
        // refun money staked
        require(bbo.transfer(jobOwner,bboStake));
        require(bbo.transfer(freelancer,bboStake));
        // status to 4
        bbs.setUint(BBLib.toB32(jobHash, 'STATUS'), 4);
        //TODO reset POLL
      }else{
        bbs.setAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'), (jobOwnerVotes>freelancerVotes)?jobOwner:freelancer);
        //refun money staked for winner
        require(bbo.transfer(bbs.getAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER')), bboStake));
        // cal finalizePayment
        assert(payment.finalizeDispute(jobHash));
      }
    }
    emit PollFinalized(BBLib.toB32(jobHash), jobOwnerVotes, freelancerVotes, jobHash);
  }

  
  /**
  * @dev getPoll:
  * @param jobHash Job Hash
  * returns uint ownerVotes, uint freelancerVotes, bool isPass quorum
  * 
  */
  function getPoll(bytes jobHash) public constant returns (uint256, uint256) {
    uint256 pID = getPollID(jobHash);
    address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    uint jobOwnerVotes = bbs.getUint(BBLib.toB32(jobHash, pID,'VOTE_FOR',jobOwner));
    uint freelancerVotes = bbs.getUint(BBLib.toB32(jobHash, pID,'VOTE_FOR',freelancer));    
    return (jobOwnerVotes, freelancerVotes);
  }
  /**
  * @dev startPoll
  * @param jobHash Job Hash
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(bytes jobHash, bytes proofHash) public 
  {
    require(isDisputeJob(jobHash)==true);
    require(canCreatePoll(jobHash)==true);
    require(bbs.getAddress(BBLib.toB32(jobHash, 'POLL_STARTED'))==address(0x0));
    return doStartPoll(jobHash, proofHash);
  }
  function doStartPoll(bytes jobHash, bytes proofHash) internal {
    uint256 pID = getPollID(jobHash);
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
    bbs.setUint(BBLib.toB32(jobHash ,'STATUS'), 6);
    // save staked tokens
    // incres pID
    pID = pID.add(1);
    bbs.setUint(BBLib.toB32(jobHash, 'POLL_COUNTER'), pID);
    bbs.setUint(BBLib.toB32(jobHash, pID,'STAKED_DEPOSIT',msg.sender), bboStake);
    // save startPoll address
    bbs.setAddress(BBLib.toB32(jobHash, 'POLL_STARTED'), msg.sender);
    
    // save evidence,commit, reveal EndDate
    bbs.setUint(BBLib.toB32(jobHash, pID,'EVEIDENCE_ENDDATE'), evidenceEndDate);
    bbs.setUint(BBLib.toB32(jobHash, pID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(jobHash, pID,'REVEAL_ENDDATE'), revealEndDate);
    // save creator proofHash
    bbs.setBytes(BBLib.toB32(jobHash, pID,'CREATOR_PROOF'), proofHash);

    emit PollStarted(BBLib.toB32(jobHash), proofHash, msg.sender, jobHash);
  }
  /**
  * @dev againstPoll
  * @param jobHash Job Hash
  * @param againstProofHash Hash of Against Proof 
  * 
  */
  function againstPoll(bytes jobHash, bytes againstProofHash) public 
  {
    uint256 pID = getPollID(jobHash);
    require(canCreatePoll(jobHash)==true);
    require(isDisputingJob(jobHash)==true);

    address creator = bbs.getAddress(BBLib.toB32(jobHash, 'POLL_STARTED'));
    require(creator!=0x0);
    require(creator!=msg.sender);
    require(bbs.getUint(BBLib.toB32(jobHash, pID,'EVEIDENCE_ENDDATE')) > now);
    return doAgainstPoll(jobHash, againstProofHash, pID, creator);
  }
  function doAgainstPoll(bytes jobHash, bytes againstProofHash, uint256 pID, address creator) internal 
  {
    // require sender must staked bbo equal the creator
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash, pID,'STAKED_DEPOSIT',creator));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    bbs.setUint(BBLib.toB32(jobHash, pID,'STAKED_DEPOSIT',msg.sender), bboStake);

    bbs.setBytes(BBLib.toB32(jobHash, pID,'AGAINST_PROOF'), againstProofHash);

    emit PollAgainsted(BBLib.toB32(jobHash), msg.sender, againstProofHash, jobHash);
  } 

  function whiteflagPoll(bytes jobHash) public{
    uint256 pID = getPollID(jobHash);
    require(canCreatePoll(jobHash)==true);
    require(isDisputingJob(jobHash)==true);
    (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobHash);
    require(jobOwnerVotes==0);
    require(freelancerVotes==0);
    address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    address winner = (msg.sender==jobOwner)?freelancer:jobOwner;
    bbs.setAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'), winner);
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash, pID,'STAKED_DEPOSIT',jobOwner));
    //refun money staked for users
    require(bbo.transfer(jobOwner, bboStake));
    require(bbo.transfer(freelancer, bboStake));
    // // cal finalizePayment
    assert(payment.finalizeDispute(jobHash));
    emit PollWhiteFlaged(BBLib.toB32(jobHash), msg.sender, jobHash);
  }

  function extendPoll(bytes jobHash) public{
    require(canCreatePoll(jobHash)==true);
    require(isDisputingJob(jobHash)==true);
    (uint jobOwnerVotes, uint freelancerVotes) = getPoll(jobHash);
    require(jobOwnerVotes==0);
    require(freelancerVotes==0);
    
    uint256 pID = getPollID(jobHash);
    uint commitDuration = bbs.getUint(BBLib.toB32('COMMIT_DURATION'));
    require(commitDuration > 0);
    uint revealDuration = bbs.getUint(BBLib.toB32('REVEAL_DURATION'));
    require(revealDuration > 0);
    // commitEndDate
    uint commitEndDate = block.timestamp.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);

    bbs.setUint(BBLib.toB32(jobHash, pID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(jobHash, pID,'REVEAL_ENDDATE'), revealEndDate);

    emit PollExtended(BBLib.toB32(jobHash), jobHash);
  }

}