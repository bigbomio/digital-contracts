pragma solidity ^0.4.4;

import './zeppelin/ownership/Ownable.sol';
import './zeppelin/ECRecovery.sol';

contract BigbomDigitalContract is Ownable {
  using ECRecovery for bytes32;
  // BBODocument Struct
  struct BBODocument{
  	bytes32 docHash; //document Hash 
  	address[] addresses;
  	mapping(address => bytes) signedAddresses; // mapping address, userSign
  }

  // mapping document Id, BBODocument
  mapping(bytes32 => BBODocument) private bboDocuments;

  // mapping address, list of document Id
  mapping(address => bytes32[]) private userBBODocuments;

  // check the user is owner of his signature
  modifier userIsOwnerSign(bytes32 bboDocHash, bytes userSign){
  	require(bboDocHash.toEthSignedMessageHash().recover(userSign) == msg.sender);
  	_;
  }

  // get BBODocument by docHash
  function verifyBBODocument(bytes32 bboDocHash, bytes userSign) public view returns (bool) {
  	require(bboDocHash.length == 32);
  	BBODocument storage doc = bboDocuments[bboDocHash];
  	address userAddr = bboDocHash.toEthSignedMessageHash().recover(userSign);
  	return keccak256(doc.signedAddresses[userAddr]) == keccak256(userSign);
  }
  // create bboDocuments
  function createBBODocument(bytes32 bboDocHash) private {
  	require(bboDocuments[bboDocHash].docHash != bboDocHash);
  	bboDocuments[bboDocHash].docHash = bboDocHash;
  }
  // get list address by docHash
  function getUsersByDocHash(bytes32 bboDocHash) public view onlyOwner returns(address[] userSigneds){
    userSigneds = bboDocuments[bboDocHash].addresses;
  }

  // get list signed document of user
  function getUserSignedDocuments() public view returns(bytes32[] docHashes){
  	require (msg.sender!= address(0x0));
  	docHashes = userBBODocuments[msg.sender];
  }

  // user Sign The Document
  event BBODocumentSigned(bytes32 bboDocHash, address indexed user);
  function signBBODocument(bytes32 bboDocHash, bytes userSign) public 
   userIsOwnerSign(bboDocHash, userSign)
   {
  	 require(bboDocHash.length == 32);
  	 if(bboDocuments[bboDocHash].docHash == bboDocHash){
  	 	// check user not sign this document yet
  	 	require(keccak256(bboDocuments[bboDocHash].signedAddresses[msg.sender])!=keccak256(userSign));
  	 }else{
  	 	createBBODocument(bboDocHash);
  	 }
  	 bboDocuments[bboDocHash].signedAddresses[msg.sender] = userSign;
  	 bboDocuments[bboDocHash].addresses.push(msg.sender);
  	 userBBODocuments[msg.sender].push(bboDocHash);
  	 emit BBODocumentSigned(bboDocHash, msg.sender);
  }

}
