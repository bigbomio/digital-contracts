  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
/**
 * @title BBVoting contract 
 */
contract BBVoting is BBStandard{
  address public bboReward = address(0x0);

  event PollStarted(uint256 indexed pollID, uint256 indexed pollType, address indexed creator, bytes relatedTo);
  event PollOptionAdded(uint256 indexed pollID, address indexed creator, bytes pollOption);
  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);
  event VoteCommitted(address indexed voter, uint256 indexed pollID);
  event VoteRevealed(address indexed voter, uint256 indexed pollID, bytes32 secretHash);
  
  // event PollFinalized(bytes32 indexed indexJobHash, uint256 jobOwnerVotes, uint256 freelancerVotes, bytes jobHash);
  // event PollWhiteFlaged(bytes32 indexed indexJobHash, address indexed creator, bytes jobHash);
  // event PollExtended(bytes32 indexed indexJobHash, bytes jobHash);
 
  function setBBOReward(address rewardAddress) onlyOwner public{
    bboReward = rewardAddress;
  }

  /**
   * @dev request voting rights
   * 
   */
  function requestVotingRights(uint256 numTokens) public {
    require(bbo.balanceOf(msg.sender) >= numTokens);
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    require(bbo.transferFrom(msg.sender, address(this), numTokens));
    bbs.setUint(BBLib.toB32(msg.sender,'STAKED_VOTE'), voteTokenBalance.add(numTokens));
    emit VotingRightsGranted(msg.sender, numTokens);
  }
  
  /**
   * @dev withdraw voting rights
   * 
   */
  function withdrawVotingRights(uint256 numTokens) public 
  {
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    require (voteTokenBalance > 0);
    require (numTokens > 0);
    require (numTokens<= voteTokenBalance);
    bbs.setUint(BBLib.toB32(msg.sender,'STAKED_VOTE'), voteTokenBalance.sub(numTokens));
    require(bbo.transfer(msg.sender, numTokens));
    emit VotingRightsWithdrawn(msg.sender, numTokens);
  }

  function checkStakeBalance() public view returns(uint256 tokens){
    tokens = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
  }
  /**
   * @dev commitVote for poll
   * @param pollID Job Hash
   * @param secretHash Hash of Choice address and salt uint
   */
  function commitVote(uint256 pollID, bytes32 secretHash, uint256 tokens) public 
  {
    uint256 minVotes = bbs.getUint(keccak256('MIN_VOTES'));
    uint256 maxVotes = bbs.getUint(keccak256('MAX_VOTES'));
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    require(pollStatus == 1);
    require(tokens >= minVotes);
    require(tokens <= maxVotes);
    require(bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'))<now);
    require(bbs.getUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'))>now);

    require(secretHash != 0);
    
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    if(voteTokenBalance<tokens){
      requestVotingRights(tokens.sub(voteTokenBalance));
    }
    require(bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE')) >= tokens);
    // add secretHash
    bbs.setBytes(BBLib.toB32(pollID ,'SECRET_HASH',msg.sender), abi.encodePacked(secretHash));
    bbs.setUint(BBLib.toB32(pollID ,'VOTES',msg.sender), tokens);
    emit VoteCommitted(msg.sender, pollID);
  }

  /**
  * @dev check Hash for poll
  * @param pollID Job Hash
  * @param choice address 
  * @param salt salt
  */
  function checkHash(uint256 pollID, address choice, uint salt) public view returns(bool){
    bytes32 choiceHash = BBLib.toB32(choice,salt);
    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(pollID,'SECRET_HASH',msg.sender)));
    return (choiceHash==secretHash);
  }
  /**
  * @dev revealVote for poll
  * @param pollID Job Hash
  * @param choice address 
  * @param salt salt
  */
  function revealVote(uint256 pollID, address choice, uint salt) public 
  {
    require(bbs.getUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'))<now);
    require(bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'))>now);
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    require(pollStatus == 1);
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    uint256 votes = bbs.getUint(BBLib.toB32(pollID,'VOTES',msg.sender));
    // check staked vote
    require(voteTokenBalance>= votes);

    bytes32 choiceHash = BBLib.toB32(choice,salt);
    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(pollID,'SECRET_HASH',msg.sender)));
    require(choiceHash == secretHash);
    uint256 numVote = bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',choice));
    //save result poll
    bbs.setUint(BBLib.toB32(pollID,'VOTE_FOR',choice), numVote.add(votes));
    // save voter choice
    bbs.setAddress(BBLib.toB32(pollID,'CHOICE',msg.sender), choice);
    emit VoteRevealed(msg.sender, pollID, secretHash);
  }
  // /**
  // * @dev claimReward for poll
  // * @param pollID Job Hash
  // *
  // */
  // function claimReward(uint256 pollID) public {
  //   require(bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'))<=now);
  //   require(bbs.getBool(BBLib.toB32(pollID,'REWARD_CLAIMED',msg.sender))!= true);
  //   uint256 numReward = calcReward(pollID);
  //   require (numReward > 0);
  //   // set claimed to true
  //   bbs.setBool(BBLib.toB32(pollID,'REWARD_CLAIMED',msg.sender), true);
  //   require(bbo.transferFrom(bboReward, msg.sender, numReward));
  // }
  // /**
  // * @dev calcReward calculate the reward
  // * @param pollID Job Hash
  // *
  // */
  // //TODO
  // function calcReward(uint256 pollID) constant public returns(uint256 numReward){
  //   (uint256 pollStatus, bytes memory relatedTo,address creator,address relatedAddr) = getPoll(pollID);
  //   address winner = bbs.getAddress(BBLib.toB32(relatedTo, 'DISPUTE_WINNER'));
  //   require(winner!=address(0x0));
  //   address choice = bbs.getAddress(BBLib.toB32(pollID, 'CHOICE',msg.sender));
  //   if(choice == winner){
  //     uint256 votes = bbs.getUint(BBLib.toB32(pollID, 'VOTES',msg.sender));
  //     uint256 totalVotes = bbs.getUint(BBLib.toB32(pollID, 'VOTE_FOR',choice));
  //     uint256 bboStake = bbs.getUint(BBLib.toB32(pollID, 'STAKED_DEPOSIT',choice));
  //     numReward = votes.mul(bboStake).div(totalVotes); // (vote/totalVotes) * staked
  //   }else{
  //     //TODO
  //     numReward = bbs.getUint(keccak256('BBO_REWARDS'));
  //   }
  // }

  function getPollID(uint256 pollType, bytes relatedTo) public view returns(uint256 pollID){
    pollID = bbs.getUint(BBLib.toB32(relatedTo, pollType,'POLL'));
  }
  function hasVoting(uint256 pollType, bytes relatedTo) public view returns(bool r){
    uint256 pollID = getPollID(pollType, relatedTo);
    if(pollID > 0) {
      uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
      r = (pollStatus == 1);
    }
  }
  function startPoll(uint256 pollType, bytes relatedTo, bytes extraData) public {
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    // make sure the voting having the allowVoting method :v 
    require(relatedAddr.delegatecall(bytes4(keccak256("allowVoting(bytes)")),relatedTo));
    require(hasVoting(pollType, relatedTo)!=true);
    //TODO
    return _doStartPoll(pollType, relatedTo, extraData);
  }
  function _doStartPoll(uint256 pollType, bytes relatedTo, bytes extraData) private {
    //TODO
    (uint256 addOptionDuration, uint256 commitDuration,uint256 revealDuration, uint256 bboStake) = getPollParams(pollType);
    // get current ID
    uint256 latestID  = bbs.getUint(BBLib.toB32('POLL_COUNTER'));
    uint256 pollID = latestID + 1;
    bbs.setUint(BBLib.toB32('POLL_COUNTER'), pollID);
    assert(_doStakeToken( pollID, bboStake));
    // save startPoll address
    bbs.setAddress(BBLib.toB32(pollID, 'POLL_STARTED'), msg.sender);
    
    // addPollOptionEndDate
    uint256 addPollOptionEndDate = block.timestamp.add(addOptionDuration);
    // commitEndDate
    uint256 commitEndDate = addPollOptionEndDate.add(commitDuration);
    // revealEndDate
    uint256 revealEndDate = commitEndDate.add(revealDuration);
    // save addPollOption, commit, reveal EndDate
    bbs.setUint(BBLib.toB32(pollID,'STATUS'), 1);
    bbs.setUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'), addPollOptionEndDate);
    bbs.setUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'), commitEndDate);
    bbs.setUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'), revealEndDate);
    // save relatedTo
    bbs.setBytes(BBLib.toB32(pollID,'RELATED_TO'), relatedTo);
    bbs.setUint(BBLib.toB32(pollID,'POLL_TYPE'), pollType);
    // save pollID to relatedTo
    bbs.setUint(BBLib.toB32(relatedTo, pollType,'POLL'), pollID);

    _doAddPollOption( pollID, msg.sender, extraData);

    emit PollStarted(pollID, pollType, msg.sender, relatedTo);

  }
  function getPoll(uint256 pollID) public constant returns(uint256, uint256, bytes, address, address) {
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    uint256 pollType = bbs.getUint(BBLib.toB32(pollID,'POLL_TYPE'));
    bytes memory relatedTo = bbs.getBytes(BBLib.toB32(pollID,'RELATED_TO'));
    address creator = bbs.getAddress(BBLib.toB32(pollID, 'POLL_STARTED'));
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    return (pollStatus, pollType, relatedTo, creator, relatedAddr);
  }
  function addPollOption(uint256 pollID, bytes pollOption) public {
    (uint256 pollStatus, uint256 pollType, bytes memory relatedTo,address creator,address relatedAddr) = getPoll(pollID);
    require(pollStatus == 1);
    require(relatedAddr.delegatecall(bytes4(keccak256("allowVoting(bytes)")),relatedTo));
    require(bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE')) > now);
    return _doAddPollOption(pollID, creator, pollOption);
  }
  function _doStakeToken(uint256 pollID, uint256 bboStake) private returns(bool) {
    uint256 stakedBBO = bbs.getUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',msg.sender));
    if(bboStake.sub(stakedBBO) > 0){
      require(bbo.transferFrom(msg.sender, address(this), bboStake.sub(stakedBBO)));
      bbs.setUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',msg.sender), bboStake);
    }
    return true;
  }
  function _doAddPollOption(uint256 pollID, address creator, bytes pollOption) private {
    //TODO
    uint256 bboStake = bbs.getUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',creator));
    assert(_doStakeToken(pollID, bboStake));
    bbs.setBytes(BBLib.toB32(pollID,'POLL_OPTION', msg.sender), pollOption);
    emit PollOptionAdded(pollID, msg.sender, pollOption);
  }
  function getPollParams(uint256 pollType) public view returns(uint256, uint256, uint256, uint256){
    uint256 addOption = bbs.getUint(BBLib.toB32(pollType, 'ADDOPTION_DURATION'));
    uint256 commit = bbs.getUint(BBLib.toB32(pollType, 'COMMIT_DURATION'));
    uint256 reveal = bbs.getUint(BBLib.toB32(pollType, 'REVEAL_DURATION'));
    uint256 bboStake = bbs.getUint(BBLib.toB32(pollType, 'STAKED_DEPOSIT'));
    return (addOption, commit, reveal, bboStake);
  }
}
