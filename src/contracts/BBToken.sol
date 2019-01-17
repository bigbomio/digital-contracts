pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';

contract BBToken is ERC20Mintable {
	string public name = 'Bigbom';
    string public symbol = 'BBO';
    uint8 public decimals = 18;
  	constructor (string _name, string _symbol, uint8 _decimals) {
         name = _name;
         symbol =  _symbol;
         decimals = _decimals;  
    }
}