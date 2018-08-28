pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/token/ERC20/ERC20.sol';

contract BBDispute is Ownable {
  address public bboReward = address(0x0);
  using SafeMath for uint256;
  BBStorage bbs = BBStorage(0x0);
  ERC20 public bbo = ERC20(0x0);

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
  * @dev withdrawTokens: call by admin to withdraw any token
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
  
  function setBBOReward(address rewardAddress) onlyOwner public{
    bboReward = rewardAddress;
  }
}