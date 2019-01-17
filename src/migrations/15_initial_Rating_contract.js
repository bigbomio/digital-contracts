
const BBStorage = artifacts.require("BBStorage");
const ProxyFactory = artifacts.require("UpgradeabilityProxyFactory");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const BBRating =  artifacts.require("BBRating");



var accounts;



module.exports = async function (deployer) {
  // await web3.eth.getAccounts(function (err, res) {
  //   accounts = res;
  //  // console.log('accounts:', accounts);

  // });
  console.log('deployer.network_id ', deployer.network_id);
  if (deployer.network_id == 3) {

    var admin = '0xb10ca39dfa4903ae057e8c26e39377cfb4989551';
    var adminProxy = '0xf76fca3604e2005fe59bd59bdf97075f631fd2bc';
    var proxyFactAddress = '0xf3f2550093c8f33d5a5efcd01e13907956bd4d00'
    var BBOAddress = '0x1d893910d30edc1281d97aecfe10aefeabe0c41b';
    var storageAddress = '0xb83d8faa19b3bd03d200e4eb9f985ac247497726';
    var ratingInstance;
    var proxyRatingAddress;
    var rating;
    

   return deployer.deploy(BBRating).then(function (rs) {
      console.log('deploy BBStorage done....')
      ratingInstance = rs;
      return ProxyFactory.at(proxyFactAddress).createProxy(adminProxy, ratingInstance.address);    
    }).then(function (logs) {
      proxyRatingAddress = logs.logs.find(l => l.event === 'ProxyCreated').args.proxy
      console.log('proxyRatingAddress', proxyRatingAddress)
      return BBRating.at(proxyRatingAddress);
    }).then(function (rs) {
      rating = rs;
      console.log('BBRating address ',rating.address);
      console.log('BBRating transferOwnership ....')
      return rating.transferOwnership(admin)
    }).then(function (rs) {
      console.log('rating set storageAddress : ', storageAddress);
      return rating.setStorage(storageAddress)
    });
  }
};