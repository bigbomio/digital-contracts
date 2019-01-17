
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBTCRHelper =  artifacts.require("BBTCRHelper");
const BBVotingHelper =  artifacts.require("BBVotingHelper");
const BBUnOrderedTCR = artifacts.require("BBUnOrderedTCR");


var accounts;



module.exports = async function (deployer) {
  
  console.log('deployer.network_id ', deployer.network_id);
  if (deployer.network_id == 33) {

    var admin = '0x83e5353fc26643c29b041a3b692c6335c97a9aed';
    var adminProxy = '0xa867a6a820928c64ffe3e30166481ec526d38bc5';
    var BBOAddress = '0x1d893910d30edc1281d97aecfe10aefeabe0c41b';
    var proxyAddressTCR = '0x9ec9bb2775c37730bbd7ed203fe3e8e73d6dfc23';
    var proxyAddressTCRHelper = '0xee6004216682e3e0eb7611fc234e13a967461f2b';
    var votingProxy = '0x0f8821e2aa2ed8d97f03091caac249a371759906'
    var votingHelperProxy = '0xf013557b366e6a96dbcdef7fc4e2743beafcbb9e'
    var unorderTCR;
    var TCRHelper;
    var TCRInstanceHelper;

    console.log('8_update_unorderedTCR_contract');


    deployer.deploy(BBUnOrderedTCR).then(function (rs) {
      unorderTCR = rs;
      return  AdminUpgradeabilityProxy.at(proxyAddressTCR).upgradeTo(unorderTCR.address);
   });

   return;

    deployer.deploy(BBTCRHelper).then(function (rs) {
        return BBTCRHelper.at(proxyAddressTCRHelper);
    }).then(function (rs) {
       TCRHelper = rs;
       //return unorderTCR.setVoting(votingProxy);
       return TCRHelper.setStorage('0xfb3c7e2bf3f2470b72bc037dcf79425dc3b68d39');
    }).then(function(rs){
      return TCRHelper.setParamsUnOrdered(10, 24 * 60 * 60, 24 * 60 * 60 * 2, 24 * 60 * 60, 100e18,  100, 24 * 60 * 60);
    });

    // if (BBUnOrderedTCR.deployed()) {
    //   console.log('aaaaaaaaaa------------>');

    //   unorderTCR = await BBUnOrderedTCR.deployed();
    //   console.log(unorderTCR.at(proxyAddressTCR));
    //   await unorderTCR.at(proxyAddressTCR).setVoting(votingProxy);
    //   await unorderTCR.at(proxyAddressTCR).setVotingHelper(votingHelperProxy);
    //   console.log('bbbbbbbbbbb------------>');
    // } else {
    //   console.log('BBUnOrderedTCR not yet deployed');
    // }

    // return;

    
  }
};