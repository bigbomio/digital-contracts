pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBFreelancerPayment.sol';
import './BBVoting.sol';
import './BBVotingHelper.sol';

contract BBDispute is BBStandard{
  BBFreelancerPayment public payment = BBFreelancerPayment(0x0);
  BBVoting public voting = BBVoting(0x0);
  BBVotingHelper public votingHelper = BBVotingHelper(0x0);
  
  function setPayment(address p) onlyOwner public  {
    payment = BBFreelancerPayment(p);
  }

  function setVoting(address p) onlyOwner public  {
    voting = BBVoting(p);
  }
  function setVotingHelper(address p) onlyOwner public  {
    votingHelper = BBVotingHelper(p);
  }
  
  event PollFinalized(uint256 indexed jobID, uint256 winner);
 
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
    bytes32 proofHash = BBLib.toB32(jobID,'AGAINST_PROOF',pID);
    r = (BBLib.toB32(bbs.getBytes(proofHash)) != BBLib.toB32(""));
  }
  function getPollID(uint256 jobID) internal constant returns(uint256 r){
    r = bbs.getUint(BBLib.toB32(jobID,'POLL_ID'));
  }
  /**
  * @dev finalizePoll for poll
  * @param jobID Job ID
  * 
  */
  function finalizePoll(uint256 jobID) public
  {
    uint256 pID = getPollID(jobID);
    (bool isFinished, uint256 winner,, bool hasVote, uint256 quorum) = votingHelper.getPollWinner(pID);
    require(isDisputingJob(jobID)==true);
    address creator = bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'));
    require(creator!=address(0x0));
    (,,uint256 addPollOptionEndDate,,) = votingHelper.getPollStage(pID);
    require(addPollOptionEndDate <= now);
    //TODO
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT', pID,creator));
    // check if not have against proof
    if(!isAgaintsPoll(jobID)){      
      // set winner to creator 
      bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'),creator);
      // refun staked for 
      require(bbo.transfer(creator,bboStake));
      // cal finalizePayment
      assert(payment.finalizeDispute(jobID));
    }else{
      require(isFinished == true);
      address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
      address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
      if(winner == 0 || quorum == 50){
        // cancel poll
        assert(voting.updatePoll(pID, true, 0, 0));
        // refun money staked
        require(bbo.transfer(jobOwner,bboStake));
        require(bbo.transfer(freelancer,bboStake));
        // status to 4
        bbs.setUint(BBLib.toB32(jobID, 'JOB_STATUS'), 4);
        //TODO reset POLL
      }else{

        bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'), (winner==1)?creator:(creator==jobOwner)?freelancer:jobOwner);
        //refun money staked for winner
        require(bbo.transfer(bbs.getAddress(BBLib.toB32(jobID,'DISPUTE_WINNER')), bboStake));
        // cal finalizePayment
        assert(payment.finalizeDispute(jobID));
      }
    }
    emit PollFinalized(jobID, winner);

  }

  /**
  * @dev startDispute
  * @param jobID Job ID
  * @param proofHash Hash of Proof 
  * 
  */
  function startDispute(uint256 jobID, bytes proofHash) public 
  {
    require(isDisputeJob(jobID)==true);
    require(canCreatePoll(jobID)==true);
    require(bbs.getUint(BBLib.toB32(jobID, 'POLL_ID'))==0x0);
    return doStartPoll(jobID, proofHash);
  }
  function doStartPoll(uint256 jobID, bytes proofHash) private {

    uint evidenceDuration = bbs.getUint(BBLib.toB32('EVIDENCE_DURATION'));
    require(evidenceDuration > 0);
    uint commitDuration = bbs.getUint(BBLib.toB32('COMMIT_DURATION'));
    require(commitDuration > 0);
    uint revealDuration = bbs.getUint(BBLib.toB32('REVEAL_DURATION'));
    require(revealDuration > 0);
    // require sender must staked 
    uint256 bboStake = bbs.getUint(BBLib.toB32('STAKED_DEPOSIT'));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    // startPoll
    uint256 pollID = voting.startPoll(proofHash, evidenceDuration, commitDuration, revealDuration);
    assert(pollID>0);
    // save poll
    bbs.setUint(BBLib.toB32(jobID, 'POLL_ID'), pollID);
    //set status to 6
    bbs.setUint(BBLib.toB32(jobID ,'JOB_STATUS'), 6);
    // save staked tokens
    bbs.setUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT', pollID, msg.sender), bboStake);
    // save startPoll address
    bbs.setAddress(BBLib.toB32(jobID, 'POLL_STARTED'), msg.sender);
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
    require(pID > 0);
    require(canCreatePoll(jobID)==true);
    require(isDisputingJob(jobID)==true);

    address creator = bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'));
    require(creator!=0x0);
    require(creator!=msg.sender);
    require(bbs.getUint(BBLib.toB32(jobID, 'EVEIDENCE_ENDDATE',pID)) > now);
    return doAgainstPoll(jobID, againstProofHash, pID, creator);
  }
  function doAgainstPoll(uint256 jobID, bytes againstProofHash, uint256 pID, address creator) internal 
  {
    // require sender must staked bbo equal the creator
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT', pID, creator));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    bbs.setUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT',pID,msg.sender), bboStake);
    assert(voting.addPollOption(pID,againstProofHash));
  } 

  function updatePoll(uint256 jobID,bool whiteFlag) public {
    require(canCreatePoll(jobID)==true);
    require(isDisputingJob(jobID)==true);
    uint256 pollID = getPollID(jobID);
    (bool isFinished,,, bool hasVote,) = votingHelper.getPollWinner(pollID);
    require(hasVote!=true);
    require(isFinished==true);
    address jobOwner = bbs.getAddress(BBLib.toB32(jobID));
    address freelancer = bbs.getAddress(BBLib.toB32(jobID,'FREELANCER'));
    if(whiteFlag == true){
      bbs.setAddress(BBLib.toB32(jobID, 'DISPUTE_WINNER'), (msg.sender==jobOwner)?freelancer:jobOwner);
      uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT', pollID,jobOwner));
      //refun money staked for users
      require(bbo.transfer(jobOwner, bboStake));
      require(bbo.transfer(freelancer, bboStake));
      // cal finalizePayment
      assert(voting.updatePoll(pollID, true, 0, 0));
      assert(payment.finalizeDispute(jobID));
      
    }else{
      uint commitDuration = bbs.getUint(BBLib.toB32('COMMIT_DURATION'));
      require(commitDuration > 0);
      uint revealDuration = bbs.getUint(BBLib.toB32('REVEAL_DURATION'));
      require(revealDuration > 0);
      assert(voting.updatePoll(pollID, false, commitDuration, revealDuration));

    }
  }

  /**
  * @dev claimReward for poll
  * @param jobID Job Hash
  *
  */
  function claimReward(uint256 jobID) public {
    uint256 pollID = getPollID(jobID);
    require(pollID > 0);
    require(bbs.getUint(BBLib.toB32(pollID ,'REVEAL_ENDDATE'))<=now);
    require(bbs.getBool(BBLib.toB32(pollID ,'REWARD_CLAIMED', msg.sender))!= true);
    (uint256 numReward, bool win) = calcReward(pollID);
    require (numReward > 0);
    // set claimed to true
    bbs.setBool(BBLib.toB32(pollID ,'REWARD_CLAIMED',msg.sender), true);
    // todo senBBO
    require(bbo.transfer(msg.sender, numReward));
  }
  /**
  * @dev calcReward calculate the reward
  * @param jobID Job Hash
  *
  */
  function calcReward(uint256 jobID) constant public returns(uint256 numReward, bool win){
    if(bbs.getBool(BBLib.toB32(pollID ,'REWARD_CLAIMED', msg.sender))== false){
      uint256 pollID = getPollID(jobID);
      uint256 userVotes =  votingHelper.getNumPassingTokens(msg.sender, pollID);
      address creator = bbs.getAddress(BBLib.toB32(jobID, 'POLL_STARTED'));
      (bool isFinished,, uint256 winnerVotes, bool hasVote, uint256 quorum) = votingHelper.getPollWinner(pollID);
      if(isFinished==true && hasVote == true){
        if(userVotes>0 && quorum > 50){
          uint256 bboStake = bbs.getUint(BBLib.toB32(jobID, 'STAKED_DEPOSIT', pollID,creator));
          numReward = userVotes.mul(bboStake).div(winnerVotes); // (vote/totalVotes) * staked
          win = true;
        }else{
          numReward = bbs.getUint(BBLib.toB32('BBO_REWARDS'));
        }
      }
    }
  }
}
