/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var infura_apikey = "e7cf61fe75a64b2f91459362e0e5beb8"; // Either use this key or get yours at https://infura.io/signup. It's free.
var privKeys = "c3f1df2176c5bb432d970ecc4ceae7e7003829970c353cb132a816ed53e48e5f";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 777, // Match any network id
      gas: 0xfffffffffff,
      gasPrice: 0x01,
      // from: '0xd006b8df15798dd798acdd56ace7663ce614ad81' 
    }

  },
  


};