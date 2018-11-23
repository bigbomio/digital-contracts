const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 33){

 
    var proxyAddressJob = '0xb1e878028d0e3e47c803cbb9d1684d9d3d72a1b1'
    var proxyAddressBid = '0x7b388ecfec2f5f706aa34b540a39e8c434cfc8b4'
    var proxyAddressPayment = '0x253f112b946a72a008343d5bccd14e04288ca45c'

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
