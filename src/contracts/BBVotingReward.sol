pragma solidity ^0.4.24;

import './BBDispute.sol';
contract BBVotingReward is BBDispute{
  event PollStarted(bytes jobHash, address indexed creator);
  event PollAgainsted(bytes jobHash, address indexed creator);

	/**
  * @dev finalizePoll for poll
  * @param jobHash Job Hash
  * 
  */
  function finalizePoll(bytes jobHash) public
  isDisputeJob(jobHash)
  {
    address creator = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'POLL_STARTED')));
    require(creator!=address(0x0));
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'EVEIDENCE_ENDDATE')))<=now);
    // check if not have against proof
    if(!isAgaintsPoll(jobHash)){      
      // set winner to creator 
      bbs.setAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')),creator);
      // refun staked for 
      require(bbo.transfer(creator,bboStake));
    }else{
      require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'REVEAL_ENDDATE')))<=now);
      address jobOwner = bbs.getAddress(keccak256(jobHash));
      address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
      uint256 bboStake = bbs.getUint(keccak256(abi.encodePacked(jobHash,jobOwner,'STAKED_DEPOSIT')));
      (uint jobOwnerVotes,uint freelancerVotes,bool voteQuorum) = getPoll(jobHash);
      if(!voteQuorum){
        // cancel poll
        bbs.setAddress(keccak256(abi.encodePacked(jobHash,'POLL_STARTED')), address(0x0));
        // refun money staked
        require(bbo.transfer(jobOwner,bboStake));
        require(bbo.transfer(freelancer,bboStake));
      }else{
        bbs.setAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')), (jobOwnerVotes>freelancerVotes)?jobOwner:freelancer);
        //refun money staked for winner
        require(bbo.transfer(bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER'))), bboStake));
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
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
    uint jobOwnerVotes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTE_FOR',jobOwner)));
    uint freelancerVotes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTE_FOR',freelancer)));
    uint voteQuorum = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTE_QUORUM')));
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
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender,'STAKED_DEPOSIT')), bboStake);
    // save startPoll address
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'POLL_STARTED')), msg.sender);
    // save evidence,commit, reveal EndDate
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'EVEIDENCE_ENDDATE')), evidenceEndDate);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'COMMIT_ENDDATE')), commitEndDate);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'REVEAL_ENDDATE')), revealEndDate);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'VOTE_QUORUM')),bbs.getUint(keccak256('VOTE_QUORUM')) );
    // save creator proofHash
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'CREATOR_PROOF')), proofHash);
    emit PollStarted(jobHash, msg.sender);
  }
  /**
  * @dev againstPoll
  * @param jobHash Job Hash
  * @param againstProofHash Hash of Against Proof 
  * 
  */
  function againstPoll(bytes jobHash, bytes againstProofHash) public 
  isDisputeJob(jobHash)
  canCreatePoll(jobHash)
  {
    address creator = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'POLL_STARTED')));
    require(creator!=0x0);
    require(creator!=msg.sender);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'EVEIDENCE_ENDDATE'))) > now);
    // require sender must staked bbo equal the creator
    uint256 bboStake = bbs.getUint(keccak256(abi.encodePacked(jobHash,creator,'STAKED_DEPOSIT')));
    require(bbo.transferFrom(msg.sender, address(this), bboStake));
    bbs.setUint(keccak256(abi.encodePacked(jobHash,msg.sender,'STAKED_DEPOSIT')), bboStake);

    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'AGAINST_PROOF')), againstProofHash);
    emit PollAgainsted(jobHash, msg.sender);
  }

}