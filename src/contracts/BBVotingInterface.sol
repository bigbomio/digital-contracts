pragma solidity ^0.4.24;


contract BBVotingInterface {
  function allowVoting(address owner, bytes relatedTo)
    public view returns (bool);

}
