const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
module.exports = async function(deployer) {

   if(deployer.network_id == 3){

   
      // create bb contract
     deployer.deploy(BBParams).then(function(){
        return  deployer.deploy(BBDispute);
     }).then(function(){
        return  deployer.deploy(BBVoting);
     });
   
     
     console.log('done');
   }  
};
