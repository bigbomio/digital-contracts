
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
var BBExpertHash = artifacts.require("./BBExpertHash.sol");

module.exports = function (deployer) {
    if (deployer.network_id == 4) {

        var admin = '0x83e5353fc26643c29b041a3b692c6335c97a9aed';
        var adminProxy = '0xA867a6a820928C64FfE3e30166481Ec526D38BC5';
        var storage;
        var proxyFact;
        var proxyBBExpertHash;
        var expertHashInstance;
        var expertHash;

        deployer.deploy(BBStorage).then(function (rs) {
            storage = rs;
            return deployer.deploy(ProxyFactory);
          }).then(function (rs) {
            console.log('deploy ProxyFactory done....')
            proxyFact = rs;
            console.log('begin deploy BBExpertHash')
            return deployer.deploy(BBExpertHash);
          }).then(function (rs) {
            console.log('deploy BBExpertHash done....')
            expertHashInstance = rs;
            console.log('begin deploy proxyBBExpertHash')
            return proxyFact.createProxy(adminProxy, expertHashInstance.address);    
          }).then(function (logs) {
            proxyBBExpertHash = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
            console.log('proxyBBExpertHash', proxyBBExpertHash)
            return BBExpertHash.at(proxyBBExpertHash);
          }).then(function (rs) {
            expertHash = rs;
            console.log('BBExpertHash address ',expertHash.address);
            console.log('BBExpertHash transferOwnership ....')
            return expertHash.transferOwnership(admin)
          }).then(function (rs) {
            console.log('expertHash storage.address : ', storage.address);
            return expertHash.setStorage(storage.address)
          }).then(function(rs){
            console.log('storage addAdmin(proxyBBExpertHash')
            return storage.addAdmin(proxyBBExpertHash, true)
          });

    }

};