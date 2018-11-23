pragma solidity ^0.4.24;

import "./StandardToken.sol";


/**
 * @title DetailedERC20 token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
contract BBOToken is StandardToken {
  string public name = 'BBOToken';
  string public symbol = 'BOT';
  uint8 public decimals = 18;
  uint    public   totalSupply = 2000000000 * 1e18; //2,000,000,000
  constructor (){
  	balances[msg.sender] = totalSupply;
  }
}
