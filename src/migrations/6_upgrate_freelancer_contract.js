const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

     proxyAddressJob = '0x62aa93f9dffec25daf9d2955d468194e996e8c87';
     proxyAddressBid = '0x0ff11890ef301dfd0fb37e423930b391836c69c9';
     proxyAddressPayment = '0x7b7e6f2b02a48bd24b5b1554fafff5f70547ab0a';
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
