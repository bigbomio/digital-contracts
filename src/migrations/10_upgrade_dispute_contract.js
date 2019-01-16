const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBVotingHelper =  artifacts.require("BBVotingHelper");


const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

     var disputeProxy = '0xd3471fd83e7f17f5b39792ed35ded27582fc11f6'
     var votingProxy = '0x13d149ff5b9bdac07ddc776f7baf5ac7daa83510'
     var votingHelperProxy = '0x457b7c89bac3e5bd35db5f80cf78cab7ad1207b5'

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
