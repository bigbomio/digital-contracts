const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

     proxyAddressJob = '0x1900fa17bbe8221873a126bd9e5eb9d0709379ec';
     proxyAddressBid = '0x39abc4386a817b5d8a4b008e022b446637e2a1eb';
     proxyAddressPayment = '0x5c6e2663ca0481156a63c7c8ca0372c3efa0471f';
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
