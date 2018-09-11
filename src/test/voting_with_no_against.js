var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('../helpers/helpers.js');

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
const BBParams = artifacts.require("BBParams");
const BBPoll = artifacts.require("BBPoll");

var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz1';

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

var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var proxyAddressVoting = '';
var proxyAddressPoll = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';

contract('Voting Test 2', async (accounts) => { 
  
  it("initialize contract 2", async () => {

    // var filesrs = await ipfs.files.add(files);
    // //console.log('filesrs', filesrs);

    // jobHash = filesrs[0].hash;
    erc20 = await BBOTest.new({
      from: accounts[0]
    });
    bboAddress = erc20.address;
    //console.log('jobHash', jobHash);
    // create storage
    //console.log('bboAddress', bboAddress);
    let storage = await BBStorage.new({
      from: accounts[0]
    });
    //console.log('storage address', storage.address);
    storageAddress = storage.address;
    // create bb contract
    let jobInstance = await BBFreelancerJob.new({
      from: accounts[0]
    });
    let bidInstance = await BBFreelancerBid.new({
      from: accounts[0]
    });
    let paymentInstance = await BBFreelancerPayment.new({
      from: accounts[0]
    });
    let votingInstance = await BBVoting.new({
      from: accounts[0]
    });
    let votingRewardInstance = await BBPoll.new({
      from: accounts[0]
    });

    let paramsInstance = await BBParams.new({
      from: accounts[0]
    });

    // create proxyfactory
    let proxyFact = await ProxyFactory.new({
      from: accounts[0]
    });
    // create proxy to docsign
    const {
      logs
    } = await proxyFact.createProxy(accounts[8], jobInstance.address, {
      from: accounts[0]
    });
    proxyAddressJob = logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressJob', proxyAddressJob)

    const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {
      from: accounts[0]
    });
    proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressBid', proxyAddressBid)

    const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, {
      from: accounts[0]
    });
    proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressPayment', proxyAddressPayment)

    const l4 = await proxyFact.createProxy(accounts[8], votingInstance.address, {
      from: accounts[0]
    });
    proxyAddressVoting = l4.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressVoting', proxyAddressVoting)

    const l5 = await proxyFact.createProxy(accounts[8], paramsInstance.address, {
      from: accounts[0]
    });
    proxyAddressParams = l5.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressParams', proxyAddressParams)

    const l6 = await proxyFact.createProxy(accounts[8], votingRewardInstance.address, {
      from: accounts[0]
    });
    proxyAddressPoll = l6.logs.find(l => l.event === 'ProxyCreated').args.proxy
    //console.log('proxyAddressPoll', proxyAddressPoll)


    // set admin to storage
    await storage.addAdmin(proxyAddressJob, true,  {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressBid,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPayment, true,  {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressVoting,  true, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPoll, true,  {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressParams,  true, {
      from: accounts[0]
    });

    await storage.addAdmin(accounts[7], true,  {
      from: accounts[0]
    });

    //console.log('done storage')
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
    //console.log('bbo: ', bbo.address);

    

    let job = await BBFreelancerJob.at(proxyAddressJob);
    await job.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await job.setStorage(storage.address, {
      from: accounts[0]
    });
    await job.setBBO(bboAddress, {
      from: accounts[0]
    });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    await bid.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await bid.setStorage(storage.address, {
      from: accounts[0]
    });
    await bid.setBBO(bboAddress, {
      from: accounts[0]
    });

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await payment.setStorage(storage.address, {
      from: accounts[0]
    });
    await payment.setBBO(bboAddress, {
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

    let params = await BBParams.at(proxyAddressParams);
    await params.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await params.setStorage(storage.address, {
      from: accounts[0]
    });
    await params.setBBO(bboAddress, {
      from: accounts[0]
    });

    let votingReward = await BBPoll.at(proxyAddressPoll);
    await votingReward.transferOwnership(accounts[0], {
      from: accounts[0]
    });
    await votingReward.setStorage(storage.address, {
      from: accounts[0]
    });
    await votingReward.setBBO(bboAddress, {
      from: accounts[0]
    });

    await votingReward.setPayment(proxyAddressPayment,{
      from: accounts[0]
    });

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

  });

 

  it("set params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.addAdmin(accounts[0], true);
    await params.setVotingParams(100e18, 1000000e18, 60, 300e18, 24 * 60 * 60, 24 * 60 * 60,
      24 * 60 * 60, 10e18, 100e18, {
        from: accounts[0]
      });
    return true;
  });

  
  it("get params", async () => {
    let params = await BBParams.at(proxyAddressParams);
    let re = await params.getVotingParams({
        from: accounts[0]
      });
    ////console.log(re);
  });

  it("set setFreelancerParams", async () => {
    let params = await BBParams.at(proxyAddressParams);
    await params.setFreelancerParams( 24 * 60 * 60, {
        from: accounts[0]
      });
    return true;
  });

  it("get getFreelancerParams", async () => {
    let params = await BBParams.at(proxyAddressParams);
    let re = await params.getFreelancerParams({
        from: accounts[0]
      });
    ////console.log(re);
  });


  it("create job with dispute 2", async () => {
  
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var estimatedTime = 3 * 24 * 3600; // 3 days
    
    await job.createJob(jobHash4 + 'kk', expiredTime, estimatedTime, 500e18, 'banner', {
      from: userA
    });

    let bbo = await BBOTest.at(bboAddress);
    let xxx  = await bbo.balanceOf(userA, {
      from: userA
    });

    //console.log('bbo balance userA Beffore : ',  xxx );
    
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    var timeDone = 3 * 24 * 3600; // 3 days
    await bid.createBid(jobHash4 + 'kk', 400e18, timeDone, {
      from: userB
    });
    
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash4 + 'kk', userB, {
      from: userA
    });
   

    await job.startJob(jobHash4 + 'kk', {
      from: userB
    });
    await job.finishJob(jobHash4 + 'kk', {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4 + 'kk', {
      from: userA
    });

    let xxxy  = await bbo.balanceOf(userA, {
      from: userA
    });
    let xxxz  = await bbo.balanceOf(userB, {
      from: userB
    });

    //console.log('bbo balance userA Affter : ',  xxxy );
    //console.log('bbo balance userB Before : ',  xxxz );


  
    let voting = await BBPoll.at(proxyAddressPoll);
    let proofHash = 'proofHashxxkk';
    await bbo.approve(voting.address, 0, {
      from: userB
    });
   
    await bbo.approve(voting.address, Math.pow(2, 255), {
      from: userB
    });
    
    await voting.startPoll(jobHash4 + 'kk', proofHash, {
      from: userB
    });

    let xxxzk  = await bbo.balanceOf(userB, {
      from: userB
    });

    //console.log('bbo balance userB Affter : ',  xxxzk );

    // //return;
    // var userC = accounts[4];

    // let votingRight = await BBVoting.at(proxyAddressVoting);

    // await bbo.approve(votingRight.address, 0, {
    //   from: userC
    // });
    // await bbo.approve(votingRight.address, Math.pow(2, 255), {
    //   from: userC
    // });

    // await votingRight.requestVotingRights(200e18, {
    //   from: userC
    // });

  });

  it("fast forward to 24h * 10 after start poll", function () {
    var fastForwardTime = 10 * 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

 

  it("finalizePoll", async () => {
    try {
     
      var userB = accounts[2];

      let votingRight = await BBPoll.at(proxyAddressPoll);

      let info_ = await votingRight.getPoll(jobHash4+'kk', {
        from: userB
      });
      //console.log(JSON.stringify( info_ ));
    
    
    //claimReward
    await votingRight.finalizePoll(jobHash4+'kk', {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    let xxx  = await bbo.balanceOf(userB, {
      from: userB
    });

    //console.log('bbo balance userB : ',  xxx );
    //console.log('OKKKKKKKKKKK');

    return true;
  } catch(e) {
    //console.log('LOIiiiiiiiiiiiiiiiiiiiii');
    //console.log(e);
    return false;
  }
    
  });
});
