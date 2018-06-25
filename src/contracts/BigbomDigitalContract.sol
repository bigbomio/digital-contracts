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
  modifier userIsOwnerSign(bytes bboDocHash, bytes userSign){
  	require(toEthSignedMessageHashBytes(bboDocHash).recover(userSign) == msg.sender);
  	_;
  }

  // get BBODocument by docHash
  function verifyBBODocument(bytes _bboDocHash, bytes userSign) public view returns (bool) {
    bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
  	BBODocument storage doc = bboDocuments[bboDocHash];
  	address userAddr = toEthSignedMessageHashBytes(_bboDocHash).recover(userSign);
  	return toEthSignedMessageHashBytes(_bboDocHash).recover(doc.signedAddresses[userAddr]) == toEthSignedMessageHashBytes(_bboDocHash).recover(userSign);
  }
  // create bboDocuments
  function createBBODocument(bytes32 bboDocHash) private {
  	require(bboDocuments[bboDocHash].docHash != bboDocHash);
  	bboDocuments[bboDocHash].docHash = bboDocHash;
  }
  // get list address by docHash
  function getUsersByDocHash(bytes _bboDocHash) public view onlyOwner returns(address[] userSigneds){
    bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
    userSigneds = bboDocuments[bboDocHash].addresses;
  }

  // get list signed document of user
  function getUserSignedDocuments() public view returns(bytes32[] docHashes){
  	require (msg.sender!= address(0x0));
  	docHashes = userBBODocuments[msg.sender];
  }

  // Convert an hexadecimal character to their value
  function fromHexChar(uint c) internal pure returns (uint) {
      if (byte(c) >= byte('0') && byte(c) <= byte('9')) {
          return c - uint(byte('0'));
      }
      if (byte(c) >= byte('a') && byte(c) <= byte('f')) {
          return 10 + c - uint(byte('a'));
      }
      if (byte(c) >= byte('A') && byte(c) <= byte('F')) {
          return 10 + c - uint(byte('A'));
      }
  }
  // Convert an hexadecimal string to raw bytes
  function fromBytesToBytes32(bytes s) internal pure returns (bytes32 result) {
      bytes memory ss = bytes(s);
      require(ss.length%2 == 0); // length must be even
      bytes memory r = new bytes(ss.length/2);
      for (uint i=0; i<ss.length/2; ++i) {
          r[i] = byte(fromHexChar(uint(ss[2*i])) * 16 +
                      fromHexChar(uint(ss[2*i+1])));
      }
      assembly {
        result := mload(add(r, 32))
      }
  }

  //
  function toEthSignedMessageHashBytes(bytes hash)
    internal
    pure
    returns (bytes32)
  {
    // 64 is the length in bytes of hash,
    // enforced by the type signature above
    return keccak256(
      abi.encodePacked("\x19Ethereum Signed Message:\n64", hash)
    );
  }

  // user Sign The Document
  event BBODocumentSigned(bytes32 bboDocHash, address indexed user);
  function signBBODocument(bytes _bboDocHash, bytes userSign) public 
   userIsOwnerSign(_bboDocHash, userSign)
   {
     bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
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
