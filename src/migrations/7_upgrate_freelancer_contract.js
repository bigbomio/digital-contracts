const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 33){

 
     var proxyAddressJob = '0x0c31cb2173d03321f2f167328333eaf2e4d13a8e'
     var proxyAddressBid = '0x086f13456f962f0363a1c684b3ae3329d3b2676f'
     var proxyAddressPayment = '0xf5cf17e2059b78ca9012475309c296c4e6c8a79c'
      // create bb contract
      let jobInstance = await BBFreelancerJob.deployed();
      let bidInstance = await BBFreelancerBid.deployed();
      let paymentInstance = await BBFreelancerPayment.deployed();

     await AdminUpgradeabilityProxy.at(proxyAddressJob).upgradeTo(jobInstance.address);
     await AdminUpgradeabilityProxy.at(proxyAddressBid).upgradeTo(bidInstance.address);
     await AdminUpgradeabilityProxy.at(proxyAddressPayment).upgradeTo(paymentInstance.address);

     
     console.log('done');
   }  
};
