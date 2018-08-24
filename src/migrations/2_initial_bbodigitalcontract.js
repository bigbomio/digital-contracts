const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {
    
   console.log('LOG -> 2_initial_bbodigitalcontract : ' + deployer.network_id); 
   if(deployer.network_id != 777){
    console.log('CHECK -> DigitalContract.deployed()');
    var checkContract;
    try {
     checkContract = await DigitalContract.deployed();
    console.log('xxx : '+  checkContract);
    } catch (e) {
        console.log('12333333 ',e);
    }
      if(checkContract === false)
      {
        console.log('LOG ->alContract.deployed() 2');

         var storageinstance ;
         var dinstance;
         var proxyFactory ;
         var proxyAddress;
         deployer.deploy(BBStorage).then(function(rs){
             console.log('TASK => deployer BBStorage');
            storageinstance = rs;
            return deployer.deploy(DigitalContract);
         }).then(function(rs){
            console.log('TASK => deployer DigitalContract');

            dinstance = rs;
            return deployer.deploy(ProxyFactory);
         }).then(function(rs){
            console.log('TASK =>  createProxy');

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
