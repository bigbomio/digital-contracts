  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBFreelancer.sol';


/**
 * @title BBVoting contract 
 */
contract BBVoting is BBFreelancer{
  address public bboReward = address(0x0);


  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);
  event VoteCommitted(address indexed voter, bytes jobHash);
  event VoteRevealed(address indexed voter, bytes jobHash, bytes32 secretHash, bytes32 cHash);
  event PollStarted(bytes jobHash, address indexed creator);
  event PollAgainsted(bytes jobHash, address indexed creator);

  modifier pollNotStarted(bytes jobHash){
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'POLL_STARTED')))==0x0);
    uint256 jobStatus = bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS')));
    require(jobStatus == 4);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')))==address(0x0));
    _;
  }
  modifier canCreatePoll(bytes jobHash){
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER')));
    require (msg.sender==jobOwner || msg.sender==freelancer);
    _;
  }

  modifier isDisputeJob(bytes jobHash){
    uint256 jobStatus = bbs.getUint(keccak256(abi.encodePacked(jobHash,'STATUS')));
    require(jobStatus == 4);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')))==address(0x0));
    _;
  }
  function isAgaintsPoll(bytes jobHash) public constant returns(bool){
    return keccak256(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'AGAINST_PROOF'))))!=keccak256("");
  }
  function bytesToBytes32(bytes b) private pure returns (bytes32) {
    bytes32 out;

    for (uint i = 0; i < 32; i++) {
      out |= bytes32(b[i] & 0xFF) >> (i * 8);
    }
    return out;
  }
  function setBBOReward(address rewardAddress) onlyOwner public{
    bboReward = rewardAddress;
  }
  /**
   * @dev request voting rights
   * 
   */
  function requestVotingRights(uint256 numTokens) public {
    require(bbo.balanceOf(msg.sender) >= numTokens);
    uint256 voteTokenBalance = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')));
    require(bbo.transferFrom(msg.sender, address(this), numTokens));
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')), voteTokenBalance.add(numTokens));
    emit VotingRightsGranted(msg.sender, numTokens);
  }
  
  /**
   * @dev withdraw voting rights
   * 
   */
  function withdrawVotingRights(uint256 numTokens) public 
  {
    uint256 voteTokenBalance = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')));
    require (voteTokenBalance > 0);
    if(voteTokenBalance<numTokens){
      numTokens = voteTokenBalance;
    }    
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')), voteTokenBalance.sub(numTokens));
    require(bbo.transfer(msg.sender, numTokens));
    emit VotingRightsWithdrawn(msg.sender, numTokens);
  }
  /**
   * @dev commitVote for poll
   * @param jobHash Job Hash
   * @param secretHash Hash of Choice address and salt uint
   */
  function commitVote(bytes jobHash, bytes32 secretHash, uint256 tokens) public 
  isDisputeJob(jobHash)
  {
    require(isAgaintsPoll(jobHash)==true);
    require(secretHash != 0);
    uint256 voteTokenBalance = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')));
    if(voteTokenBalance<tokens){
      requestVotingRights(tokens.sub(voteTokenBalance));
    }
    require(bbs.getUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE'))) >= tokens);
    // add secretHash
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'SECRET_HASH',msg.sender)), abi.encodePacked(secretHash));
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'VOTES',msg.sender)), tokens);
    emit VoteCommitted(msg.sender, jobHash);
  }

  /**
  * @dev check Hash for poll
  * @param jobHash Job Hash
  * @param choice address 
  * @param salt salt
  */
  function checkHash(bytes jobHash, address choice, uint salt) public view returns(bool){
    bytes32 choiceHash = keccak256(abi.encodePacked(choice,salt));
    bytes32 secretHash = bytesToBytes32(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'SECRET_HASH',msg.sender))));
    return (choiceHash==secretHash);
  }
  /**
  * @dev revealVote for poll
  * @param jobHash Job Hash
  * @param choice address 
  * @param salt salt
  */
  function revealVote(bytes jobHash, address choice, uint salt) public 
  isDisputeJob(jobHash)
  {
    require(isAgaintsPoll(jobHash)==true);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'COMMIT_ENDDATE')))<now);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'REVEAL_ENDDATE')))>now);
    uint256 voteTokenBalance = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'STAKED_VOTE')));
    uint256 votes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTES',msg.sender)));
    // check staked vote
    require(voteTokenBalance>= votes);

    bytes32 choiceHash = keccak256(abi.encodePacked(choice,salt));
    bytes32 secretHash = bytesToBytes32(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'SECRET_HASH',msg.sender))));
    require(choiceHash == secretHash);
    uint256 numVote = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTE_FOR',choice)));
    //save result poll
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'VOTE_FOR',choice)), numVote.add(votes));
    // save voter choice
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'CHOICE',msg.sender)), choice);
    emit VoteRevealed(msg.sender, jobHash, secretHash,choiceHash);
  }
  /**
  * @dev claimReward for poll
  * @param jobHash Job Hash
  *
  */
  function claimReward(bytes jobHash) public {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'REVEAL_ENDDATE')))<=now);
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash,msg.sender,'REWARD_CLAIMED')))!= true);
    uint256 numReward = calcReward(jobHash);
    // set claimed to true
    bbs.setBool(keccak256(abi.encodePacked(jobHash,msg.sender,'REWARD_CLAIMED')), true);
    require(bbo.transferFrom(bboReward, msg.sender, numReward));
  }
  /**
  * @dev calcReward calculate the reward
  * @param jobHash Job Hash
  *
  */
  function calcReward(bytes jobHash) constant public returns(uint256 numReward){
    address winner = bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'DISPUTE_WINNER')));
    require(winner!=address(0x0));
    address choice = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'CHOICE',msg.sender)));
    if(choice == winner){
      uint256 votes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTES',msg.sender)));
      uint256 totalVotes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'VOTE_FOR',choice)));
      uint256 bboStake = bbs.getUint(keccak256(abi.encodePacked(jobHash,choice,'STAKED_DEPOSIT')));
      numReward = votes.mul(bboStake).div(totalVotes);
    }else{
      numReward = bbs.getUint(keccak256('BBO_REWARDS'));
    }
  }
  /**
  * @dev revealVote for poll
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