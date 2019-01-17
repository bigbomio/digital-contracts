const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBVotingHelper =  artifacts.require("BBVotingHelper");


const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 33){

     var disputeProxy = '0x2b44a5589e8b3cd106a7542d4af9c5eb0016ef6e'
     var votingProxy = '0xc7252214d78b15f37b94ae73027419a9f275c36f'
     var votingHelperProxy = '0x771911025b4eafb6395042b7dca728b275e5d8c0'

      // create bb contract
     let dispute = await BBDispute.deployed();
     let voting = await BBVoting.deployed();
     let votingHelper = await BBVotingHelper.deployed();

     await AdminUpgradeabilityProxy.at(disputeProxy).upgradeTo(dispute.address);
     await AdminUpgradeabilityProxy.at(votingProxy).upgradeTo(voting.address);
     await AdminUpgradeabilityProxy.at(votingHelperProxy).upgradeTo(votingHelper.address);
     return true;
     console.log('done');
   }  
};
