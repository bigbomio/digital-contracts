const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = function(deployer) {

   if(deployer.network_id != 777){
      if(!DigitalContract.deployed()){
         var storageinstance ;
         var dinstance;
         var proxyFactory ;
         var proxyAddress;
         deployer.deploy(BBStorage).then(function(rs){
            storageinstance = rs;
            return deployer.deploy(DigitalContract);
         }).then(function(rs){
            dinstance = rs;
            return deployer.deploy(ProxyFactory);
         }).then(function(rs){
            proxyFactory = rs;
            return proxyFactory.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', dinstance.address);
         }).then(function(logs){
            proxyAddress = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy;
            console.log('proxyaddress', proxyAddress);
            return proxyAddress;
         }).then(function(proxyAddress){
            return storageinstance.addAdmin(proxyAddress);
         }).then(function(rs){
            return DigitalContract.at(proxyAddress).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
         }).then(function(rs){
            return DigitalContract.at(proxyAddress).setStorage(storageinstance.address);
         })
      }
   }  
};
