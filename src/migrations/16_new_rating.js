
const BBRating =  artifacts.require("BBRating");

module.exports = async function(deployer) {

  if(deployer.network_id == 3){

   
      // create bb contract
    
        return  deployer.deploy(BBRating);
     
   
     
     console.log('done');
   }  
};
