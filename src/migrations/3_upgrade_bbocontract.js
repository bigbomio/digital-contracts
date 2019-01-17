const DigitalContract =  artifacts.require("BigbomDigitalContract");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = function(deployer) {
   if(deployer.network_id == 33){
     if(DigitalContract.deployed()){

   		var proxyAddress = '0x8f4d25f6f41568461167d62d0dd96f55ecdba58c';
   		if(deployer.network_id == 3){
   			proxyAddress = '0x78ffdca617a1183d01e1a508366a1a9bbba64ecb';
   		}
	   deployer.deploy(DigitalContract).then(function(rs){
	      return AdminUpgradeabilityProxy.at(proxyAddress).upgradeTo(rs.address);
	   }).then(function(rs){
	      return AdminUpgradeabilityProxy.at(proxyAddress).implementation();
	   }).then(function(rs){
	      console.log('proxy implementation: ', rs);
	   });
     }
	}
};

  