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
    uint expiredTimestamp;
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
  function createBBODocument(bytes32 bboDocHash, uint expiredTimestamp) private {
  	require(bboDocuments[bboDocHash].docHash != bboDocHash);
  	bboDocuments[bboDocHash].docHash = bboDocHash;
    bboDocuments[bboDocHash].expiredTimestamp = expiredTimestamp;
  }
  // TODO get list address & status by docHash
  function getAddressesByDocHash(bytes _bboDocHash) public view returns(address[], bool[]){
    bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
    address[] memory addresses = bboDocuments[bboDocHash].addresses;
    bool[] memory status = new bool[](addresses.length);
    for(uint i=0;i<addresses.length;i++){
      status[i] = (keccak256(bboDocuments[bboDocHash].signedAddresses[addresses[i]])!=keccak256(""));
    }
    return (addresses, status);
  }

  // TODO get list signed document of user
  function getDocuments(address user) public view returns(bytes32[], uint[]){
  	bytes32[] memory docHashes = userBBODocuments[user];
    uint[] memory expiredTimestamps = new uint[] (docHashes.length);
    for(uint i=0;i<docHashes.length;i++){
      expiredTimestamps[i] = bboDocuments[docHashes[i]].expiredTimestamp;
    }
    return (docHashes, expiredTimestamps);
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
  function createAndSignBBODocument(bytes _bboDocHash, bytes userSign, address[] pendingAddresses, uint expiredTimestamp) public 
   userIsOwnerSign(_bboDocHash, userSign)
   {
     bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
     // expiredTimestamp must > now
     require(expiredTimestamp > now);
     // docHash not existing
  	 require(bboDocuments[bboDocHash].docHash != bboDocHash);
     // list pendingAddresses 
     require(pendingAddresses.length > 0);
  	 
     bool pendingAddressesIsValid = false;
     for(uint i=0;i<pendingAddresses.length;i++){
       if(msg.sender!=pendingAddresses[i]){
        // add docHash to Pending sign address
        userBBODocuments[pendingAddresses[i]].push(bboDocHash);
        bboDocuments[bboDocHash].addresses.push(pendingAddresses[i]);
        pendingAddressesIsValid = true;
       }
     }
  	 
     require(pendingAddressesIsValid==true);
     createBBODocument(bboDocHash, expiredTimestamp);
     bboDocuments[bboDocHash].signedAddresses[msg.sender] = userSign;
     bboDocuments[bboDocHash].addresses.push(msg.sender);
     userBBODocuments[msg.sender].push(bboDocHash);     
     emit BBODocumentSigned(bboDocHash, msg.sender);
  }

  function signBBODocument(bytes _bboDocHash, bytes userSign)public 
   userIsOwnerSign(_bboDocHash, userSign)
   {
     bytes32 bboDocHash = fromBytesToBytes32(_bboDocHash);
     require(bboDocuments[bboDocHash].docHash == bboDocHash);
     require(keccak256(bboDocuments[bboDocHash].signedAddresses[msg.sender])!=keccak256(userSign));
     require(bboDocuments[bboDocHash].expiredTimestamp > now);
     bool userHasDocHash = false;
     for(uint i=0;i<userBBODocuments[msg.sender].length;i++){
      if(userBBODocuments[msg.sender][i] == bboDocHash){
        userHasDocHash = true;
      }
     }
     require(userHasDocHash==true);
     bboDocuments[bboDocHash].signedAddresses[msg.sender] = userSign;
     emit BBODocumentSigned(bboDocHash, msg.sender);
  }

}
