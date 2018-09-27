pragma solidity ^0.4.24;

import './BBStorage.sol';
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/token/ERC20/ERC20.sol';

contract BBStandard is Ownable {
  using SafeMath for uint256;
  BBStorage public bbs = BBStorage(0x0);
  ERC20 public bbo = ERC20(0x0);

  /**
   * @dev set storage contract address
   * @param storageAddress Address of the Storage Contract
   */
  function setStorage(address storageAddress) onlyOwner public {
    bbs = BBStorage(storageAddress);
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
  function emergencyERC20Drain(ERC20 anyToken) public onlyOwner{
      if(address(this).balance > 0 ) {
        owner.transfer( address(this).balance );
      }
      if( anyToken != address(0x0) ) {
          require( anyToken.transfer(owner, anyToken.balanceOf(this)) );
      }
  }

  function checkOwnerOfJob(address sender, bytes jobHash) public returns (bool) {
      return (bbs.getAddress(keccak256(jobHash)) == sender);
  }

  function checkJobStart(bytes jobHash) public returns (bool) {
      return (bbs.getUint(keccak256(abi.encodePacked(jobHash, 'STATUS'))) != 0x0);
  }

  function checkJobCancel(address sender ,bytes jobHash) public returns (bool) {
      return bbs.getBool(keccak256(abi.encodePacked(jobHash, sender, 'CANCEL')));
  }

  function checkJobExpired(bytes jobHash) public returns (bool) {
      return (now > bbs.getUint(keccak256(abi.encodePacked(jobHash, 'EXPIRED'))));
  }

   function checkJobHasFreelancer(bytes jobHash) public returns (bool) {
      return (bbs.getAddress(keccak256(abi.encodePacked(jobHash,'FREELANCER'))) != 0x0);
  }

}