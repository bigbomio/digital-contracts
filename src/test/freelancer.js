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


var contractAddr = '';
var jobHash = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr';
var jobHashWilcancel = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr2';
var jobHash3 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr3';
var jobHash4 = 'QmSn1wGTpz6SeQr3QypbPEFn3YjBzGsvtPPVRaqG9Pjfjr4';

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
var bboAddress = '';
var storageAddress = '';
contract('BBFreelancer Test', async (accounts) => {

  it("initialize contract", async () => {

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

    // set admin to storage
    await storage.addAdmin(proxyAddressJob, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressBid, {
      from: accounts[0]
    });
    await storage.addAdmin(proxyAddressPayment, {
      from: accounts[0]
    });
    await storage.addAdmin(accounts[7], {
      from: accounts[0]
    });


    let bbo = await BBOTest.at(bboAddress);
    await bbo.transfer(accounts[1], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[2], 1000e18, {
      from: accounts[0]
    });
    await bbo.transfer(accounts[3], 1000e18, {
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

    await bid.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });
    await job.setPaymentContract(proxyAddressPayment, {
      from: accounts[0]
    });

  });
  it("create new job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    var jobLogtop = await job.createJob(jobHash, expiredTime, timeBid, 500e18, 'top', {
      from: userA
    });
    var jobLogbt = await job.createJob(jobHash + 'bottom', expiredTime, timeBid, 400e18, 'bottom', {
      from: userA
    });

    var jobLog = await job.createJob(jobHash + 'dddd', expiredTime, timeBid, 333e18, 'banner', {
      from: userA
    });

    await job.createJob(jobHash + 'topp', expiredTime, timeBid, 500e18, 'topp', {
      from: userB
    });

    // //console.log(jobLogtop.logs);
    // //console.log(jobLogbt.logs);
    // //console.log(jobLog.logs);
    //console.log('job.address : ' + job.address);
    //console.log('owner.address : ' + userA);
    var myContract = await new web3.eth.Contract(job.abi, job.address, {
      from: userA, // default from address
      gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
    // //console.log(job.abi);
    // //console.log(myContract);
    var key0 = web3.utils.toHex('banner');
    var key1 = web3.utils.toHex('bottom');

    try {
      await myContract.getPastEvents('JobCreated', {
        filter: {
          category: [key0, key1],
          owner: userA
        }, // filter by owner, category
        fromBlock: 0, // should use recent number
        toBlock: 'latest'
      }, function (error, events) {
        //TODO
        if (error) {
          //console.log('error filter');
          //console.log(error);
        }
        // //console.log(JSON.stringify( events)); 
      }).then(function (events) {
        //console.log(events) // same results as the optional callback above
      });



    } catch (e) {
      //console.log(e);
    }

    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobCreated').args

    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash + 'dddd', web3.utils.hexToUtf8(jobHashRs));
  });

  it("[Fail] create new job with long category", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    var longCa = '';
    for (var i = 0; i < 33; i++) {
      longCa += 'a';
    }
    //console.log('longCa : ' + longCa);
    try {
      var jobLog = await job.createJob(jobHash + '21', expiredTime, timeBid, 500e18, longCa, {
        from: userA
      });
      //console.log('Can create new job with long category');
      return false;
    } catch (e) {
      //console.log('Can not create new job with long category');
      return true;
    }

  });

  it("[Fail] create new job with exist jobHash", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days

    try {
      var jobLog = await job.createJob(jobHash, expiredTime, timeBid, 500e18, 'banner', {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  it("[Fail] create new job with budget =0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    3 //days
    try {
      var jobLog = await job.createJob(jobHash + '0', expiredTime, timeBid, 0, 'banner', {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  it("[Fail] create new job with expired < now ", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) - 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    try {
      var jobLog = await job.createJob(jobHash + '1', expiredTime, timeBid, 500e18, 'banner', {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });
  //TranTho
  it("[Fail] create new job with budget < 0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    3 //days
    try {
      var jobLog = await job.createJob(jobHash + 'x', expiredTime, timeBid, -1, 'banner', {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] create new job with time progess = 0", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 0; //8 days

    try {
      var jobLog = await job.createJob(jobHash + 'xk', expiredTime, timeBid, 100e18, 'banner', {
        from: userA
      });
      ////console.log('createJob OK');
      return false;
    } catch (e) {
      ////console.log(e);
      ////console.log('createJob FALSE');
      return true;
    }

  });


  it("[Fail] start job without not bid", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; // 3 days

    try {
      var jobLog = await job.createJob(jobHash + 'z', expiredTime, timeBid, 500e18, 'banner', {
        from: userA
      });
      var jobLog1 = await job.startJob(jobHash + 'z', {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] bid > buget", async () => {
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600; //days

    try {
      var jobLog = await bid.createBid(jobHash, 501e18, timeDone, {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] get stograge ", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 0; //8 days

    try {
      var jobLog = await job.getStorage({
        from: userA
      });
      ////console.log("Stograge adress " + JSON.stringify(jobLog));
      return false;
    } catch (e) {
      ////console.log(e);
      ////console.log('Get Stograge adress FALSE');
      return true;
    }

  });

  it("[Fail] owner bid themself job", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    try {
      var jobLog = await bid.createBid(jobHash, 500e18, timeDone, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] not owner cancel job", async () => {
    var userB = accounts[1];
    let job = await BBFreelancerJob.at(proxyAddressJob);
    try {
      await job.createJob(jobHashWilcancel, expiredTime, timeBid, 500e18, 'banner', {
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("Owner cancel job and refund BBO", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    let bbo = await BBOTest.at(bboAddress);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];
    var userD = accounts[3];


    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 8 * 24 * 3600; //8 days

    await job.createJob(jobHash + 'xkop', expiredTime, timeBid, 1000e18, 'banner', {
        from: userA
      });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    await bid.createBid(jobHash + 'xkop', 500e18, timeDone, {
      from: userB
    });

    await bid.createBid(jobHash + 'xkop', 600e18, timeDone, {
      from: userC
    });
    await bid.createBid(jobHash + 'xkop', 400e18, timeDone, {
      from: userD
    });

    let balancee = await getBalance(bbo, userA);
    console.log('balance BBO userA  before acceptBid :', balancee);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash + 'xkop', userB, {
      from: userA
    });
    let balancex = await getBalance(bbo, userA);
    console.log('balance BBO userA  after acceptBid UserB :', balancex);
    // Cancel Bid
    await bid.cancelBid(jobHash+'xkop', {
      from: userB
    });

    await bid.acceptBid(jobHash + 'xkop', userD, {
      from: userA
    });

    await bid.cancelBid(jobHash+'xkop', {
      from: userA
    });

    await bid.acceptBid(jobHash + 'xkop', userC, {
      from: userA
    });

    let balance = await getBalance(bbo, userA);
    console.log('balance BBO userA  after acceptBid UserC :', balance);

    await bid.acceptBid(jobHash + 'xkop', userD, {
      from: userA
    });

    let balancey = await getBalance(bbo, userA);
    console.log('balance BBO userA  after acceptBid UserD :', balancey);

    //Job ownwer cancel job
    await job.cancelJob(jobHash+'xkop', {
      from: userA
    });

    let balancen = await getBalance(bbo, userA);
    console.log('balance BBO userA  after cancelJob :', balancen);

  });


  it("cancel job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    await job.createJob(jobHashWilcancel, expiredTime, timeBid, 500e18, 'banner', {
      from: userA
    });
    var jobLog = await job.cancelJob(jobHashWilcancel, {
      from: userA
    });
    // const jobHashRs = jobLog.logs.find(l => l.event === 'JobCanceled').args.jobHash
    // ////console.log(jobLog.logs[0].blockNumber);
    // assert.equal(jobHashWilcancel, web3.utils.hexToUtf8(jobHashRs));

  });

  it("create bid", async () => {
    var userB = accounts[1];
    var userC = accounts[2];
    var userD = accounts[4];


    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1; //days
    ////console.log('adress bid ' + userB);
    var jobLog = await bid.createBid(jobHash, 400e18, timeDone, {
      from: userB
    });
    await bid.createBid(jobHash, 350e18, timeDone, {
      from: userC
    });
    await bid.createBid(jobHash, 370e18, timeDone, {
      from: userD
    });
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidCreated').args.jobHash
    //console.log('BidCreated ' + web3.utils.sha3(jobHash));
    //console.log(JSON.stringify(jobLog));
    assert.equal(web3.utils.sha3(jobHash), jobHashRs);

  });

  it("[Fail] Check function bid", async () => {
    var userB = accounts[2];
    var userA = accounts[0];
    var userC = accounts[3];

    let job = await BBFreelancerJob.at(proxyAddressJob);

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600; //3 days
    await job.createJob(jobHash + 'xv', expiredTime, timeBid, 500e18, 'banner', {
      from: userA
    });

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1 * 24 * 3600; //days

    await bid.createBid(jobHash + 'xv', 300e18, timeDone, {
      from: userB
    });

    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });



    await bid.acceptBid(jobHash + 'xv', userB, {
      from: userA
    });


    try {
      //  await bid.cancelBid(jobHash + 'xv', {
      //     from: userB
      //   });
      await bid.createBid(jobHash + 'xv', 300e18, timeDone, {
        from: userC
      });
      console.log('C Bid OK');
      return false;
    } catch (e) {
      console.log("C Bid FAIL");
      return true;
    }

  });

  // it("[Fail] Hirer cancel bid", async () => {
  //   var userB = accounts[2];
  //   var userA = accounts[0];
  //   let bid = await BBFreelancerBid.at(proxyAddressBid);
  //   var timeDone = 1 * 24 * 3600; //days

  //   await bid.createBid(jobHash, 300e18, timeDone, {
  //     from: userB
  //   });

  //   try {
  //     var jobLog = await bid.cancelBid(jobHash, {
  //       from: userA
  //     });
  //     ////console.log('Hirer can cancel bid ');
  //     return false;
  //   } catch (e) {
  //     ////console.log("Hirer can't cancel bid ");
  //     return true;
  //   }

  // });




  //   try {
  //      await bid.cancelBid(jobHash, {
  //       from: userC
  //     });
  //     console.log('Not owner can cancel bid ');
  //     return false;
  //   } catch (e) {
  //     console.log("Not owner can't cancel bid ");
  //     return true;
  //   }

  // });

  // it("cancel bid", async () => {
  //   var userB = accounts[2];
  //   let bid = await BBFreelancerBid.at(proxyAddressBid);
  //   var timeDone = 1 * 24 * 3600; //days

  //   await bid.createBid(jobHash, 300e18, timeDone, {
  //     from: userB
  //   });
  //   var jobLog = await bid.cancelBid(jobHash, {
  //     from: userB
  //   });
  //   ////console.log(jobLog.logs[0].blockNumber);
  //   const jobHashRs = jobLog.logs.find(l => l.event === 'BidCanceled').args.jobHash
  //   assert.equal(web3.utils.sha3(jobHash), jobHashRs);

  // });

  it("acceept bid userC", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });

    var jobLog = await bid.acceptBid(jobHash, accounts[2], {
      from: userA
    });
    console.log('freelancer :', accounts[2]);
    //console.log(JSON.stringify(jobLog.logs[0]));
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidAccepted').args.jobHash
    assert.equal(web3.utils.sha3(jobHash), jobHashRs);

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);

    let balancee = await getBalance(bbo, userA);
    console.log('balance payment userA affter :', balancee);


  });

  it("acceept bid userB", async () => {
    var userA = accounts[0];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    let bbo = await BBOTest.at(bboAddress);
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);

    let balancee = await getBalance(bbo, userA);
    console.log('balance payment userA affter :', balancee);

    let balancec = await getBalance(bbo, payment.address);
    console.log('balance payment affter:', balancec);

    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    var jobLog = await bid.acceptBid(jobHash, accounts[1], {
      from: userA
    });
    console.log('freelancer :', accounts[1]);
    //console.log(JSON.stringify(jobLog.logs[0]));
    const jobHashRs = jobLog.logs.find(l => l.event === 'BidAccepted').args.jobHash
    assert.equal(web3.utils.sha3(jobHash), jobHashRs);



    let balance = await getBalance(bbo, payment.address);
    console.log('balance payment before:', balance);

    let balanceex = await getBalance(bbo, userA);
    console.log('balance payment userA before :', balanceex);

  });

  async function getBalance(token, address) {
    return await token.balanceOf(address, {
      from: accounts[0]
    });
  }

  // it("Owner cancel bid", async () => {
  //   var userC = accounts[0];
  //   let bid = await BBFreelancerBid.at(proxyAddressBid);

  //   var jobLog = await bid.cancelBid(jobHash, {
  //     from: userC
  //   });
  //   ////console.log(jobLog.logs[0].blockNumber);
  //   const jobHashRs = jobLog.logs.find(l => l.event === 'BidCanceled').args.jobHash
  //   assert.equal(web3.utils.sha3(jobHash), jobHashRs);

  // });

  it("[Fail] UserD cancel job", async () => {
    var userB = accounts[1];
    var userD = accounts[4];
    let bid = await BBFreelancerBid.at(proxyAddressBid);

    try {

      await bid.cancelBid(jobHash, {
        from: userD
      });

      return false;
    } catch (e) {
      return true;
    }
  });

  it("[Fail] Not freelancer start working job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userD = accounts[4];
    try {
      var jobLog = await job.startJob(jobHash, {
        from: userD
      });
      return false;
    } catch (e) {
      return true;
    }
  });

  it("start working job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[1];
    var jobLog = await job.startJob(jobHash, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobStarted').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });

  it("[Fail] userC start working userB's job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];

    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 1 * 24 * 3600;

    //Hirer create job
    await job.createJob(jobHash + 'jx', expiredTime, timeBid, 100e18, 'banner', {
      from: userA
    });

    //UserB bid
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 1; //days
    await bid.createBid(jobHash + 'jx', 100e18, timeDone, {
      from: userB
    });

    //Hirer acept Bid
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash + 'jx', accounts[1], {
      from: userA
    });

    //UserB start Job
    try {
      var jobLog = await job.startJob(jobHash + 'jx', {
        from: userC
      });
      ////console.log("UserC CAN start working UserB'Job ");
      return false;

    } catch (e) {
      ////console.log("UserC CAN NOT start working UserB'Job ");
      return true;
    }
  });

  // it("[Fail] bid with job expired", async () => {
  //   let job = await BBFreelancerJob.at(proxyAddressJob);
  //   var userA = accounts[0];
  //   var userB = accounts[1];



  //   var expiredTime = parseInt(Date.now() / 1000) + 1; // expired after 7 days
  //   var timeBid = 1 * 24 * 3600;

  //   //Hirer create job
  //   await job.createJob(jobHash + 'jxcc', expiredTime, timeBid, 100e18, 'banner', {
  //     from: userA
  //   });

  //   //console.log("expiredTime " + expiredTime);

  //   //UserB bid
  //   setTimeout(async function () {
  //     //console.log('Now ' + parseInt(Date.now() / 1000));
  //     try {
  //       let bid = await BBFreelancerBid.at(proxyAddressBid);
  //       var timeDone = 1; //days
  //       await bid.createBid(jobHash + 'jxcc', 100e18, timeDone, {
  //         from: userB
  //       });

  //       //console.log("User can bid job expired");
  //       return false;

  //     } catch (e) {
  //       //console.log("User can not bid job expired ");
  //       return true;
  //     }

  //   }, 1200);

  // });

  it("[Fail] hirer accept 2 bid", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var userB = accounts[1];
    var userC = accounts[2];
    try {
      var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
      var timeBid = 1 * 24 * 3600;

      //Hirer create job
      await job.createJob(jobHash + 'jxc', expiredTime, timeBid, 100e18, 'banner', {
        from: userA
      });

      //UserB bid
      let bid = await BBFreelancerBid.at(proxyAddressBid);
      var timeDone = 1; //days
      await bid.createBid(jobHash + 'jxc', 100e18, timeDone, {
        from: userB
      });

      //UserC bid
      var timeDone = 1; //days
      await bid.createBid(jobHash + 'jxc', 100e18, timeDone, {
        from: userC
      });

      //Hirer acept Bid user B
      let bbo = await BBOTest.at(bboAddress);
      await bbo.approve(bid.address, 0, {
        from: userA
      });
      await bbo.approve(bid.address, Math.pow(2, 255), {
        from: userA
      });
      await bid.acceptBid(jobHash + 'jxc', userB, {
        from: userA
      });

      //Hirer acept Bid user C

      await bid.acceptBid(jobHash + 'jxc', userC, {
        from: userC
      });
      ////console.log("Hirer CAN accept UserC bid ");
      return false;

    } catch (e) {
      ////console.log("Hirer CAN NOT  accept  UserC bid ");
      return true;
    }
  });


  it("[Fail] cancel job when freelancer don't work", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobHash, {
        from: userA
      });
      ////console.log(JSON.stringify(jobLog));
      // //console.log("cancel job True");
      return false;
    } catch (e) {
      ////console.log("cancel job False xxxxxxxxxxxxxxxxxxxx ");

      return true;
    }

  });

  it("[Fail] not freelancer of this job finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[2];
    try {
      var jobLog = await job.finishJob(jobHash, {
        from: userB
      });
      ////console.log("user C finsh job  user B True");
      return false;
    } catch (e) {
      // //console.log("user C finsh job  user B False");

      return true;
    }

  });

  it("[Fail] Hirer finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[0];
    try {
      var jobLog = await job.finishJob(jobHash, {
        from: userB
      });
      ////console.log("Hirer finsh job  user B True");
      return false;
    } catch (e) {
      ////console.log("Hirer finsh job  user B False");

      return true;
    }

  });

  it("finish job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userB = accounts[1];
    var jobLog = await job.finishJob(jobHash, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'JobFinished').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });

  // it("get payment from job", async () => {
  //   let job = await BBFreelancerJob.at(proxyAddressJob);
  //   var userA = accounts[0];
  //   let res =  await job.getPaymentContract( {
  //     from: userA
  //   });    
  // });

  it("[Fail] cancel job after finish job", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobHash, {
        from: userA
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("reject payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var jobLog = await payment.rejectPayment(jobHash, {
      from: userA
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentRejected').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });
  it("check payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var rs = await payment.checkPayment(jobHash, {
      from: userA
    });
    return true;
  });
  it("[Fail] cancel job after reject payment", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobHash, {
        from: userA
      });
      ////console.log('reject payment OK');
      return false;
    } catch (e) {
      ////console.log('reject payment FALSE');
      return true;
    }

  });


  it("acceept payment", async () => {
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var userA = accounts[0];
    var jobLog = await payment.acceptPayment(jobHash, {
      from: userA
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentAccepted').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash, web3.utils.hexToUtf8(jobHashRs));
  });

  it("[Fail] userB get userA's payment ", async () => {

    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var userB = accounts[1];
    try {
      var jobLog = await bid.getPaymentContract({
        from: userB
      });
      return false;
    } catch (e) {
      return true;
    }

  });

  it("[Fail] cancel job after acceept payment", async () => {

    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    try {
      var jobLog = await job.cancelJob(jobHash, {
        from: userA
      });
      ////console.log('acceept payment OK');
      return false;
    } catch (e) {
      // //console.log('acceept payment FALSE');
      return true;
    }

  });

  it("get job", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var jobLog = await job.getJob(jobHash);
    assert.equal(jobLog[0], accounts[0]);
  });
  it("set timeout payment", async () => {
    let storage = await BBStorage.at(storageAddress);
    await storage.setUint(web3.utils.sha3('PAYMENT_LIMIT_TIMESTAMP'), 24 * 3600, {
      from: accounts[7]
    });

    var rs = await storage.getUint(web3.utils.sha3('PAYMENT_LIMIT_TIMESTAMP'), {
      from: accounts[0]
    });
    assert.equal(rs, 24 * 3600);
  });
  it("start other job for claime payment", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    await job.createJob(jobHash3, expiredTime, timeBid, 500e18, 'banner', {
      from: userA
    });
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    await bid.createBid(jobHash3, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash3, userB, {
      from: userA
    });

    await job.startJob(jobHash3, {
      from: userB
    });
    await job.finishJob(jobHash3, {
      from: userB
    });

  });
  it("fast forward to 24h after locked", function () {
    var fastForwardTime = 24 * 3600 + 1;
    return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function () {
      return Helpers.sendPromise('evm_mine', []).then(function () {

      });
    });
  });

  it("[Fail] Hirer claime payment", async () => {
    var userA = accounts[0];

    try {

      let payment = await BBFreelancerPayment.at(proxyAddressPayment);
      var jobLog = await payment.claimePayment(jobHash3, {
        from: userA
      });

      ////console.log('Hirer CAN claime payment');
      return false;

    } catch (e) {
      ////console.log('Hirer CAN"T claime payment');
      return true;
    }


  });

  it("[Fail] UserC claime payment UserB'job", async () => {
    var userAC = accounts[1];

    try {

      let payment = await BBFreelancerPayment.at(proxyAddressPayment);
      var jobLog = await payment.claimePayment(jobHash3, {
        from: userC
      });

      // //console.log('UserC CAN claime payment');
      return false;

    } catch (e) {
      ////console.log('UserC CAN"T claime payment');
      return true;
    }


  });


  it("claime payment", async () => {
    var userB = accounts[2];

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.claimePayment(jobHash3, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'PaymentClaimed').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash3, web3.utils.hexToUtf8(jobHashRs));

  });

  it("start other job for finalize payment", async () => {
    let job = await BBFreelancerJob.at(proxyAddressJob);
    var userA = accounts[0];
    var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
    var timeBid = 3 * 24 * 3600;
    //days
    await job.createJob(jobHash4, expiredTime, timeBid, 500e18, 'banner', {
      from: userA
    });
    var userB = accounts[2];
    let bid = await BBFreelancerBid.at(proxyAddressBid);
    var timeDone = 3 * 24 * 3600;
    //days
    await bid.createBid(jobHash4, 400e18, timeDone, {
      from: userB
    });
    let bbo = await BBOTest.at(bboAddress);
    await bbo.approve(bid.address, 0, {
      from: userA
    });
    await bbo.approve(bid.address, Math.pow(2, 255), {
      from: userA
    });
    await bid.acceptBid(jobHash4, userB, {
      from: userA
    });

    await job.startJob(jobHash4, {
      from: userB
    });
    await job.finishJob(jobHash4, {
      from: userB
    });
    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    await payment.rejectPayment(jobHash4, {
      from: userA
    });

    // set the dispute winner 
    let bbs = await BBStorage.at(storageAddress);
    await bbs.addAdmin(userA, {
      from: userA
    });
    await bbs.setAddress(web3.utils.sha3(jobHash4 + 'DISPUTE_WINNER'), userB, {
      from: userA
    });
    let u = await bbs.getAddress(web3.utils.sha3(jobHash4 + 'DISPUTE_WINNER'));
    assert.equal(userB, u);
  });
  it("finalize payment", async () => {
    var userB = accounts[2];

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.finalizeDispute(jobHash4, {
      from: userB
    });
    const jobHashRs1 = jobLog.logs.find(l => l.event === 'DisputeFinalized').args
    ////console.log(jobLog.logs[0].blockNumber);
    const jobHashRs = jobHashRs1.jobHash
    assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    assert.equal(userB, jobHashRs1.winner);

  });

  it("withdrawTokens", async () => {
    var userA = accounts[0];
    let bbo = await BBOTest.at(bboAddress);

    console.log('bbo.address ', bbo.address);

    let payment = await BBFreelancerPayment.at(proxyAddressPayment);
    var jobLog = await payment.withdrawTokens(bbo.address, {
      from: userA
    });
    

  });

})