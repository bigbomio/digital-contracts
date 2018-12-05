const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBVotingHelper =  artifacts.require("BBVotingHelper");

module.exports = async function(deployer) {

  if(deployer.network_id == 3){

   
      // create bb contract
    
        return  deployer.deploy(BBDispute)
      .then(function(){
        return  deployer.deploy(BBVoting);
     }).then(function(){
        return  deployer.deploy(BBVotingHelper);
     });
   
     
     console.log('done');
   }  
};
