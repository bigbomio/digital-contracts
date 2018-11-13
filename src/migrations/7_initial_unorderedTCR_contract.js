
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBTCRHelper =  artifacts.require("BBTCRHelper");
const BBVotingHelper =  artifacts.require("BBVotingHelper");
const BBUnOrderedTCR = artifacts.require("BBUnOrderedTCR");


var accounts;



module.exports = async function (deployer) {
  // await web3.eth.getAccounts(function (err, res) {
  //   accounts = res;
  //  // console.log('accounts:', accounts);

  // });
  console.log('deployer.network_id ', deployer.network_id);
  if (deployer.network_id == 3) {

    var admin = '0x83e5353fc26643c29b041a3b692c6335c97a9aed';
    var adminProxy = '0xa867a6a820928c64ffe3e30166481ec526d38bc5';
    var BBOAddress = '0x1d893910d30edc1281d97aecfe10aefeabe0c41b';
    var storage;
    var unorderTCRInstance;
    var TCRInstanceHelper;
    var proxyFact;
    var proxyAddressTCR;
    var proxyAddressTCRHelper;
    var unorderTCR;
    var TCRHelper;

    deployer.deploy(BBStorage).then(function (rs) {
      storage = rs;
      return deployer.deploy(ProxyFactory);
    }).then(function (rs) {
      console.log('deploy ProxyFactory done....')
      proxyFact = rs;
      console.log('begin deploy BBTCRHelper')
      return deployer.deploy(BBTCRHelper);
    }).then(function (rs) {
      console.log('deploy BBTCRHelper done....')
      TCRInstanceHelper = rs;
      console.log('begin deploy proxyAddressTCRHelper')
      return proxyFact.createProxy(adminProxy, TCRInstanceHelper.address);    
    }).then(function (logs) {
      proxyAddressTCRHelper = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressTCRHelper', proxyAddressTCRHelper)
      return BBTCRHelper.at(proxyAddressTCRHelper);
    }).then(function (rs) {
      TCRHelper = rs;
      console.log('TCRHelper address ',TCRHelper.address);
      console.log('TCRHelper transferOwnership ....')
      return TCRHelper.transferOwnership(admin)
    }).then(function (rs) {
      console.log('TCRHelper storage.address : ', storage.address);
      return TCRHelper.setStorage(storage.address)
    }).then(function (rs) {
      console.log('begin deploy BBUnOrderedTCR')
      return deployer.deploy(BBUnOrderedTCR);
    }).then(function (rs) {
      unorderTCRInstance = rs;
      console.log('unorderTCRInstance', unorderTCRInstance.address)
      return proxyFact.createProxy(adminProxy, unorderTCRInstance.address);
    }).then(function (logs) {
      proxyAddressTCR = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressTCR', proxyAddressTCR)
      return BBUnOrderedTCR.at(proxyAddressTCR);
    }).then(function (rs) {
      unorderTCR = rs;
      console.log('unorderTCR address ',unorderTCR.address);
      console.log('unorderTCR transferOwnership ....')
      return unorderTCR.transferOwnership(admin)
    }).then(function (rs) {
      console.log('unorderTCR storage.address : ', storage.address);
      return unorderTCR.setStorage(storage.address)
    }).then(function (rs) {
      console.log('unorderTCR setBBO ....')
      return unorderTCR.setBBO(BBOAddress)
    }).then(function (rs) {
      console.log('unorderTCR setTCRHelper ....')
      return unorderTCR.setTCRHelper(proxyAddressTCRHelper)
    }).then(function(rs){
      console.log('storage.addAdmin(proxyAddressTCR')
      return storage.addAdmin(proxyAddressTCR, true)
    }).then(function(rs){
      console.log('storage.addAdmin(proxyAddressTCRHelper')
      return storage.addAdmin(proxyAddressTCRHelper, true)
    }).then(function(rs){
      console.log('TCRHelper set param')
      return TCRHelper.setParamsUnOrdered(10, 24 * 60 * 60, 24 * 60 * 60 * 2, 24 * 60 * 60, 1000e18,  100000, 24 * 60 * 60);
    });
  }
};