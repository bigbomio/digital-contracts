pragma solidity ^0.4.24;


contract BBVotingInterface {
  function allowVoting(address owner, uint256 relatedTo)
    public view returns (bool);

}
