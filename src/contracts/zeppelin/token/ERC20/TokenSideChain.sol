pragma solidity ^0.4.24;

import "./MintableToken.sol";


contract TokenSideChain is MintableToken {

   string public name = '';
   string public symbol = '';
   uint8  public decimals = 18;

   constructor (string _name, string _symbol, uint8 _decimals) {
         name = _name;
         symbol =  _symbol;
         decimals = _decimals;  
    }
}
