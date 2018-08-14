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
  event PollStarted(bytes jobHash, address creator);


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
  {
    require(secretHash != 0);
    //TODO
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
  {
    //TODO
    emit VoteRevealed(msg.sender, jobHash);
  }
  /**
  * @dev startPoll
  * @param jobHash Job Hash
  * @param proofHash Hash of Proof 
  * 
  */
  function startPoll(bytes jobHash, bytes proofHash) public {
    //TODO
  } 
  /**
  * @dev againstPoll
  * @param jobHash Job Hash
  * @param againstProofHash Hash of Against Proof 
  * 
  */
  function againstPoll(bytes jobHash, bytes againstProofHash) public {
    //TODO
  }
}