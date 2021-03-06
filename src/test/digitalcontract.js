var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
var contractAddr = '';
fs = require('fs');
// var text = fs.readFileSync('../README.md');

// var bboDocHash = web3.utils.sha3(text);
// bboDocHash  = bboDocHash.toString().substring(2);

// const files = [
//   {
//     path: 'README.md',
//     content: text,
//   }
// ]
var bboDocHash='';
var abi = require('ethereumjs-abi')
var BN = require( 'bignumber.js')

function formatValue(value) {
  if (typeof(value) === 'number' || BN.isBigNumber(value)) {
    return value.toString();
  } else {
    return value;
  }
}

function encodeCall(name, args = [], rawValues = []) {
  const values = rawValues.map(formatValue)
  const methodId = abi.methodID(name, args).toString('hex');
  const params = abi.rawEncode(args, values).toString('hex');
  return '0x' + methodId + params;
}



contract('BigbomDigitalContract Test', async (accounts) => {

  it("user A sign first contract", async () => {

     // var filesrs = await ipfs.files.add(files);
     
     
     // bboDocHash = filesrs[0].hash;
     bboDocHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
     
     // create storage
      
     let storage = await BBStorage.new({from: accounts[0]});
     
     // create bb contract
     let diginstance = await DigitalContract.new({from: accounts[0]});
     // create proxyfactory
     let proxyFact = await ProxyFactory.new({from: accounts[0]});
     
    
   
     //const initializeData = encodeCall('transferOwnership', ['address'], [accounts[0]]);
     // create proxy to docsign
     const { logs } = await proxyFact.createProxy(accounts[8], diginstance.address, {from: accounts[0]});
     //const { logs } = await proxyFact.createProxyAndCall(accounts[8], diginstance.address, initializeData, {from: accounts[0]});

     const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
     

       // set admin to storage

     await storage.addAdmin(proxyAddress, true, {from: accounts[0]} );
    


     let instance = await DigitalContract.at(proxyAddress);
     await instance.transferOwnership(accounts[0], {from:accounts[0]});
     let storageadr = await instance.getStorage({from:accounts[0]});
     
     await instance.setStorage(storage.address, {from:accounts[0]});

     contractAddr = instance.address;
     

     var userA = accounts[1];
     
     var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
     
     
     var userSign = await web3.eth.sign(bboDocHash, userA, {from:userA});
     

     var assignAddress = [accounts[2]];
     
    
     await instance.createAndSignBBODocument(bboDocHash, userSign,  assignAddress, expiredTime, {from:userA});
     
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     
     

     assert.equal(signed,  true);

     var docHashes = await instance.getDocuments(userA, {from:userA});
     
     docs = web3.utils.hexToUtf8(docHashes[0]).slice(0,-1).split(","); // remove last item
     
     assert.equal(bboDocHash, docs[0]);
     assert.equal(expiredTime, docHashes[1][0]);
  });

   it("user B sign A's contract", async () => {
     var userB = accounts[2];
     

     var userSign = await web3.eth.sign(bboDocHash, userB, {from:userB});
     
     let instance = await DigitalContract.at(contractAddr);
     
     
     await instance.signBBODocument(bboDocHash, userSign, {from:userB});
     
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     
     assert.equal(signed,  true);
  });

  it("user C send C signed should fail", async () => {
     var userC = accounts[3];
     

     var userSign = await web3.eth.sign(bboDocHash, userC, {from:userC});
     
     let instance = await DigitalContract.at(contractAddr);
     
     
     try
     {
         await instance.signBBODocument(bboDocHash, userSign, {from:userC});
         return false;
     }catch(e){
        return true;
     }
  });

  it("user C send B signed should fail", async () => {
     var userB = accounts[2];
     var userC = accounts[3];
     

     var userSign = await web3.eth.sign(bboDocHash, userB, {from:userB});
     
     let instance = await DigitalContract.at(contractAddr);
     
     
     try
     {
     	 await instance.signBBODocument(bboDocHash, userSign, {from:userC});
         return false;
     }catch(e){
     	return true;
     }
  });

  it("user C verifyBBODocument should fail", async () => {
     var userC = accounts[6];
     

     var userSign = await web3.eth.sign(bboDocHash, userC, {from:userC});
     
     let instance = await DigitalContract.at(contractAddr);
     
     
     let signed = await instance.verifyBBODocument(bboDocHash, userSign);
     
     assert.equal(signed,  false);
  });

   it("user owner get List address by bboDocHash", async () => {
     var userOwner = accounts[1];

     
     let instance = await DigitalContract.at(contractAddr);
     
     let addresses = await instance.getAddressesByDocHash(bboDocHash, {from:userOwner});
     
     assert.equal(addresses[0][0],  accounts[1]);
     assert.equal(addresses[0][1],  accounts[2]);
     assert.equal(addresses[1][0],  true);
     assert.equal(addresses[1][1],  true);
  });


})