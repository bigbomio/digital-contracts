  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBVotingHelper.sol';
/**
 * @title BBVoting contract 
 */
contract BBVoting is BBStandard{
  BBVotingHelper public helper = BBVotingHelper(0x0);
  function setHelper(address _helper) onlyOwner public {
    helper = BBVotingHelper(_helper);
  }

  event PollStarted(uint256 pollID, uint256 indexed pollType, address indexed creator, uint256 indexed relatedTo);
  event PollUpdated(uint256 indexed pollID,bool indexed whiteFlag);
  event PollOptionAdded(uint256 indexed pollID, uint256 optionID);
  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);

  event VoteCommitted(address indexed voter, uint256 indexed pollID);
  event VoteRevealed(address indexed voter, uint256 indexed pollID);
  
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


  /**
   * @dev commitVote for poll
   * @param pollID Job Hash
   * @param secretHash Hash of Choice address and salt uint
   */
  function commitVote(uint256 pollID, bytes32 secretHash, uint256 tokens) public 
  {
    //uint256 minVotes = bbs.getUint(keccak256('MIN_VOTES'));
    //uint256 maxVotes = bbs.getUint(keccak256('MAX_VOTES'));
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    require(pollStatus == 1);
    //require(tokens >= minVotes);
    //require(tokens <= maxVotes);
    (uint256 addPollOptionEndDate,uint256 commitEndDate, ) = helper.getPollStage(pollID);
    
    require(addPollOptionEndDate<now);
    require(commitEndDate>now);
    require(secretHash != 0);
    
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    if(voteTokenBalance<tokens){
      requestVotingRights(tokens.sub(voteTokenBalance));
    }
    require(bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE')) >= tokens);
    // add secretHash

    bbs.setBytes(BBLib.toB32(pollID ,'SECRET_HASH',msg.sender), abi.encodePacked(secretHash));
    bbs.setUint(BBLib.toB32(pollID ,'VOTES', msg.sender), tokens);
    
    emit VoteCommitted(msg.sender, pollID);
  }


  /**
  * @dev revealVote for poll
  * @param pollID Job Hash
  * @param choice uint 
  * @param salt salt
  */
  function revealVote(uint256 pollID, uint choice, uint salt) public 
  {
    (,uint256 commitEndDate, uint256 revealEndDate) = helper.getPollStage(pollID);
    require(commitEndDate<now);
    require(revealEndDate>now);
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    require(pollStatus >= 1);
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    uint256 votes = bbs.getUint(BBLib.toB32(pollID,'VOTES',msg.sender));
    // check staked vote
    require(voteTokenBalance>= votes);

    bytes32 choiceHash = BBLib.toB32(choice,salt);

    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(pollID,'SECRET_HASH',msg.sender)));
    require(choiceHash == secretHash);
    // make sure not reveal yet
    require(bbs.getUint(BBLib.toB32(pollID,'CHOICE',msg.sender)) == 0x0);
    uint256 numVote = bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',choice));
    //save result poll
    bbs.setUint(BBLib.toB32(pollID,'VOTE_FOR',choice), numVote.add(votes));
    // save voter choice
    bbs.setUint(BBLib.toB32(pollID,'CHOICE',msg.sender), choice);
    // set has vote flag 
    if(pollStatus == 1)
      bbs.setUint(BBLib.toB32(pollID,'STATUS'), 2);
    emit VoteRevealed(msg.sender, pollID);
  }


  function updatePoll(uint256 pollID, bool whiteFlag, uint256 commitDuration,uint256 revealDuration) public {
    (uint256 pollStatus,,,,) = helper.getPollDetail(pollID);
    (,,uint256 revealEndDate) = helper.getPollStage(pollID);
    require(pollStatus == 1);
    require(revealEndDate < now);
    require(bbs.getAddress(BBLib.toB32(pollID, 'OWNER')) == msg.sender);
    if(whiteFlag){
      return _doWhiteFlag(pollID);
    }else{
      return _doExtendPoll(pollID, commitDuration, revealDuration);
    }
  }

  function _doWhiteFlag(uint256 pollID) private {
    // TODO here
    // set status to 0
    bbs.setUint(BBLib.toB32(pollID,'STATUS'), 0);
    emit PollUpdated(pollID, true );
  }
  function _doExtendPoll(uint256 pollID, uint256 commitDuration,uint256 revealDuration) private {
    bbs.setUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'), block.timestamp.add(commitDuration));
    bbs.setUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'), block.timestamp.add(commitDuration).add(revealDuration));
    emit PollUpdated(pollID, false);
  }

  function startPoll(uint256 pollType, uint256 relatedTo, bytes extraData, uint256 addOptionDuration, uint256 commitDuration,uint256 revealDuration) public returns(uint256 pollID) {
    require(helper.hasVoting(pollType, relatedTo)!=true);
    
    uint256 latestID  = bbs.getUint(BBLib.toB32('POLL_COUNTER'));
    pollID = latestID.add(1);
    bbs.setUint(BBLib.toB32('POLL_COUNTER'), pollID);
    // save startPoll address
    bbs.setAddress(BBLib.toB32(pollID, 'POLL_STARTED'), msg.sender);
    bbs.setAddress(BBLib.toB32(pollID, 'OWNER'), msg.sender);
    
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
    bbs.setUint(BBLib.toB32(pollID,'RELATED_TO'), relatedTo);
    bbs.setUint(BBLib.toB32(pollID,'POLL_TYPE'), pollType);
    // save pollID to relatedTo
    bbs.setUint(BBLib.toB32(relatedTo, pollType,'POLL'), pollID);

    _doAddPollOption(pollID, extraData);

    emit PollStarted(pollID, pollType, msg.sender, relatedTo);
    return pollID;
  }
  
  function addPollOption(uint256 pollID, bytes pollOption) public {
    (uint256 pollStatus,,,,) = helper.getPollDetail(pollID);
    require(pollStatus == 1);
    require(bbs.getAddress(BBLib.toB32(pollID, 'OWNER')) == msg.sender);
    //todo check msg.sender
    require(bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE')) > now);
    _doAddPollOption(pollID, pollOption);
  }
  
  function _doAddPollOption(uint256 pollID, bytes optionHashIPFS) private {
    // check optionID make sure this hash not saved yet
    require(bbs.getUint(BBLib.toB32(pollID, 'OPTION', optionHashIPFS))== 0x0);
    // get latestID + 1 for new ID
    uint256 optionID = bbs.getUint(BBLib.toB32(pollID, 'OPTION_COUNTER')).add(1);
    // save latestID
    bbs.setUint(BBLib.toB32(pollID, 'OPTION_COUNTER'), optionID);
    // save option
    bbs.setBytes(BBLib.toB32(pollID, 'IPFS_HASH', optionID), optionHashIPFS);
    bbs.setAddress(BBLib.toB32(pollID, 'CREATOR', optionID), msg.sender);
    emit PollOptionAdded(pollID, optionID);
  }
  
}
