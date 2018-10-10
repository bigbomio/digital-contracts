pragma solidity ^0.4.24;


contract BBRatingInterface {
  function allowRating(address owner, uint256 jobID)  public view returns (bool);

  function getRating(bytes relatedTo) public view returns (bytes); 
}