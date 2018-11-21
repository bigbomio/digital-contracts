
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
  if (deployer.network_id == 33) {

    var admin = '0x83e5353fc26643c29b041a3b692c6335c97a9aed';
    var adminProxy = '0xA867a6a820928C64FfE3e30166481Ec526D38BC5';
    var storageAddress = '0x99a2c9bc3793cc72a7a9b352e97deece4f4961c7';
    var ratingInstance;
    var proxyRatingAddress;
    var rating;
    var proxyFact;
    

    deployer.deploy(ProxyFactory).then(function (rs) {
      proxyFact = rs;
      return deployer.deploy(BBRating);
    }).then(function (rs) {
      console.log('deploy BBStorage done....')
      ratingInstance = rs;
      return proxyFact.createProxy(adminProxy, ratingInstance.address);    
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