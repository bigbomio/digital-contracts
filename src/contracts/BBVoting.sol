  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBDispute.sol';

/**
 * @title BBVoting contract 
 */
contract BBVoting is BBDispute{
  
  event VotingRightsGranted(address indexed voter, uint256 numTokens);
  event VotingRightsWithdrawn(address indexed voter, uint256 numTokens);
  event VoteCommitted(address indexed voter, bytes jobHash);
  event VoteRevealed(address indexed voter, bytes jobHash, bytes32 secretHash, bytes32 cHash);
  
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
  function bytesToBytes32(bytes b) internal pure returns (bytes32) {
    bytes32 out;

    for (uint i = 0; i < 32; i++) {
      out |= bytes32(b[i] & 0xFF) >> (i * 8);
    }
    return out;
  }
  
}