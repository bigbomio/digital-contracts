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
var proxyAddressVoting = '';
var proxyAddressPoll = '';
var proxyAddressParams = '';
var bboAddress = '';
var storageAddress = '';
contract('Voting Test', async (accounts) => {

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
        await storage.addAdmin(proxyAddressJob, {
            from: accounts[0]
        });
        await storage.addAdmin(proxyAddressBid, {
            from: accounts[0]
        });
        await storage.addAdmin(proxyAddressPayment, {
            from: accounts[0]
        });
        await storage.addAdmin(proxyAddressVoting, {
            from: accounts[0]
        });
        await storage.addAdmin(proxyAddressPoll, {
            from: accounts[0]
        });
        await storage.addAdmin(proxyAddressParams, {
            from: accounts[0]
        });

        await storage.addAdmin(accounts[7], {
            from: accounts[0]
        });

        //console.log('done storage')
        let bbo = await BBOTest.at(bboAddress);
        await bbo.transfer(accounts[1], 10000e18, {
            from: accounts[0]
        });
        await bbo.transfer(accounts[2], 10000e18, {
            from: accounts[0]
        });
        await bbo.transfer(accounts[3], 10000e18, {
            from: accounts[0]
        });
        await bbo.transfer(accounts[4], 10000e18, {
            from: accounts[0]
        });
        await bbo.transfer(accounts[5], 10000e18, {
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

        await bid.setPaymentContract(proxyAddressPayment, {
            from: accounts[0]
        });

    });
    it("[Fail] start voting poll without dispute", async () => {
        let job = await BBFreelancerJob.at(proxyAddressJob);
        var userA = accounts[0];
        var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
        var estimatedTime = 3 * 24 * 3600; // 3 days
        //Create Job
        await job.createJob(jobHash4 + 'd', expiredTime, estimatedTime, 500e18, 'banner', {
            from: userA
        });
        //Bid Job
        var userB = accounts[2];
        let bid = await BBFreelancerBid.at(proxyAddressBid);
        var timeDone = 3 * 24 * 3600; // 3 days
        await bid.createBid(jobHash4 + 'd', 400e18, timeDone, {
            from: userB
        });

        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(bid.address, 0, {
            from: userA
        });
        await bbo.approve(bid.address, Math.pow(2, 255), {
            from: userA
        });
        await bid.acceptBid(jobHash4 + 'd', userB, {
            from: userA
        });

        await job.startJob(jobHash4 + 'd', {
            from: userB
        });
        await job.finishJob(jobHash4 + 'd', {
            from: userB
        });

        //Create poll 
        try {
            let voting = await BBPoll.at(proxyAddressPoll);
            let proofHash = 'proofHashc';
            let l = await voting.startPoll(jobHash4 + 'd', proofHash, {
                from: userB
            });

            //console.log('create poll ok');
            return false;

        } catch (e) {
            //console.log('create poll false');
            return true;

        }

    });


    it("start other job for dispute voting", async () => {
        let job = await BBFreelancerJob.at(proxyAddressJob);
        var userA = accounts[0];
        var expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
        var estimatedTime = 3 * 24 * 3600; // 3 days

        await job.createJob(jobHash4, expiredTime, estimatedTime, 500e18, 'banner', {
            from: userA
        });
        var userB = accounts[2];
        let bid = await BBFreelancerBid.at(proxyAddressBid);

        var timeDone = 3 * 24 * 3600; // 3 days
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

    });
    it("set params", async () => {
        let params = await BBParams.at(proxyAddressParams);
        await params.setVotingParams(100e18, 1000000e18, 60, 100e18, 24 * 60 * 60, 24 * 60 * 60,
            24 * 60 * 60, 10e18, 100e18, {
                from: accounts[0]
            });
        return true;
    });
    it("[Fail] set params MinVotes > MaxVotes", async () => {
        let params = await BBParams.at(proxyAddressParams);
        try {
            await params.setVotingParams(100e18, 10e18, 60, 100e18, 24 * 60 * 60, 24 * 60 * 60,
                24 * 60 * 60, 10e18, 100e18, {
                    from: accounts[0]
                });
            //console.log('set params MinVotes > MaxVotes TRUE');
            return false;

        } catch (e) {
            //console.log('set params MinVotes > MaxVotes FALSE');
            return true;
        }

    });
    it("[Fail] UserC start poll", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHash';
        var userB = accounts[3];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userB
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userB
        });
        try {
            await voting.startPoll(jobHash4, proofHash, {
                from: userB
            });
            //console.log('UserC can start poll');
            return false;
        } catch (e) {
            //console.log('UserC cann"t start poll');

            return true;
        }

    });
    it("start poll", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHash';
        var userB = accounts[2];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userB
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userB
        });
        let l = await voting.startPoll(jobHash4, proofHash, {
            from: userB
        });
        const jobHashRs = l.logs.find(l => l.event === 'PollStarted').args.jobHash
        assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    });
    it("against poll", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHashAgainst';
        var userA = accounts[0];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userA
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userA
        });
        let l = await voting.againstPoll(jobHash4, proofHash, {
            from: userA
        });
        const jobHashRs = l.logs.find(l => l.event === 'PollAgainsted').args.jobHash
        assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    });
    it("[Fail] Owner against poll", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHashAgainst';
        var userA = accounts[2];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userA
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userA
        });
        try {
            let l = await voting.againstPoll(jobHash4, proofHash, {
                from: userA
            });
            //console.log('Owner can against poll');
            return false;

        } catch (e) {
            //console.log('Owner can not against poll');

            return true;
        }


    });
    it("[Fail] against poll with invalid jobHash", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHashAgainst';
        var userA = accounts[0];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userA
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userA
        });
        try {
            let l = await voting.againstPoll(jobHash4 + 'okko', proofHash, {
                from: userA
            });

            //console.log('against poll with invalid jobHash TRUE');

            return false;

        } catch (e) {
            //console.log('against poll with invalid jobHash FALSE');

            return true;
        }

    });

    it("against poll", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        let proofHash = 'proofHashAgainst';
        var userA = accounts[0];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userA
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userA
        });
        let l = await voting.againstPoll(jobHash4, proofHash, {
            from: userA
        });
        const jobHashRs = l.logs.find(l => l.event === 'PollAgainsted').args.jobHash
        assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    });
    it("reqest voting rights", async () => {
        let voting = await BBVoting.at(proxyAddressVoting);
        var userC = accounts[1];
        let bbo = await BBOTest.at(bboAddress);
        await bbo.approve(voting.address, 0, {
            from: userC
        });
        await bbo.approve(voting.address, Math.pow(2, 255), {
            from: userC
        });
        let l = await voting.requestVotingRights(200e18, {
            from: userC
        });
        const jobHashRs = l.logs.find(l => l.event === 'VotingRightsGranted').args.voter
        assert.equal(userC, jobHashRs);
    });
    it("fast forward to 24h after start poll", function() {
        var fastForwardTime = 24 * 3600 + 1;
        return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
            return Helpers.sendPromise('evm_mine', []).then(function() {
                //console.log('aaaaaaaaaaaaaaaa fast forward to 24h after start poll');

            });
        });
    });
    it("commit vote ", async () => {
        let voting = await BBVoting.at(proxyAddressVoting);
        var userC = accounts[1];
        var secretHash = web3.utils.soliditySha3(accounts[2], 123);
        let l = await voting.commitVote(jobHash4, secretHash, 200e18, {
            from: userC
        });
        const jobHashRs = l.logs.find(l => l.event === 'VoteCommitted').args.jobHash
        assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    });
    it("fast forward to 24h after commit vote poll", function() {
        var fastForwardTime = 24 * 3600 + 1;
        return Helpers.sendPromise('evm_increaseTime', [fastForwardTime]).then(function() {
            return Helpers.sendPromise('evm_mine', []).then(function() {

            });
        });
    });

    it("[Fail] reveal vote with missing address", async () => {
        let voting = await BBVoting.at(proxyAddressVoting);
        var userC = accounts[1];
        try {
            await voting.revealVote(jobHash4, accounts[3], 123, {
                from: userC
            });
            //console.log('reveal vote with missing address FALSE');
            return false;
        } catch (e) {
            //console.log('reveal vote with missing address FALSE');
            return true;
        }

    });
    it("[Fail] reveal vote with missing salt", async () => {
        let voting = await BBVoting.at(proxyAddressVoting);
        var userC = accounts[1];
        try {
            await voting.revealVote(jobHash4, accounts[2], 124, {
                from: userC
            });
            //console.log('reveal vote with missing salt FALSE');
            return false;
        } catch (e) {
            //console.log('reveal vote with missing salt FALSE');
            return true;
        }

    });

    it("reveal vote ", async () => {
        let voting = await BBVoting.at(proxyAddressVoting);
        var userC = accounts[1];
        var secretHash = web3.utils.sha3(accounts[2], 123);
        let l = await voting.revealVote(jobHash4, accounts[2], 123, {
            from: userC
        });
        const a = l.logs.find(l => l.event === 'VoteRevealed').args
        //console.log(a)
        const jobHashRs = a.jobHash
        assert.equal(jobHash4, web3.utils.hexToUtf8(jobHashRs));
    });
    it("read poll ", async () => {
        let voting = await BBPoll.at(proxyAddressPoll);
        var userC = accounts[1];
        let l = await voting.getPoll(jobHash4, {
            from: userC
        });
        //console.log(l);
    });
});