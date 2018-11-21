const BBFreelancerJob = artifacts.require("BBFreelancerJob");
const BBFreelancerBid = artifacts.require("BBFreelancerBid");
const BBFreelancerPayment = artifacts.require("BBFreelancerPayment");
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBOTest = artifacts.require("BBOTest");



module.exports = function (deployer) {

  console.log('deployer.network_id ', deployer.network_id);
  if (deployer.network_id == 3) {

    var admin = '0xb10ca39dfa4903ae057e8c26e39377cfb4989551';
    var adminProxy = '0xf76fca3604e2005fe59bd59bdf97075f631fd2bc';
    var BBOAddress = '0x1d893910d30edc1281d97aecfe10aefeabe0c41b';
    var storage;
    var jobInstance;
    var bidInstance;
    var paymentInstance;
    var proxyFact;
    var proxyAddressJob;
    var proxyAddressBid;
    var proxyAddressPayment;
    var job;
    var bid;
    var payment;

    // return deployer.deploy(BBOTest).then(function(rs) {
    //  // BBOAddress = rs.address;
    //   console.log('BBOAddress', BBOAddress);
    return deployer.deploy(BBStorage).then(function (rs) {
      storage = rs;
      return deployer.deploy(BBFreelancerJob);
    }).then(function (rs) {
      jobInstance = rs;
      return deployer.deploy(BBFreelancerBid);
    }).then(function (rs) {
      bidInstance = rs;
      return deployer.deploy(BBFreelancerPayment);
    }).then(function (rs) {
      paymentInstance = rs;
      return deployer.deploy(ProxyFactory);
    }).then(function (rs) {
      proxyFact = rs;
      return proxyFact.createProxy(adminProxy, jobInstance.address);
    }).then(function (rs) {
      proxyAddressJob = rs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressJob', proxyAddressJob)
      return proxyFact.createProxy(adminProxy, bidInstance.address);
    }).then(function (rs) {
      proxyAddressBid = rs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressBid', proxyAddressBid)
      return proxyFact.createProxy(adminProxy, paymentInstance.address);
    }).then(function (rs) {
      proxyAddressPayment = rs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressPayment', proxyAddressPayment)
      return storage.addAdmin(proxyAddressJob, true);
    }).then(function (rs) {
      console.log('storage addAdmin proxyAddressJob Done');
      return storage.addAdmin(proxyAddressBid, true);
    }).then(function (rs) {
      console.log('storage addAdmin proxyAddressBid Done');
      return storage.addAdmin(proxyAddressPayment, true);
    }).then(function (rs) {
      console.log('storage addAdmin proxyAddressPayment Done');
      return BBFreelancerJob.at(proxyAddressJob);
    }).then(function (rs) {
      job = rs;
      console.log('job transferOwnership ....')
      return job.transferOwnership(admin)
    }).then(function (rs) {
      console.log('job storage.address : ', storage.address);
      return job.setStorage(storage.address)
    }).then(function (rs) {
      console.log('job setBBO ....')
      return job.setBBO(BBOAddress)
    }).then(function (rs) {
      return BBFreelancerBid.at(proxyAddressBid)
    }).then(function (rs) {
      bid = rs;
      console.log('bid transferOwnership ....')
      return bid.transferOwnership(admin)
    }).then(function (rs) {
      console.log('bid storage.address : ', storage.address);
      return bid.setStorage(storage.address)
    }).then(function (rs) {
      console.log('bid setBBO ....')
      return bid.setBBO(BBOAddress)
    }).then(function(rs){
      return BBFreelancerPayment.at(proxyAddressPayment);
    }).then(function (rs) {
      payment = rs;
      console.log('payment transferOwnership ....')
      return payment.transferOwnership(admin)
    }).then(function (rs) {
      console.log('payment storage.address : ', storage.address);
      return payment.setStorage(storage.address)
    }).then(function (rs) {
      console.log('payment setBBO ....')
      return payment.setBBO(BBOAddress)
    }).then(function (rs) {
      console.log('bid setPaymentContract ....')
      return bid.setPaymentContract(proxyAddressPayment)
    }).then(function(rs){
      console.log('Done')
    })
  }
};