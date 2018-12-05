const BBParams =  artifacts.require("BBParams");
const BBDispute =  artifacts.require("BBDispute");
const BBVoting =  artifacts.require("BBVoting");
const BBStorage =  artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");

module.exports = function(deployer) {
    var proxyAddressJob = '0x71356605e4f79fd07b01cc187bdcbc1f4025db1f';
    var proxyAddressBid = '0xf01cc898b9245930a345bec82423b87f602cb8e4';
    var proxyAddressPayment = '0x22ce61d3c44e5a005a9b9f4485cfbc660c1c2ef3';
    var storageAddress = '0x7f4f85ed6fb35be5ab03272f95b73dfe4b491243';
    var proxyFactAddress = '0x46820d60ca35cab8103a332804c8c889358ec66f';

 
    var BBOAddress = '0x2ddc511802a37039c42c6bdb36028b2f8992b0fe';

    var storage, proxyFact, params, dispute, voting, paramsProxy, disputeProxy, votingProxy;
    var paramsI, disputeI, votingI;

    // paramsProxy = '0x315cf0a2c4e5dbee4cd8cf25c55d95b4badb364b'
    // disputeProxy = '0xdb5134f53d003d478a71973543f187304097b039'
    // votingProxy = '0x9899fcb82031f8cba60eb13d6e93e88365256612'

   if(deployer.network_id == 3){
    
        return BBDispute.at('0x278636913d5203a057adb7e0521b8df9431bdaa5').transferOwnership('0xb10ca39dfa4903ae057e8c26e39377cfb4989551')
 
    .then(function(rs){
        console.log('1')
        return BBDispute.at('0x278636913d5203a057adb7e0521b8df9431bdaa5').setStorage(storageAddress);
    })
    .then(function(rs){
        console.log('1')
        return BBDispute.at('0x278636913d5203a057adb7e0521b8df9431bdaa5').setBBO(BBOAddress);
    })
    .then(function(rs){
        console.log('1')
        return BBDispute.at('0x278636913d5203a057adb7e0521b8df9431bdaa5').setPayment(proxyAddressPayment);
    })
   
    
    
   }  
};
