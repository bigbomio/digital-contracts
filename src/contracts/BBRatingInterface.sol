pragma solidity ^0.4.24;


contract BBRatingInterface {
  function allowRating(address owner, address  rateTo, uint256 jobID)  public view returns (bool);

}