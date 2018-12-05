var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBFreelancerJob = artifacts.require("BBFreelancerJob");
const BBFreelancerBid = artifacts.require("BBFreelancerBid");
const BBFreelancerPayment = artifacts.require("BBFreelancerPayment");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBParams = artifacts.require("BBParams");
const BBDispute = artifacts.require("BBDispute");
const BBRating = artifacts.require("BBRating");


var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressPoll = '';
var proxyAddressRating = '';
var proxyAddressDispute = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';

module.exports = async function(deployer,network,accounts) {

//   if(deployer.network_id == 777){
//   	//TOOD
//   	// var filesrs = await ipfs.files.add(files);


//     // jobHash = filesrs[0].hash;
//     erc20 = await BBOTest.new({
//       from: accounts[0]
//     });
//     bboAddress = erc20.address;

//     // create storage

//     let storage = await BBStorage.new({
//       from: accounts[0]
//     });

//     storageAddress = storage.address;
//     // create bb contract
//     let jobInstance = await BBFreelancerJob.new({
//       from: accounts[0]
//     });
//     let bidInstance = await BBFreelancerBid.new({
//       from: accounts[0]
//     });
//     let paymentInstance = await BBFreelancerPayment.new({
//       from: accounts[0]
//     });
//     let votingInstance = await BBVoting.new({
//       from: accounts[0]
//     });
//     let ratingInstance = await BBRating.new({
//       from: accounts[0]
//     });
//     let votingRewardInstance = await BBDispute.new({
//       from: accounts[0]
//     });

//     let paramsInstance = await BBParams.new({
//       from: accounts[0]
//     });

//     // create proxyfactory
//     let proxyFact = await ProxyFactory.new({
//       from: accounts[0]
//     });
//     // create proxy to docsign
//     const {
//       logs
//     } = await proxyFact.createProxy(accounts[8], jobInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressJob = logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l6 = await proxyFact.createProxy(accounts[8], votingRewardInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressDispute = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     const l7 = await proxyFact.createProxy(accounts[8], ratingInstance.address, {
//       from: accounts[0]
//     });
//     proxyAddressRating = l7.logs.find(l => l.event === 'ProxyCreated').args.proxy


//     // set admin to storage
//     await storage.addAdmin(proxyAddressJob, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressBid, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressPayment, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressVoting, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressDispute, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressParams, true, {
//       from: accounts[0]
//     });
//     await storage.addAdmin(proxyAddressRating, true, {
//       from: accounts[0]
//     });

//     await storage.addAdmin(accounts[7], true, {
//       from: accounts[0]
//     });


//     let bbo = await BBOTest.at(bboAddress);
//     await bbo.transfer(accounts[1], 100000e18, {
//       from: accounts[0]
//     });
//     await bbo.transfer(accounts[2], 100000e18, {
//       from: accounts[0]
//     });
//     await bbo.transfer(accounts[3], 100000e18, {
//       from: accounts[0]
//     });
//     await bbo.transfer(accounts[4], 100000e18, {
//       from: accounts[0]
//     });
//     await bbo.transfer(accounts[5], 900e18, {
//       from: accounts[0]
//     });



//     let job = await BBFreelancerJob.at(proxyAddressJob);
//     await job.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await job.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await job.setBBO(bboAddress, {
//       from: accounts[0]
//     });

//     let bid = await BBFreelancerBid.at(proxyAddressBid);
//     await bid.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await bid.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await bid.setBBO(bboAddress, {
//       from: accounts[0]
//     });

//     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
//     await payment.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await payment.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await payment.setBBO(bboAddress, {
//       from: accounts[0]
//     });

//     let rating = await BBRating.at(proxyAddressRating);
//     await rating.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await rating.setStorage(storage.address, {
//       from: accounts[0]
//     });
    
   
//     let voting = await BBVoting.at(proxyAddressVoting);
//     await voting.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await voting.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await voting.setBBO(bboAddress, {
//       from: accounts[0]
//     });

//     let params = await BBParams.at(proxyAddressParams);
//     await params.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await params.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await params.setBBO(bboAddress, {
//       from: accounts[0]
//     });

//     let votingReward = await BBDispute.at(proxyAddressDispute);
//     await votingReward.transferOwnership(accounts[0], {
//       from: accounts[0]
//     });
//     await votingReward.setStorage(storage.address, {
//       from: accounts[0]
//     });
//     await votingReward.setBBO(bboAddress, {
//       from: accounts[0]
//     });
//     await votingReward.setPayment(proxyAddressPayment, {
//       from: accounts[0]
//     })

//     await bid.setPaymentContract(proxyAddressPayment, {
//       from: accounts[0]
//     });


// console.log('proxyAddressJob', proxyAddressJob);
// console.log('proxyAddressBid', proxyAddressBid);
// console.log('proxyAddressPayment', proxyAddressPayment);
// console.log('proxyAddressVoting', proxyAddressVoting);
// console.log('proxyAddressRating', proxyAddressRating);
// console.log('proxyAddressDispute', proxyAddressDispute);
// console.log('bboAddress', bboAddress);
// console.log('storageAddress', storageAddress);
//   }
}