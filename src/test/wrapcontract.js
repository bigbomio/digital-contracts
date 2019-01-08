var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBWrapMainChain = artifacts.require("BBWrapMainChain");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");


const files = [{
  path: 'README.md',
  content: 'text',
}]

var abi = require('ethereumjs-abi')
var BN = require('bignumber.js')

function formatValue(value) {
  if (typeof (value) === 'number' || BN.isBigNumber(value)) {
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

var proxyAddressWrapMainChain = '';

contract('BBWrap Main Chain Test', async (accounts) => {
  
  it("Initialize contract", async () => {


    let storage = await BBStorage.new({
      from: accounts[0]
    });

    storageAddress = storage.address;
    // create bb contract
    let wrapMainChain = await BBWrapMainChain.new({
      from: accounts[0]
    });
   
    // create proxyfactory
    let proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    // create proxy to docsign
    const {
      logs
    } = await proxyFact.createProxy(accounts[8], wrapMainChain.address, {
      from: accounts[0]
    });
    proxyAddressWrapMainChain = logs.find(l => l.event === 'ProxyCreated').args.proxy


    // set admin to storage
    await storage.addAdmin(proxyAddressWrapMainChain, true, {
      from: accounts[0]
    });
   
    let wrapMainChainInstance = await BBWrapMainChain.at(proxyAddressWrapMainChain);
    await wrapMainChainInstance.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await wrapMainChainInstance.setStorage(storage.address, {
      from: accounts[0]
    });
    await wrapMainChainInstance.addAdmin(accounts[1],true, {
        from: accounts[0]
      });
  
    });


  it("Deposit Ether", async () => {

    let wrapMainChain = await BBWrapMainChain.at(proxyAddressWrapMainChain);
     
    let l =  await web3.eth.sendTransaction({
        from: accounts[3],
        to: wrapMainChain.address,
        value: web3.utils.toWei('9', "ether")
    });

    await web3.eth.sendTransaction({
        from: accounts[4],
        to: wrapMainChain.address,
        value: web3.utils.toWei('7', "ether")
    });

    return true;

  });

  it("[Fail] Not Admin WithDrawal Ether", async () => {

    let wrapMainChain = await BBWrapMainChain.at(proxyAddressWrapMainChain);
    try {
    await wrapMainChain.withDrawal(accounts[3], 
        {from : accounts[3]}
       );
       return false;
    } catch(e) {
        return true;
    }
   
  });
 
  it("WithDrawal Ether", async () => {

    let wrapMainChain = await BBWrapMainChain.at(proxyAddressWrapMainChain);
    let l = await wrapMainChain.withDrawal(accounts[3], 
        {from : accounts[1]}
       );
    const receiverAddress = l.logs.find(l => l.event === 'WithDrawal').args.receiver;
    
    assert.equal(receiverAddress, accounts[3]);
       
  });

  it("[Fail] WithDrawal Ether again", async () => {
    try {
    let wrapMainChain = await BBWrapMainChain.at(proxyAddressWrapMainChain);
    await wrapMainChain.withDrawal(accounts[3], 
        {from : accounts[1]}
       );
       return false;
    } catch(e) {
        return true;
    }
       
  });
 
 

});