
const BBRating =  artifacts.require("BBRating");

const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){
    return deployer.then(async function(){
       var ratingProxy = '0xe177b6568e4a62f0b8ae3e145f222d411926034e'
   
        // create bb contract
       let rating = await BBRating.deployed();
      
       await AdminUpgradeabilityProxy.at(ratingProxy).upgradeTo(rating.address);
        return true;
       console.log('done');
    })
    
   }  
};
