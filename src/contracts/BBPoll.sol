pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';

contract BBPoll is BBStandard{
  event PollStarted(bytes jobHash, address indexed creator);
  event PollAgainsted(bytes jobHash, address indexed creator);

  modifier pollNotStarted(bytes jobHash){
    require(bbs.getAddress(BBLib.toB32(jobHash,'POLL_STARTED'))==0x0);
    require(isDisputeJob(jobHash)==true);
     _;
  }
  modifier canCreatePoll(bytes jobHash){
    address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    require (msg.sender==jobOwner || msg.sender==freelancer);
    _;
  }
  function isDisputeJob(bytes jobHash) private returns(bool){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobHash,'STATUS'));
    address winner = bbs.getAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER'));
    return(jobStatus == 4 && winner==address(0x0));
  }
  function isAgaintsPoll(bytes jobHash) public constant returns(bool){
    return BBLib.toB32(bbs.getBytes(BBLib.toB32(jobHash,'AGAINST_PROOF')))!=BBLib.toB32("");
  }
  
	/**
  * @dev finalizePoll for poll
  * @param jobHash Job Hash
  * 
  */
  function finalizePoll(bytes jobHash) public
  {
    require(isDisputeJob(jobHash)==true);
    address creator = bbs.getAddress(BBLib.toB32(jobHash,'POLL_STARTED'));
    require(creator!=address(0x0));
    require(bbs.getUint(BBLib.toB32(jobHash,'EVEIDENCE_ENDDATE'))<=now);

    // check if not have against proof
    if(!isAgaintsPoll(jobHash)){      
      // set winner to creator 
      bbs.setAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER'),creator);
      // refun staked for 
      require(bbo.transfer(creator,bboStake));
    }else{
      require(bbs.getUint(BBLib.toB32(jobHash,'REVEAL_ENDDATE'))<=now);
      address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
      address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
      uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash,'STAKED_DEPOSIT',jobOwner));
      (uint jobOwnerVotes,uint freelancerVotes,bool voteQuorum) = getPoll(jobHash);
      if(!voteQuorum){
        // cancel poll
        bbs.setAddress(BBLib.toB32(jobHash,'POLL_STARTED'), address(0x0));
        // refun money staked
        require(bbo.transfer(jobOwner,bboStake));
        require(bbo.transfer(freelancer,bboStake));
      }else{
        bbs.setAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER'), (jobOwnerVotes>freelancerVotes)?jobOwner:freelancer);
        //refun money staked for winner
        require(bbo.transfer(bbs.getAddress(BBLib.toB32(jobHash,'DISPUTE_WINNER')), bboStake));
      }
    }
  }
  /**
  * @dev getPoll:
  * @param jobHash Job Hash
  * returns uint ownerVotes, uint freelancerVotes, bool isPass quorum
  * 
  */
  function getPoll(bytes jobHash) public constant returns (uint256, uint256, bool) {
    address jobOwner = bbs.getAddress(BBLib.toB32(jobHash));
    address freelancer = bbs.getAddress(BBLib.toB32(jobHash,'FREELANCER'));
    uint jobOwnerVotes = bbs.getUint(BBLib.toB32(jobHash,'VOTE_FOR',jobOwner));
    uint freelancerVotes = bbs.getUint(BBLib.toB32(jobHash,'VOTE_FOR',freelancer));
    uint voteQuorum = bbs.getUint(BBLib.toB32(jobHash,'VOTE_QUORUM'));
    bool isPass = false;
    if(jobOwnerVotes>freelancerVotes){
      isPass = (jobOwnerVotes*100)>voteQuorum*(jobOwnerVotes+freelancerVotes);
    }else{
      isPass = (freelancerVotes*100)>voteQuorum*(jobOwnerVotes+freelancerVotes);
    }
    return (jobOwnerVotes, freelancerVotes, isPass);
  }
  /**
  * @dev startPoll
  * @param jobHash Job Hash
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(bytes jobHash, bytes proofHash) public 
  pollNotStarted(jobHash)
  canCreatePoll(jobHash)
  {
    uint evidenceDuration = bbs.getUint(keccak256('EVIDENCE_DURATION'));
    require(evidenceDuration > 0);
    uint commitDuration = bbs.getUint(keccak256('COMMIT_DURATION'));
    require(commitDuration > 0);
    uint revealDuration = bbs.getUint(keccak256('REVEAL_DURATION'));
    require(revealDuration > 0);
    // evidenceEndDate
    uint evidenceEndDate = block.timestamp.add(evidenceDuration);
    // commitEndDate
    uint commitEndDate = evidenceEndDate.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);
    // require sender must staked 
    uint256 bboStake = bbs.getUint(keccak256('STAKED_DEPOSIT'));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    // save staked tokens
    bbs.setUint(BBLib.toB32(jobHash,'STAKED_DEPOSIT',msg.sender), bboStake);
    // save startPoll address
    bbs.setAddress(BBLib.toB32(jobHash,'POLL_STARTED'), msg.sender);
    // save evidence,commit, reveal EndDate
    bbs.setUint(BBLib.toB32(jobHash,'EVEIDENCE_ENDDATE'), evidenceEndDate);
    bbs.setUint(BBLib.toB32(jobHash,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(jobHash,'REVEAL_ENDDATE'), revealEndDate);
    bbs.setUint(BBLib.toB32(jobHash,'VOTE_QUORUM'),bbs.getUint(keccak256('VOTE_QUORUM')) );
    // save creator proofHash
    bbs.setBytes(BBLib.toB32(jobHash,'CREATOR_PROOF'), proofHash);
    emit PollStarted(jobHash, msg.sender);
  }
  /**
  * @dev againstPoll
  * @param jobHash Job Hash
  * @param againstProofHash Hash of Against Proof 
  * 
  */
  function againstPoll(bytes jobHash, bytes againstProofHash) public 
  canCreatePoll(jobHash)
  {
    require(isDisputeJob(jobHash)==true);
    address creator = bbs.getAddress(BBLib.toB32(jobHash,'POLL_STARTED'));
    require(creator!=0x0);
    require(creator!=msg.sender);
    require(bbs.getUint(BBLib.toB32(jobHash,'EVEIDENCE_ENDDATE')) > now);
    // require sender must staked bbo equal the creator
    uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash,'STAKED_DEPOSIT',creator));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    bbs.setUint(BBLib.toB32(jobHash,'STAKED_DEPOSIT',msg.sender), bboStake);

    bbs.setBytes(BBLib.toB32(jobHash,'AGAINST_PROOF'), againstProofHash);
    emit PollAgainsted(jobHash, msg.sender);
  }

}