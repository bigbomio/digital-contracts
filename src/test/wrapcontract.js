var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBWrap = artifacts.require("BBWrap");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const TokenSideChain = artifacts.require("TokenSideChain");

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

var proxyAddressWrap = '';
var tokenAddress = ';'
var ether_address = '0x00eEeEEEeEEeEEEeEeeeEeEEeeEeeeeEEEeEEbb0'; 

contract('BBWrap Main Chain Test', async (accounts) => {
  
  it("Initialize contract", async () => {

    erc20 = await TokenSideChain.new('BEther','BETH',18,{
      from: accounts[0]
    });
    tokenAddress = erc20.address;

    let storage = await BBStorage.new({
      from: accounts[0]
    });

    storageAddress = storage.address;
    // create bb contract
    let wrapContract = await BBWrap.new({
      from: accounts[0]
    });
   
    // create proxyfactory
    let proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    // create proxy to docsign
    const {
      logs
    } = await proxyFact.createProxy(accounts[8], wrapContract.address, {
      from: accounts[0]
    });
    proxyAddressWrap = logs.find(l => l.event === 'ProxyCreated').args.proxy


    // set admin to storage
    await storage.addAdmin(proxyAddressWrap, true, {
      from: accounts[0]
    });
   
    let wrapInstance = await BBWrap.at(proxyAddressWrap);
    await wrapInstance.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await wrapInstance.setStorage(storage.address, {
      from: accounts[0]
    });
    await wrapInstance.addAdmin(accounts[1],true, {
        from: accounts[0]
      });


    let tokenEther = await TokenSideChain.at(tokenAddress);
  

    await tokenEther.transferOwnership(proxyAddressWrap, {
      from: accounts[0]
    });
  
    });

    
    it("Set Token in side-chain", async () => {
      let wrapContract = await BBWrap.at(proxyAddressWrap);
      let l = await wrapContract.setToken(tokenAddress,'TOKEN_ETHER', {from : accounts[1]});
      const token = l.logs.find(l => l.event === 'SetToken').args.token;
      
      assert.equal(token, tokenAddress);
    });

    it("[Fail] Not Admin Set Token in side-chain", async () => {
      let wrapContract = await BBWrap.at(proxyAddressWrap);
      try {
        await wrapContract.setToken(tokenAddress,'TOKEN_ETHER', {from : accounts[3]});
        console.log('Not Admin Set Token in side-chain OK');
        return false;
      } catch(e) {
        return true;
      }
      
    });
   

  it("Deposit Ether", async () => {

    let wrapContract = await BBWrap.at(proxyAddressWrap);
     
    let l =  await web3.eth.sendTransaction({
        from: accounts[3],
        to: wrapContract.address,
        value: web3.utils.toWei('9', "ether")
    });

    await web3.eth.sendTransaction({
        from: accounts[4],
        to: wrapContract.address,
        value: web3.utils.toWei('7', "ether")
    });

    return true;

  });


  it("[Fail] Deposit 0 Ether", async () => {

    let wrapContract = await BBWrap.at(proxyAddressWrap);
     try {
      await web3.eth.sendTransaction({
        from: accounts[3],
        to: wrapContract.address,
        value: web3.utils.toWei('0', "ether")
    });
    return false;
  } catch(e) {
    return true;
  }

  });

  it("Mint Token in side-chain", async () => {
    let wrapContract = await BBWrap.at(proxyAddressWrap);

    let l = await wrapContract.mintToken(accounts[3], 99e18,'TOKEN_ETHER', 'txhashxxxx', {from : accounts[1]});
    const receiverAddress = l.logs.find(l => l.event === 'MintToken').args.receiverAddress;
    assert.equal(receiverAddress, accounts[3]);
  });

  it("[Fail] Mint Token in side-chain again with same txHash", async () => {
    let wrapContract = await BBWrap.at(proxyAddressWrap);
    try {
     await wrapContract.mintToken(accounts[3], 99e18,'TOKEN_ETHER', 'txhashxxxx', {from : accounts[1]});
       console.log('[Fail] Mint Token in side-chain again with same txHash OK');
       return false;

    } catch(e) {
      return true;
    }
  });

  it("[Fail] Deposit 0 Token ", async () => {

    let etherToken = await TokenSideChain.at(tokenAddress);

    await etherToken.approve(proxyAddressWrap, 99e18, {from : accounts[3]});

    let wrapContract = await BBWrap.at(proxyAddressWrap);
    try {
      await wrapContract.depositToken(tokenAddress, 0, {from : accounts[3]});
      return false;
    } catch (e) {
      return true;
    }
    
  });


  it("Deposit Token", async () => {

    let etherToken = await TokenSideChain.at(tokenAddress);

    await etherToken.approve(proxyAddressWrap, 99e18, {from : accounts[3]});

    let wrapContract = await BBWrap.at(proxyAddressWrap);

    let l = await wrapContract.depositToken(tokenAddress, 99e18, {from : accounts[3]});
    const sender = l.logs.find(l => l.event === 'DepositToken').args.sender;
    assert.equal(sender, accounts[3]);
  });


  it("[Fail] Not Admin Mint Token in side-chain", async () => {
    let wrapContract = await BBWrap.at(proxyAddressWrap);
    try {
      await wrapContract.mintToken(accounts[3], 99e18,'TOKEN_ETHER', 'txhashxxxx', {from : accounts[6]});
      console.log('Not Admin Mint Token in side-chain OK');
      return false;
    } catch(e) {
      return true;
    }
  });

  it("[Fail] Not Admin WithDrawal Ether", async () => {

    let wrapContract = await BBWrap.at(proxyAddressWrap);
    try {
    await wrapContract.withDrawal(accounts[3], ether_address, 10, {from : accounts[3]}
       );
       console.log(' Not Admin WithDrawal Ether OK');
       return false;
    } catch(e) {
        return true;
    }
   
  });
 
  it("WithDrawal Ether", async () => {

    let wrapContract = await BBWrap.at(proxyAddressWrap);
    let l = await wrapContract.doWithdrawal(accounts[3], ether_address, 10, 'txHash001' ,{from : accounts[1]}
       );
    const receiverAddress = l.logs.find(l => l.event === 'Withdrawal').args.receiver;
    
    assert.equal(receiverAddress, accounts[3]);
       
  });


  it("[Fail] WithDrawal Ether agian with the same txHash", async () => {
    try {
    let wrapContract = await BBWrap.at(proxyAddressWrap);
     await wrapContract.doWithdrawal(accounts[3], ether_address, 10, 'txHash001' ,{from : accounts[1]}
       );
       console.log('[Fail] WithDrawal Ether agian with the same txHash OK');
       return false;
    } catch(e) {
      return true;
    }
    
       
  });

  it("WithDrawal Token", async () => {

    let wrapContract = await BBWrap.at(proxyAddressWrap);
    let l = await wrapContract.doWithdrawal(accounts[3], tokenAddress, 10, 'txHash003' ,{from : accounts[1]}
       );
    const receiverAddress = l.logs.find(l => l.event === 'Withdrawal').args.receiver;
    
    assert.equal(receiverAddress, accounts[3]);
       
  });
 

});