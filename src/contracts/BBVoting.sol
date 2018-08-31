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

  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);
  event VoteCommitted(address indexed voter, bytes jobHash);
  event VoteRevealed(address indexed voter, bytes jobHash, bytes32 secretHash, bytes32 cHash);
  function getPollID(bytes jobHash) private constant returns(uint256 r){
    r = bbs.getUint(BBLib.toB32(jobHash,'POLL_COUNTER'));
  }
  modifier isDisputeJob(bytes jobHash){
    uint256 jobStatus = bbs.getUint(BBLib.toB32(jobHash,'STATUS'));
    require(jobStatus == 4);
    require(bbs.getAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'))==address(0x0));
    _;
  }
  function isAgaintsPoll(bytes jobHash) public constant returns(bool){
    return keccak256(bbs.getBytes(BBLib.toB32(jobHash, getPollID(jobHash),'AGAINST_PROOF')))!=keccak256("");
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

  function checkBalance() public view returns(uint256 tokens){
    tokens = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
  }
  /**
   * @dev commitVote for poll
   * @param jobHash Job Hash
   * @param secretHash Hash of Choice address and salt uint
   */
  function commitVote(bytes jobHash, bytes32 secretHash, uint256 tokens) public 
  isDisputeJob(jobHash)
  {
    uint256 pollId = getPollID(jobHash);
    uint256 minVotes = bbs.getUint(keccak256('MIN_VOTES'));
    uint256 maxVotes = bbs.getUint(keccak256('MAX_VOTES'));
    require(tokens >= minVotes);
    require(tokens <= maxVotes);
    require(isAgaintsPoll(jobHash)==true);
    require(bbs.getUint(BBLib.toB32(jobHash, pollId,'EVEIDENCE_ENDDATE'))<now);
    require(bbs.getUint(BBLib.toB32(jobHash, pollId,'COMMIT_ENDDATE'))>now);

    require(secretHash != 0);
    
    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    if(voteTokenBalance<tokens){
      requestVotingRights(tokens.sub(voteTokenBalance));
    }
    require(bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE')) >= tokens);
    // add secretHash
    bbs.setBytes(BBLib.toB32(jobHash,pollId,'SECRET_HASH',msg.sender), abi.encodePacked(secretHash));
    bbs.setUint(BBLib.toB32(jobHash,pollId,'VOTES',msg.sender), tokens);
    emit VoteCommitted(msg.sender, jobHash);
  }

  /**
  * @dev check Hash for poll
  * @param jobHash Job Hash
  * @param choice address 
  * @param salt salt
  */
  function checkHash(bytes jobHash, address choice, uint salt) public view returns(bool){
    uint256 pollId = getPollID(jobHash);
    bytes32 choiceHash = BBLib.toB32(choice,salt);
    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(jobHash,pollId,'SECRET_HASH',msg.sender)));
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
    uint256 pollId = getPollID(jobHash);
    require(isAgaintsPoll(jobHash)==true);
    require(bbs.getUint(BBLib.toB32(jobHash, pollId,'COMMIT_ENDDATE'))<now);
    require(bbs.getUint(BBLib.toB32(jobHash, pollId,'REVEAL_ENDDATE'))>now);

    uint256 voteTokenBalance = bbs.getUint(BBLib.toB32(msg.sender,'STAKED_VOTE'));
    uint256 votes = bbs.getUint(BBLib.toB32(jobHash, pollId,'VOTES',msg.sender));
    // check staked vote
    require(voteTokenBalance>= votes);

    bytes32 choiceHash = BBLib.toB32(choice,salt);
    bytes32 secretHash = BBLib.bytesToBytes32(bbs.getBytes(BBLib.toB32(jobHash, pollId,'SECRET_HASH',msg.sender)));
    require(choiceHash == secretHash);
    uint256 numVote = bbs.getUint(BBLib.toB32(jobHash, pollId,'VOTE_FOR',choice));
    //save result poll
    bbs.setUint(BBLib.toB32(jobHash, pollId,'VOTE_FOR',choice), numVote.add(votes));
    // save voter choice
    bbs.setAddress(BBLib.toB32(jobHash, pollId,'CHOICE',msg.sender), choice);
    emit VoteRevealed(msg.sender, jobHash, secretHash,choiceHash);
  }
  /**
  * @dev claimReward for poll
  * @param jobHash Job Hash
  *
  */
  function claimReward(bytes jobHash) public {
    uint256 pollId = getPollID(jobHash);
    require(bbs.getUint(BBLib.toB32(jobHash,pollId,'REVEAL_ENDDATE'))<=now);
    require(bbs.getBool(BBLib.toB32(jobHash,pollId,'REWARD_CLAIMED',msg.sender))!= true);
    uint256 numReward = calcReward(jobHash);
    require (numReward > 0);
    // set claimed to true
    bbs.setBool(BBLib.toB32(jobHash,pollId,'REWARD_CLAIMED',msg.sender), true);
    require(bbo.transferFrom(bboReward, msg.sender, numReward));
  }
  /**
  * @dev calcReward calculate the reward
  * @param jobHash Job Hash
  *
  */
  function calcReward(bytes jobHash) constant public returns(uint256 numReward){
    uint256 pollId = getPollID(jobHash);
    address winner = bbs.getAddress(BBLib.toB32(jobHash, 'DISPUTE_WINNER'));
    require(winner!=address(0x0));
    address choice = bbs.getAddress(BBLib.toB32(jobHash, pollId, 'CHOICE',msg.sender));
    if(choice == winner){
      uint256 votes = bbs.getUint(BBLib.toB32(jobHash, pollId, 'VOTES',msg.sender));
      uint256 totalVotes = bbs.getUint(BBLib.toB32(jobHash, pollId, 'VOTE_FOR',choice));
      uint256 bboStake = bbs.getUint(BBLib.toB32(jobHash, pollId, 'STAKED_DEPOSIT',choice));

      numReward = votes.mul(bboStake).div(totalVotes); // (vote/totalVotes) * staked

    }else{
      numReward = bbs.getUint(keccak256('BBO_REWARDS'));
    }
  }
  
  
}