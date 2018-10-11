pragma solidity ^0.4.24;


contract BBRatingInterface {
  function allowRating(address owner, uint256 jobID)  public view returns (bool);

  function getRelatedTo(address sender, uint256 jobID) public view returns (bytes32);

  function getRating(address relatedAddress, uint256 jobID) public view returns (uint256, uint256, uint256, uint256);
}