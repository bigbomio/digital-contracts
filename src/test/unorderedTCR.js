var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBVotingHelper = artifacts.require("BBVotingHelper");
const BBParams = artifacts.require("BBParams");
const BBUnOrderedTCR = artifacts.require("BBUnOrderedTCR");

var contractAddr = '';

var optionID = 0;
var pollID = 0;

var proxyAddressVoting = '';
var proxyAddressVotingHelper = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
var proxyAddressTCR = '';

contract('BBUnOrderedTCR Test', async (accounts) => {
  it("initialize  contract", async () => {

    var erc20 = await BBOTest.new({
      from: accounts[0]
    });
    bboAddress = erc20.address;
    var storage = await BBStorage.new({
      from: accounts[0]
    });
    storageAddress = storage.address;

    // create bb contract
    var votingInstance = await BBVoting.new({
      from: accounts[0]
    });
    var votingHelperInstance = await BBVotingHelper.new({
      from: accounts[0]
    });
    var paramsInstance = await BBParams.new({
      from: accounts[0]
    });
    var proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    
    var unOrderedTCRInstance = await BBUnOrderedTCR.new({
      from: accounts[0]
    });
    const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
      from: accounts[0]
    });
    proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l6 = await proxyFact.createProxy(accounts[8], votingHelperInstance.address, {
      from: accounts[0]
    });
    proxyAddressVotingHelper = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l7 = await proxyFact.createProxy(accounts[8], unOrderedTCRInstance.address, {
      from: accounts[0]
    });
    proxyAddressTCR = l7.logs.find(l => l.event === 'ProxyCreated').args.proxy



    // set admin to storage
  
    await storage.addAdmin(proxyAddressVoting, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVotingHelper, true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressTCR, true, {
      from: accounts[0]
    });
    await storage.addAdmin(accounts[7], true, {
      from: accounts[0]
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(accounts[1], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[2], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[3], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[4], 100000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[5], 900e18, {
      from: accounts[0]
    });


    let votingHelper = await BBVotingHelper.at(proxyAddressVotingHelper);
    await votingHelper.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await votingHelper.setStorage(storage.address, {
      from: accounts[0]
    });
    await votingHelper.setBBO(bboAddress, {
      from: accounts[0]
    });


    let voting = await BBVoting.at(proxyAddressVoting);
    await voting.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await voting.setStorage(storage.address, {
      from: accounts[0]
    });
    await voting.setBBO(bboAddress, {
      from: accounts[0]
    });
    await voting.setHelper(proxyAddressVotingHelper, {
      from: accounts[0]
    });

    //BBUnOrderedTCR
    let unOrderedTCR = await BBUnOrderedTCR.at(proxyAddressTCR);
    await unOrderedTCR.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await unOrderedTCR.setStorage(storage.address, {
      from: accounts[0]
    });
    await unOrderedTCR.setVoting(proxyAddressVoting, {
      from: accounts[0]
    });
    await unOrderedTCR.setVotingHelper(proxyAddressVotingHelper, {
      from: accounts[0]
    });


  });


});