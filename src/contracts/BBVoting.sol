  /**
 * Created on 2018-08-13 10:20
 * @summary: 
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/token/ERC20/ERC20.sol';

/**
 * @title BBVoting contract 
 */
contract BBVoting is BBFreelancer{

  event VotingRightsGranted(address indexed voter);
  event VotingRightsWithdrawn(address indexed voter);
  event VoteCommitted(address indexed voter, bytes jobHash);
  event VoteRevealed(address indexed voter, bytes jobHash, bytes32 secretHash, bytes32 cHash);
  event PollStarted(bytes jobHash, address indexed creator, uint commitEndDate, uint revealEndDate, uint voteQuorum);
  event PollAgainsted(bytes jobHash, address indexed creator);
  modifier pollNotStarted(bytes jobHash){
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'startPoll')))==0x0);
    _;
  }
  modifier canCreatePoll(bytes jobHash){
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER)));
    require (msg.sender==jobOwner || msg.sender==freelancer);
    _;
  }

  modifier isDisputeJob(bytes jobHash){
    uint256 jobStatus = bbs.getUint(keccak256(abi.encodePacked(jobHash,STATUS)));
    require(jobStatus == 4);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash, DISPUTE_WINNER)))==address(0x0));
    _;
  }
  modifier hasVotingRights(){
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    uint256 amountHolder = bbs.getUint(keccak256(FREELANCER_VOTING_STACK_TOKENS));
    require(lockedTokens>0);
    require(lockedTokens>=amountHolder);
    _;
  }

  function bytesToBytes32(bytes b) private pure returns (bytes32) {
    bytes32 out;

    for (uint i = 0; i < 32; i++) {
      out |= bytes32(b[i] & 0xFF) >> (i * 8);
    }
    return out;
  }

  /**
   * @dev request voting rights
   * 
   */
  function requestVotingRights() public {
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    uint256 amountHolder = bbs.getUint(keccak256(FREELANCER_VOTING_STACK_TOKENS));
    require(amountHolder!=0);
    require(lockedTokens<amountHolder);
    require(bbo.transferFrom(msg.sender,address(this), amountHolder.sub(lockedTokens)));
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')), amountHolder);
    emit VotingRightsGranted(msg.sender);
  }
  /**
   * @dev withdraw voting rights
   * 
   */
  function cancelVotingRights() public 
  {
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    require (lockedTokens > 0);
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'cancelVotingRights')), block.timestamp.add(24*60*60));
    emit VotingRightsWithdrawn(msg.sender);
  }
  /**
   * @dev withdraw voting rights
   * 
   */
  function withdrawVotingRights() public 
  {
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    require (lockedTokens > 0);
    // allow withdraw after 24h cancel voting rights
    uint cancelVotingRightsDate = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'cancelVotingRights')));
    require(cancelVotingRightsDate<=now);
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')), 0);
    require(bbo.transfer(msg.sender, lockedTokens));
    emit VotingRightsWithdrawn(msg.sender);
  }
  /**
   * @dev commitVote for poll
   * @param jobHash Job Hash
   * @param secretHash Hash of Choice address and salt uint
   */
  function commitVote(bytes jobHash, bytes32 secretHash) public 
  hasVotingRights
  isDisputeJob(jobHash)
  {
    require(secretHash != 0);
    // add secretHash
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'vote',msg.sender)), abi.encodePacked(secretHash));

    emit VoteCommitted(msg.sender, jobHash);
  }


  function checkHash(bytes jobHash, address choice, uint salt) public view returns(bool){
    bytes32 choiceHash = keccak256(abi.encodePacked(choice,salt));
    bytes32 secretHash = bytesToBytes32(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'vote',msg.sender))));
    return (choiceHash==secretHash);
  }
  /**
  * @dev revealVote for poll
  * @param jobHash Job Hash
  * @param choice address 
  * @param salt salt
  */
  function revealVote(bytes jobHash, address choice, uint salt) public 
  hasVotingRights
  isDisputeJob(jobHash)
  {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'commitEndDate')))<now);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'revealEndDate')))>now);

    bytes32 choiceHash = keccak256(abi.encodePacked(choice,salt));
    bytes32 secretHash = bytesToBytes32(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'vote',msg.sender))));
    require(choiceHash == secretHash);
    uint256 numVote = bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',choice)));
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'voteFor',choice)), numVote+1);
   
    uint256 rewardedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingRewards')));
    // rewards 100 BBO
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingRewards')), rewardedTokens.add(100e18));
    emit VoteRevealed(msg.sender, jobHash, secretHash,choiceHash);
  }
  /**
  * @dev revealVote for poll
  * @param jobHash Job Hash
  * 
  */
  function finalizePoll(bytes jobHash) public
  isDisputeJob(jobHash)
  canCreatePoll(jobHash)
  {
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'revealEndDate')))<=now);
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER)));
    uint jobOwnerVotes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',jobOwner)));
    uint freelancerVotes = bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',freelancer)));
    uint voteQuorum = bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteQuorum')));

    if(jobOwnerVotes == freelancerVotes || voteQuorum<(jobOwnerVotes+freelancerVotes)){
      // cancel poll
      bbs.setAddress(keccak256(abi.encodePacked(jobHash,'startPoll')), address(0x0));
    }else{
      bbs.setAddress(keccak256(abi.encodePacked(jobHash, DISPUTE_WINNER)), (jobOwnerVotes>freelancerVotes)?jobOwner:freelancer);
    }
  }
  /**
  * @dev startPoll
  * @param jobHash Job Hash
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(bytes jobHash, bytes proofHash, uint evidenceDuration, uint commitDuration, uint revealDuration, uint voteQuorum) public 
  isDisputeJob(jobHash)
  canCreatePoll(jobHash)
  {

    // evidenceEndDate
    uint evidenceEndDate = block.timestamp.add(evidenceDuration);
    // commitEndDate
    uint commitEndDate = evidenceEndDate.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'startPoll')), msg.sender);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'evidenceEndDate')), evidenceEndDate);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'commitEndDate')), commitEndDate);
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'revealEndDate')), revealEndDate);
    // voteQuorum
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'voteQuorum')), voteQuorum);
    // add creator proofHash
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'creatorProofHash')), proofHash);
    emit PollStarted(jobHash, msg.sender, commitEndDate, revealEndDate, voteQuorum);
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
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'startPoll')))!=0x0);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'startPoll')))!=msg.sender);
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'evidenceEndDate'))) > now);
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'againstProofHash')), againstProofHash);
    emit PollAgainsted(jobHash, msg.sender);
  }
  /**
  * @dev getPoll:
  * @param jobHash Job Hash
  * returns uint ownerVotes, uint freelancerVotes
  * 
  */
  function getPoll(bytes jobHash) public view returns (uint256, uint256, uint256) {
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,FREELANCER)));
    return (bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',jobOwner))), bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',freelancer))),  bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteQuorum'))));
  }
  /**
  * @dev withdrawTokens:
  * @param anyToken token address
  * 
  */
  function withdrawTokens(ERC20 anyToken) public onlyOwner{
      if(address(this).balance > 0 ) {
        owner.transfer( address(this).balance );
      }
      if( anyToken != address(0x0) ) {
          require( anyToken.transfer(owner, anyToken.balanceOf(this)) );
      }
  }
  function withdrawRewards() public {
    uint256 amount = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingRewards')));
    require(amount > 0);
    bbs.setUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingRewards')), 0);
    require(bbo.transfer(msg.sender, amount));
  }
}