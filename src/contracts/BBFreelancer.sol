/**
 * Created on 2018-08-10 14:52
 * @summary: Storage Contract for Freelancer DApp
 * @author: Chris Nguyen
 */
pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/token/ERC20/ERC20.sol';


/**
 * @title: A Key-Value storage contract
 */
contract BBFreelancer is Ownable{
  using SafeMath for uint256;
  BBStorage bbs = BBStorage(0x0);
  ERC20 public bbo = ERC20(0x0);

  /**
   * @dev: 
   * @param storageAddress
   */
  function setStorage(address storageAddress) onlyOwner public {
    bbs = BBStorage(storageAddress);
  }
  /**
   * @dev: 
   */
  function getStorage() onlyOwner public returns(address){
    return bbs;
  }

  /**
   * @dev: 
   * @param BBOAddress
   */
  function setBBO(address BBOAddress) onlyOwner public {
    bbo = ERC20(BBOAddress);
  }

  modifier jobNotExist(bytes jobHash){
    require(bbs.getAddress(keccak256(jobHash)) == 0x0);
    _;
  }
  modifier isFreelancerOfJob(bytes jobHash){
    require(bbs.getAddress(keccak256(abi.encodePacked(jobHash,'freelancer'))) == msg.sender);
    _;
  }
  modifier isNotOwnerJob(bytes jobHash){
    address jobOwner = bbs.getAddress(keccak256(jobHash));
    // not owner
    require(jobOwner!=0x0);
    // not owner
    require(msg.sender != jobOwner);
    _;
  }
  modifier isOwnerJob(bytes jobHash){
    require(bbs.getAddress(keccak256(jobHash))==msg.sender);
    _;
  }

  modifier jobNotStarted(bytes jobHash){
    require(bbs.getUint(keccak256(abi.encodePacked(jobHash,'status'))) == 0x0);
    _;
  }
  modifier isNotCanceled(bytes jobHash){
    require(bbs.getBool(keccak256(abi.encodePacked(jobHash,'cancel'))) !=true);
    _;
  }
}