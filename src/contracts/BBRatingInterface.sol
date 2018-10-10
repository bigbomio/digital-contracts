pragma solidity ^0.4.24;


contract BBRatingInterface {
  function allowRating(address owner, uint256 jobID)  public view returns (bool);

  function doRating(address owner, uint256 jobID, uint256 value) public view;

  function getRating(address related) public view returns (uint256, uint256); 
}