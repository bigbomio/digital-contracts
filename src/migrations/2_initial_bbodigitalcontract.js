const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");


module.exports = function(deployer) {
   var storageaddress;
   var storageinstance;
   var dinstance;
   var proxyaddress;
   
   return BBStorage.new().then(function(storage){
   	 storageaddress = storage.address;
       storageinstance = storage;
   	 return DigitalContract.new();
   }).then(function(instance){
   	console.log('storage address', storageaddress)
      console.log('digital address', instance.address)
      dinstance = instance;
   	
      return ProxyFactory.new();
   }).then(function(proxyFactory){
      console.log('proxyFactory ', proxyFactory.address);
      return proxyFactory.createProxy('0xf76fca3604e2005fe59bd59bdf97075f631fd2bc', dinstance.address);
     
   }).then(function(logs){
      const proxyAddress = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      
      return proxyAddress;
   })
   .then(function(proxyAddress){
      proxyaddress = proxyAddress;
      return storageinstance.addAdmin(proxyAddress);
     
   }).then(function(){
      return DigitalContract.at(proxyaddress).transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551');
   }).then(function(rs){
      console.log('re', rs.logs[0].args)
      console.log('proxyAddress', proxyaddress)
      return DigitalContract.at(proxyaddress).setStorage(storageaddress);
   }).then(function(rs){
       console.log('Set admin storage to the Proxy done ' , rs.logs)
       process.exit(1);
  
   }).catch(function(err){
      console.log(err);
       process.exit(1);
   });
};
