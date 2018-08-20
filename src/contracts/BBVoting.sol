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
contract BBVoting is Ownable{
  using SafeMath for uint256;
  BBStorage bbs = BBStorage(0x0);
  ERC20 public bbo = ERC20(0x0);


  event VotingRightsGranted(address indexed voter);
  event VotingRightsWithdrawn(address indexed voter);
  event VoteCommitted(address indexed voter, bytes jobHash);
  event VoteRevealed(address indexed voter, bytes jobHash);
  event PollStarted(bytes jobHash, address indexed creator, uint commitEndDate, uint revealEndDate, uint voteQuorum);

  modifier canCreatePoll(bytes jobHash){
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer')));
    require (msg.sender==jobOwner || msg.sender==freelancer);
    _;
  }

  modifier isDisputeJob(bytes jobHash){
    uint256 jobStatus = bbs.getUint(keccak256(abi.encodePacked(jobHash,'status')));
    require(jobStatus == 4);
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash, 'disputedWinner')))==address(0x0));
    _;
  }
  modifier hasVotingRights(){
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    uint256 amountHolder = bbs.getUint(keccak256('freelancerVotingHolderTokens'));
    require(lockedTokens>0);
    require(lockedTokens>amountHolder);
    _;
  }
  /**
   * @dev set storage contract address
   * @param storageAddress Address of the Storage Contract
   */
  function setStorage(address storageAddress) onlyOwner public {
    bbs = BBStorage(storageAddress);
  }
  /**
   * @dev get storage contract address
   */
  function getStorage() onlyOwner public returns(address){
    return bbs;
  }

  /**
   * @dev set BBO contract address
   * @param BBOAddress Address of the BBO token
   */
  function setBBO(address BBOAddress) onlyOwner public {
    bbo = ERC20(BBOAddress);
  }
  /**
   * @dev request voting rights
   * 
   */
  function requestVotingRights() public {
    uint256 lockedTokens = bbs.getUint(keccak256(abi.encodePacked(msg.sender,'freelancerVotingLockedTokens')));
    uint256 amountHolder = bbs.getUint(keccak256('freelancerVotingHolderTokens'));
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
  function withdrawVotingRights() public
  hasVotingRights 
  {
    //TODO
    emit VotingRightsWithdrawn(msg.sender);
  }
  /**
   * @dev commitVote for poll
   * @param jobHash Job Hash
   * @param secretHash Hash of Choice and salt
   */
  function commitVote(bytes jobHash, bytes32 secretHash) public 
  hasVotingRights
  isDisputeJob(jobHash)
  {
    require(secretHash != 0);
    // add secretHash
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'vote',msg.sender)), secretHash);

    emit VoteCommitted(msg.sender, jobHash);
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
    bytes32 secretHash = bytes32(bbs.getBytes(keccak256(abi.encodePacked(jobHash,'vote',msg.sender))));
    require(choiceHash == secretHash);
    uint256 numVote = bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',choice)));
    bbs.setUint(keccak256(abi.encodePacked(jobHash,'voteFor',choice)), numVote+1);
    emit VoteRevealed(msg.sender, jobHash);
  }
  /**
  * @dev startPoll
  * @param jobHash Job Hash
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(bytes jobHash, bytes proofHash, uint commitDuration, uint revealDuration, uint voteQuorum) public 
  isDisputeJob(jobHash)
  canCreatePoll(jobHash)
  {
    require(keccak256(abi.encodePacked(jobHash,'startPoll'))==0x0);
    // commitEndDate
    uint commitEndDate = block.timestamp.add(commitDuration);
    // revealEndDate
    uint revealEndDate = commitEndDate.add(revealDuration);
    bbs.setAddress(keccak256(abi.encodePacked(jobHash,'startPoll')), msg.sender);
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
    require(keccak256(abi.encodePacked(jobHash,'startPoll'))!=0x0);
    require(keccak256(abi.encodePacked(jobHash,'startPoll'))!=msg.sender);
    bbs.setBytes(keccak256(abi.encodePacked(jobHash,'againstProofHash')), againstProofHash);

  }
  function getPoll(bytes jobHash) public view returns (uint256, uint256) {
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    address freelancer = bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer')));
    return (bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',jobOwner))), bbs.getUint(keccak256(abi.encodePacked(jobHash,'voteFor',freelancer))));
  }
}