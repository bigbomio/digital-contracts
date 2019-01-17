
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const BBWrap =  artifacts.require("BBWrap");
const TokenSideChain =  artifacts.require("TokenSideChain");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");


var accounts;



module.exports = async function (deployer) {
  // await web3.eth.getAccounts(function (err, res) {
  //   accounts = res;
  //  // console.log('accounts:', accounts);

  // });
  console.log('deployer.network_id ', deployer.network_id);
  if (deployer.network_id == 3) {

    var admin = '0x83e5353fc26643c29b041a3b692c6335c97a9aed';
    var adminProxy = '0xa867a6a820928c64ffe3e30166481ec526d38bc5';
    var storage;
    var WrapInstance;
    var proxyFact;
    var proxyAddressWrap
    var Wrap;


    //deployer BETH
    deployer.deploy(TokenSideChain,'BBO Pink','BOP',18).then(function(rs){
       console.log('Done');
    });

    //Update contract
    // deployer.deploy(BBWrap).then(function (rs) {
    //   return  AdminUpgradeabilityProxy.at('0x989b371d7a936ed32bf2d92e6f5131171f8dbd0a').upgradeTo(rs.address);
    // });


  //   deployer.deploy(BBStorage).then(function (rs) {
  //     return BBWrap.at('0x989b371d7a936ed32bf2d92e6f5131171f8dbd0a');
  // }).then(function (rs) {
  //    Wrap = rs;
  //    //return unorderTCR.setVoting(votingProxy);
  //    return Wrap.addAdmin('0x1fc53a374b8ad7bad8660da284878baf17947a04', true);
  // })

    return;

    deployer.deploy(BBStorage).then(function (rs) {
      storage = rs;
      return deployer.deploy(ProxyFactory);
    }).then(function (rs) {
      console.log('deploy ProxyFactory done....')
      proxyFact = rs;
      console.log('begin deploy BBWrap')
      return deployer.deploy(BBWrap);
    }).then(function (rs) {
      console.log('deploy BBWrap done....')
      WrapInstance = rs;
      console.log('begin deploy proxyAddressWrap')
      return proxyFact.createProxy(adminProxy, WrapInstance.address);    
    }).then(function (logs) {
      proxyAddressWrap = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyAddressWrap', proxyAddressWrap)
      return BBWrap.at(proxyAddressWrap);
    }).then(function (rs) {
      Wrap = rs;
      console.log('Wrap address ',Wrap.address);
      console.log('Wrap transferOwnership ....')
      return Wrap.transferOwnership(admin)
    }).then(function (rs) {
      console.log('Wrap storage.address : ', storage.address);
      return Wrap.setStorage(storage.address)
    }).then(function(rs){
      console.log('storage.addAdmin(proxyAddressWrap')
      return storage.addAdmin(proxyAddressWrap, true)
    });
  }
};