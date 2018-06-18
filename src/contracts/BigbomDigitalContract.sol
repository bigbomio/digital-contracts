pragma solidity ^0.4.4;

import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/ECRecovery.sol';

contract BigbomDigitalContract {
  // BBODocument Struct
  struct BBODocument{
  	bytes32 docHash; //document Hash 
  	uint created; // created timestamp
  	uint updated; // updated timestamp
  	mapping(address => bytes) signedPersons; // mapping address, userSign
  }

  uint private documentNum;
  // mapping document Id, BBODocument
  mapping(uint => BBODocument) private bboDocuments;

  // mapping address, list of document Id
  mapping(address => uint[]) private userBBODocuments;

  // mapping document hash, document Id
  mapping(bytes32 => uint) private bboDocHashIds;

  // check user not sign this document yet
  modifier userNotSignedYet(bytes32 bboDocHash, bytes userSign) {
  	uint docId = bboDocHashIds[bboDocHash];
  	if(docId > 0 && docId <= documentNum)
    	require(keccak256(bboDocuments[docId].signedPersons[msg.sender])==keccak256(userSign));
    _;
  }
  // check the user is owner of his signature
  modifier userIsOwnerSign(bytes32 bboDocHash, bytes userSign){
  	address userAddr = ECRecovery.recover(ECRecovery.toEthSignedMessageHash(bboDocHash), userSign);
  	require(userAddr == msg.sender);
  	_;
  }

  // get BBODocument by docHash
  function verifyBBODocument(bytes32 bboDocHash, bytes userSign) public view returns (bool) {
  	BBODocument storage doc = bboDocuments[bboDocHashIds[bboDocHash]];
  	address userAddr = ECRecovery.recover(ECRecovery.toEthSignedMessageHash(bboDocHash), userSign); 
  	return keccak256(doc.signedPersons[userAddr]) == keccak256(userSign);
  }

  function createBBODocument(bytes32 bboDocHash) private  returns(uint bboDocId){
  	bboDocId = documentNum++;
  	bboDocuments[bboDocId] = BBODocument(bboDocHash, now, now);
  	bboDocHashIds[bboDocHash] = bboDocId;
  }
  // user Sign The Document
  event BBODocumentSigned(bytes32 bboDocHash, bytes userSign, uint timestamp, address user);
  function signBBODocument(bytes32 bboDocHash, bytes userSign) public 
   userIsOwnerSign(bboDocHash, userSign)
   userNotSignedYet(bboDocHash, userSign)
   {
  	 //TODO check input
  	 uint docId = bboDocHashIds[bboDocHash];
  	 if(!(docId > 0 && docId <= documentNum)){
  	 	docId = createBBODocument(bboDocHash);
  	 }
  	 bboDocuments[docId].signedPersons[msg.sender] = userSign;
  	 bboDocuments[docId].updated = now;
  	 emit BBODocumentSigned(bboDocHash, userSign, now, msg.sender);
  }

}
