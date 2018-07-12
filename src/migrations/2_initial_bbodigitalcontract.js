const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");


module.exports = function(deployer) {
   var storageaddress;
   var storageinstance;
   var dinstance;
   return BBStorage.new().then(function(storage){
   	 storageaddress = storage.address;
       storageinstance = storage;
   	 return DigitalContract.new();
   }).then(function(instance){
   	console.log('storage address', storageaddress)
      console.log('digital address', instance.address)
      dinstance = instance;
   	return instance.setStorage(storageaddress);
   }).then(function(rs){
      return storageinstance.addAdmin(dinstance.address);
   
   }).then(function(rs){
      return ProxyFactory.new();
   }).then(function(proxyFactory){
      console.log('proxyFactory ', proxyFactory.address);
      return proxyFactory.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', dinstance.address);
     
   }).then(function(logs){
      const proxyAddress = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddress', proxyAddress)


      process.exit(1);
   }).catch(function(err){
      console.log(err);
       process.exit(1);
   });
};
