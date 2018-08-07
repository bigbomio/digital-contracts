var Web3 = require('web3');
var ipfsAPI = require('ipfs-api')
var Helpers = require('./../helpers/helpers.js');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");


var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';

const files = [
  {
    path: 'README.md',
    content: 'text',
  }
]

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

var proxyAddressJob = '';
var proxyAddressBid = '';
var proxyAddressPayment = '';
var bboAddress = '';
contract('BBFreelancer Test', async (accounts) => {

  it("initialize contract", async () => {

     // var filesrs = await ipfs.files.add(files);
     // console.log('filesrs', filesrs);
     
     // jobHash = filesrs[0].hash;
     erc20 = await BBOTest.new({from:accounts[0]});
     bboAddress = erc20.address;
     console.log('jobHash', jobHash);
     // create storage
     console.log('bboAddress', bboAddress);
     let storage = await BBStorage.new({from: accounts[0]});
     console.log('storage address', storage.address);
     // create bb contract
     let jobInstance = await BBFreelancerJob.new({from: accounts[0]});
     let bidInstance = await BBFreelancerBid.new({from: accounts[0]});
     let paymentInstance = await BBFreelancerPayment.new({from: accounts[0]});
     // create proxyfactory
     let proxyFact = await ProxyFactory.new({from: accounts[0]});
     // create proxy to docsign
     const { logs } = await proxyFact.createProxy(accounts[8], jobInstance.address, {from: accounts[0]});
     proxyAddressJob = logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressJob', proxyAddressJob)
     
     const l2 = await proxyFact.createProxy(accounts[8], bidInstance.address, {from: accounts[0]});
     proxyAddressBid = l2.logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressBid', proxyAddressBid)
     
     const l3 = await proxyFact.createProxy(accounts[8], paymentInstance.address, {from: accounts[0]});
     proxyAddressPayment = l3.logs.find(l => l.event === 'ProxyCreated').args.proxy
     console.log('proxyAddressPayment', proxyAddressPayment)
     
       // set admin to storage
     await storage.addAdmin(proxyAddressJob, {from: accounts[0]} );
     await storage.addAdmin(proxyAddressBid, {from: accounts[0]} );
     await storage.addAdmin(proxyAddressPayment, {from: accounts[0]} );


     let bbo = await BBOTest.at(bboAddress);
     await bbo.transfer(accounts[1], 1000e18, {from:accounts[0]});
     await bbo.transfer(accounts[2], 1000e18, {from:accounts[0]});
     await bbo.transfer(accounts[3], 1000e18, {from:accounts[0]});
     console.log('bbo: ', bbo.address);

     let job = await BBFreelancerJob.at(proxyAddressJob);
     await job.transferOwnership(accounts[0], {from:accounts[0]});
     await job.setStorage(storage.address, {from:accounts[0]});
     await job.setBBO(bboAddress, {from:accounts[0]});

     let bid = await BBFreelancerBid.at(proxyAddressBid);
     await bid.transferOwnership(accounts[0], {from:accounts[0]});
     await bid.setStorage(storage.address, {from:accounts[0]});
     await bid.setBBO(bboAddress, {from:accounts[0]});

     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     await payment.transferOwnership(accounts[0], {from:accounts[0]});
     await payment.setStorage(storage.address, {from:accounts[0]});
     await payment.setBBO(bboAddress, {from:accounts[0]});

     await bid.setPaymentContract(proxyAddressPayment, {from:accounts[0]});
     
  });
  it("create new job", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var userA = accounts[0];
     var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
     var jobLog  = await job.createJob(jobHash, expiredTime, 500e18, 'banner', {from:userA});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobCreated').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs =jobHashRs1.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  it("cancel job", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var userA = accounts[0];
     var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
     await job.createJob(jobHashWilcancel, expiredTime, 500e18, 'banner', {from:userA});
     var jobLog  = await job.cancelJob(jobHashWilcancel, {from:userA});
     const jobHashRs = jobLog.logs.find(l => l.event === 'JobCanceled').args.jobHash
     //console.log(jobLog.logs[0].blockNumber);
     assert.equal(jobHashWilcancel, web3.utils.hexToUtf8(jobHashRs));

  });
  it("create bid", async () => {
    var userB = accounts[1];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var jobLog  = await bid.createBid(jobHash, 400e18, {from:userB});
    //console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidCreated').args.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));

  });
  it("cancel bid", async () => {
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    await bid.createBid(jobHash, 300e18, {from:userB});
    var jobLog  = await bid.cancelBid(jobHash, {from:userB});
    //console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidCanceled').args.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));

  });
  it("acceept bid", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {from:userA});
    await bbo.approve(bid.address, Math.pow(2, 255), {from:userA});
    var jobLog  = await bid.acceptBid(jobHash, accounts[1], {from:userA});
    //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobLog.logs.find(l => l.event === 'BidAccepted').args.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  it("start working job", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var userB = accounts[1];
     var jobLog  = await job.startJob(jobHash, {from:userB});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobStarted').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobHashRs1.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  it("finish job", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var userB = accounts[1];
     var jobLog  = await job.finishJob(jobHash, {from:userB});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobFinished').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobHashRs1.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  it("reject payment", async() => {
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     var userA = accounts[0];
     var jobLog  = await payment.rejectPayment(jobHash, {from:userA});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentRejected').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobHashRs1.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  
  
  it("acceept payment", async() => {
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     var userA = accounts[0];
     var jobLog  = await payment.acceptPayment(jobHash, {from:userA});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentAccepted').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobHashRs1.jobHash
     assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
   it("get job", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var jobLog  = await job.getJob(jobHash);
     
     assert.equal(jobLog[0], accounts[0]);
  });
   it("set timeout payment", async() => {
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
      await payment.setPaymentLimitTimestamp(24*3600, {from:accounts[0]});

      var rs= await payment.getPaymentLimitTimestamp( {from:accounts[0]});
     assert.equal(rs, 24*3600);
  });
   it("start other job for claime payment", async() => {
     let job = await BBFreelancerJob.at(proxyAddressJob);
     var userA = accounts[0];
     var expiredTime = parseInt(Date.now()/1000) + 7 * 24 * 3600; // expired after 7 days
     await job.createJob(jobHash3, expiredTime, 500e18, 'banner', {from:userA});
     var userB = accounts[2];
     let bid = await BBFreelancerBid.at(proxyAddressBid);
     await bid.createBid(jobHash3, 400e18, {from:userB});
     let bbo = await BBOTest.at(bboAddress);
     await bbo.approve(bid.address, 0, {from:userA});
     await bbo.approve(bid.address, Math.pow(2, 255), {from:userA});
     await bid.acceptBid(jobHash3, userB, {from:userA});

     await job.startJob(jobHash3, {from:userB});
     await job.finishJob(jobHash3, {from:userB});

  });
   it("fast forward to 24h after locked", function() {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise( 'evm_increaseTime', [fastForwardTime] ).then(function(){
        return Helpers.sendPromise( 'evm_mine', [] ).then(function(){

        });
    });
  });

   it("claime payment", async() => {
     var userB = accounts[2];
    
     let payment = await BBFreelancerPayment.at(proxyAddressPayment);
     var jobLog  = await payment.claimePayment(jobHash3, {from:userB});
     const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentClaimed').args
     //console.log(jobLog.logs[0].blockNumber);
     const jobHashRs = jobHashRs1.jobHash
     assert.equal(jobHash3, web3.utils.hexToUtf8(jobHashRs));

  });

})