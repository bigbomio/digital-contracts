const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBVotingHelper =  artifacts.require("BBVotingHelper");


const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


module.exports = async function(deployer) {

   if(deployer.network_id == 3){

     proxyAddressParams = '0x8a8283e505d74e9bd2837e0cd02eefb805342546';
     proxyAddressDispute = '0xaf0a5a41103ab33c8ece6c81360339b0650bdf6c';
     proxyAddressVoting = '0x0f8821e2aa2ed8d97f03091caac249a371759906';
     proxyAddressVotingHelper = '0xf013557b366e6a96dbcdef7fc4e2743beafcbb9e';
      // create bb contract
     let params = await BBParams.deployed();
     let dispute = await BBDispute.deployed();
     let voting = await BBVoting.deployed();
     let votingHelper = await BBVotingHelper.deployed();

     await AdminUpgradeabilityProxy.at(proxyAddressParams).upgradeTo(params.address);
     await AdminUpgradeabilityProxy.at(proxyAddressDispute).upgradeTo(dispute.address);
     await AdminUpgradeabilityProxy.at(proxyAddressVoting).upgradeTo(voting.address);
     await AdminUpgradeabilityProxy.at(proxyAddressVotingHelper).upgradeTo(votingHelper.address);
     return true;
     console.log('done');
   }  
};
