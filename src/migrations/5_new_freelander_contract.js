const BBFreelancerJob =  artifacts.require("BBFreelancerJob");
const BBFreelancerBid =  artifacts.require("BBFreelancerBid");
const BBFreelancerPayment =  artifacts.require("BBFreelancerPayment");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

   
      // create bb contract
     // deployer.deploy(BBFreelancerJob).then(function(){
     //    return  deployer.deploy(BBFreelancerBid);
     // }).then(function(){
        return  deployer.deploy(BBFreelancerPayment);
    // });
   
     
     console.log('done');
   }  
};
