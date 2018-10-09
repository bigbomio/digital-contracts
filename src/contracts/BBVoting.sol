  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStandard.sol';
import './BBLib.sol';
import './BBVotingInterface.sol';
/**
 * @title BBVoting contract 
 */
contract BBVoting is BBStandard{

  event PollStarted(uint256 indexed pollID, uint256 indexed pollType, address indexed creator, bytes relatedTo);
  event PollOptionAdded(uint256 indexed pollID, address indexed creator, bytes pollOption);
  event PollUpdated(uint256 indexed pollID,bool indexed whiteFlag);

  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);
  event VoteCommitted(address indexed voter, uint256 indexed pollID);
  event VoteRevealed(address indexed voter, uint256 indexed pollID, bytes32 secretHash);
  
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
    (uint256 addPollOptionEndDate,uint256 commitEndDate, ) = getPollStage(pollID);
    
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
    bbs.setUint(BBLib.toB32(pollID ,'VOTES',msg.sender), tokens);
    if(bbs.getBool(BBLib.toB32(pollID, 'HAS_VOTE')) == false){
      bbs.setBool(BBLib.toB32(pollID, 'HAS_VOTE'), true); 
    }
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
    (,uint256 commitEndDate, uint256 revealEndDate) = getPollStage(pollID);
    require(commitEndDate<now);
    require(revealEndDate>now);
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

  function getPollStage(uint256 pollID) public view returns(uint256, uint256, uint256){
    uint256 addPollOptionEndDate = bbs.getUint(BBLib.toB32(pollID,'ADDOPTION_ENDDATE'));
    uint256 commitEndDate = bbs.getUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'));
    uint256 revealEndDate = bbs.getUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'));
    return (addPollOptionEndDate, commitEndDate, revealEndDate); 
  }

  function updatePoll(uint256 pollID, bool whiteFlag) public {
    (uint256 pollStatus, uint256 pollType, bytes memory relatedTo,,address relatedAddr, bool hasVote) = getPollDetail(pollID);
    (,uint256 commitEndDate,uint256 revealEndDate) = getPollStage(pollID);
    (, uint256 commitDuration,uint256 revealDuration,) = getPollParams(pollType);
    require(pollStatus == 1);
    require(allowVoting( relatedAddr,  relatedTo));
    require(commitEndDate < now);
    require(revealEndDate > now);
    require(hasVote== false);
    if(whiteFlag){
      return _doWhiteFlag(pollID);
    }else{
      return _doExtendPoll(pollID, commitDuration, revealDuration);
    }
  }
  function _doWhiteFlag(uint256 pollID) private {
    assert(_doWithdrawStakeToken(pollID));
    bbs.deleteUint(BBLib.toB32(pollID, 'POLL_OPTION_NUM', msg.sender));
    //
    uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'NUM_OPTION'));
    bbs.setUint(BBLib.toB32(pollID, 'NUM_OPTION'), numOption.sub(1));
    emit PollUpdated(pollID, true );
  }
  function _doExtendPoll(uint256 pollID, uint256 commitDuration,uint256 revealDuration) private {
    bbs.setUint(BBLib.toB32(pollID,'COMMIT_ENDDATE'), block.timestamp.add(commitDuration));
    bbs.setUint(BBLib.toB32(pollID,'REVEAL_ENDDATE'), block.timestamp.add(commitDuration).add(revealDuration));
    emit PollUpdated(pollID, false);
  }
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
  function allowVoting(address relatedAddr, bytes relatedTo) private returns(bool c){
     return BBVotingInterface(relatedAddr).allowVoting(msg.sender, relatedTo);
  }
  function startPoll(uint256 pollType, bytes relatedTo, bytes extraData) public {
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    // make sure the voting having the allowVoting method :v 
    require(allowVoting(relatedAddr,relatedTo));
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
  function getPollDetail(uint256 pollID) public constant returns(uint256, uint256, bytes, address, address, bool) {
    uint256 pollStatus = bbs.getUint(BBLib.toB32(pollID,'STATUS'));
    uint256 pollType = bbs.getUint(BBLib.toB32(pollID,'POLL_TYPE'));
    bytes memory relatedTo = bbs.getBytes(BBLib.toB32(pollID,'RELATED_TO'));
    address creator = bbs.getAddress(BBLib.toB32(pollID, 'POLL_STARTED'));
    address relatedAddr = bbs.getAddress(BBLib.toB32('POLL_RELATED', pollType));
    bool hasVote = bbs.getBool(BBLib.toB32(pollID, 'HAS_VOTE'));
    return (pollStatus, pollType, relatedTo, creator, relatedAddr, hasVote);
  }
  function getPollResult(uint256 pollID) public view returns(address[], uint256[]){
    uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'NUM_OPTION'));
    address[] memory addrs = new address[](numOption);
    uint256[] memory votes = new uint256[](numOption);
    for(uint i = 0; i < numOption ; i++){
      addrs[i] = bbs.getAddress(BBLib.toB32(pollID, 'OPTION_CREATOR', i+1));
      votes[i] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR',addrs[i])));
    }
    addrs[numOption+1] = address(0x0);
    votes[numOption+1] = (bbs.getUint(BBLib.toB32(pollID,'VOTE_FOR', address(0x0))));
    return (addrs, votes);
  }
  function addPollOption(uint256 pollID, bytes pollOption) public {
    (uint256 pollStatus,, bytes memory relatedTo,address creator,address relatedAddr,) = getPollDetail(pollID);
    require(pollStatus == 1);
    require(allowVoting(relatedAddr, relatedTo));
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
  function _doWithdrawStakeToken(uint256 pollID) private returns(bool){
    uint256 stakedBBO = bbs.getUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',msg.sender));
    if(stakedBBO > 0){
      bbs.setUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',msg.sender), 0);
      require(bbo.transfer(msg.sender, stakedBBO));
    }
    return true;
  }
  function _doAddPollOption(uint256 pollID, address creator, bytes pollOption) private {
    uint256 bboStake = bbs.getUint(BBLib.toB32(pollID,'STAKED_DEPOSIT',creator));
    assert(_doStakeToken(pollID, bboStake));
    // get the current number of Poll Option 
    if(BBLib.toB32(bbs.getBytes(BBLib.toB32(pollID, 'OPTION', msg.sender)))!=BBLib.toB32(''))
    {
      //update pollOption
      bbs.setBytes(BBLib.toB32(pollID, 'POLL_OPTION', msg.sender), pollOption);
    }else{
      //add address sender
      uint256 numOption = bbs.getUint(BBLib.toB32(pollID, 'NUM_OPTION'));
      require(numOption < 10);
      bbs.setUint(BBLib.toB32(pollID, 'NUM_OPTION'), numOption.add(1));
      bbs.setAddress(BBLib.toB32(pollID, 'OPTION_CREATOR', numOption.add(1)), msg.sender);
      bbs.setBytes(BBLib.toB32(pollID, 'POLL_OPTION', msg.sender), pollOption);
    } 
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
