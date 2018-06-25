# Bigbom Digital Contract

Bigbom Digital Contract

# How to
- Generate document hash

```javascript
var fs = require("fs");
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var textBuff = fs.readFileSync("../README.md");
//  Generate document hash with sha3
var docHash = web3.utils.sha3(textBuff);

```

- Generate signature from document hash

```javascript
// remove 0x prefix
bboDocHash  = bboDocHash.toString().substring(2);

// use private key to sign data
var userSign = await web3.eth.sign(docHash, user_address, {from:user_address});

```

- call SignContract 

```javascript
var contract = require('truffle-contract');
var bboDigitalContractArtifacts = require('../build/contracts/BigbomDigitalContract.json');
var bboDigitalContractAbi = contract(bboDigitalContractArtifacts);

let instance = new web3.eth.Contract(bboDigitalContractAbi.abi, contract_address);

// sign BBO Document
await instance.signBBODocument(docHash, userSign, {from:user_address});

```
- verify document hash signed

```javascript
let signed = await instance.verifyBBODocument(bboDocHash, userSign);
assert.equal(signed,  true);

```
