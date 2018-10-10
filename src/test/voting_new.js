var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
  protocol: 'https'
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBFreelancerJob = artifacts.require("BBFreelancerJob");
const BBFreelancerBid = artifacts.require("BBFreelancerBid");
const BBFreelancerPayment = artifacts.require("BBFreelancerPayment");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");
const BBVoting = artifacts.require("BBVoting");
const BBVotingHelper = artifacts.require("BBVotingHelper");
const BBParams = artifacts.require("BBParams");

var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz1';
var jobHash5 = 'QmSn1wGTpz2'
var jobID=0;
var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressVotingHelper = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
contract('Voting Test', async (accounts) => {
  it("initialize  contract", async () => {
    var erc20 = await BBOTest.new({from: accounts[0]});
    bboAddress = erc20.address;
    var storage = await BBStorage.new({ from: accounts[0]});
    storageAddress = storage.address;
  
    // create bb contract
    var jobInstance = await BBFreelancerJob.new({from: accounts[0]});
    var bidInstance = await BBFreelancerBid.new({from: accounts[0]});
    var paymentInstance = await BBFreelancerPayment.new({ from: accounts[0] });
    var votingInstance = await BBVoting.new({  from: accounts[0] });
    var votingHelperInstance = await BBVotingHelper.new({  from: accounts[0] });
    var paramsInstance = await BBParams.new({  from: accounts[0] });
    var proxyFact = await ProxyFactory.new({  from: accounts[0] });
    

    const l1 = await proxyFact.createProxy(accounts[8], jobInstance.address, {from: accounts[0]});
    proxyAddressJob = l1.logs.find(l => l.event === 'ProxyCreated').args.proxy

    const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {from: accounts[0]});
    proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy


      const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, { from: accounts[0] });
      proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, { from: accounts[0]});
      proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {from: accounts[0]});
      proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy

      const l6 = await proxyFact.createProxy(accounts[8], votingHelperInstance.address, { from: accounts[0]});
      proxyAddressVotingHelper = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy



    // set admin to storage
    await storage.addAdmin(proxyAddressJob, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressBid, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressPayment, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressVoting, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressVotingHelper, true, {from: accounts[0] });
    await storage.addAdmin(proxyAddressParams, true, {from: accounts[0] });

    await storage.addAdmin(accounts[7], true, {from: accounts[0] });


    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(accounts[1], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[2], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[3], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[4], 100000e18, {from: accounts[0] });
    await bbo.transfer(accounts[5], 900e18, {from: accounts[0] });




    let job = await BBFreelancerJob.at(proxyAddressJob);
    await job.transferOwnership(accounts[0], {from: accounts[0] });
    await job.setStorage(storage.address, {from: accounts[0] });
    await job.setBBO(bboAddress, {from: accounts[0] });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    await bid.transferOwnership(accounts[0], {from: accounts[0] });
    await bid.setStorage(storage.address, {from: accounts[0] });
    await bid.setBBO(bboAddress, {from: accounts[0] });

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.transferOwnership(accounts[0], {from: accounts[0] });
    await payment.setStorage(storage.address, {from: accounts[0] });
    await payment.setBBO(bboAddress, {from: accounts[0] });

    let votingHelper = await BBVotingHelper.at(proxyAddressVotingHelper);
    await votingHelper.transferOwnership(accounts[0], {from: accounts[0] });
    await votingHelper.setStorage(storage.address, {from: accounts[0] });
    await votingHelper.setBBO(bboAddress, {from: accounts[0] });
    

    let voting = await BBVoting.at(proxyAddressVoting);
    await voting.transferOwnership(accounts[0], {from: accounts[0] });
    await voting.setStorage(storage.address, {from: accounts[0] });
    await voting.setBBO(bboAddress, {from: accounts[0] });
    await voting.setHelper(proxyAddressVotingHelper, {from: accounts[0] });


    let params = await BBParams.at(proxyAddressParams);
    await params.transferOwnership(accounts[0], {from: accounts[0] });
    await params.setStorage(storage.address, {from: accounts[0] });
    await params.setBBO(bboAddress, {from: accounts[0] });

    

    await bid.setPaymentContract(proxyAddressPayment, {from: accounts[0] });

});


it("start job for dispute voting", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days

    let l0 = await job.createJob(jobHash4, expiredTime, estimatedTime, 500e18, 'banner', { from: userA });
    jobID = l0.logs.find(l => l.event === 'JobCreated').args.jobID
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobHash4, 400e18, timeDone, { from: userB });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, { from: userA });
    await bbo.approve(bid.address, Math.pow(2, 255), { from: userA });
    await bid.acceptBid(jobHash4, userB, { from: userA });

    await job.startJob(jobHash4, { from: userB });
    await job.finishJob(jobHash4, { from: userB });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4, 1, { from: userA});

});
it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setPollType(1, proxyAddressJob);// set job
    await params.setVotingParams(1, 100e18, 1000000e18, 100e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, { from: accounts[0] });
    return true;
});

it("start poll", async () => {
    let voting = await BBVoting.at(proxyAddressVoting);
    let proofHash = 'proofHash';
    var userB = accounts[2];
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(voting.address, 0, { from: userB });
    await bbo.approve(voting.address, Math.pow(2, 255), { from: userB });
    let l = await voting.startPoll(1, jobID, proofHash, { from: userB });
    console.log(l.logs);
    const returnJobID = l.logs.find(l => l.event === 'PollStarted').args.relatedTo
    assert.equal(jobID.toString(), returnJobID.toString());
});

});