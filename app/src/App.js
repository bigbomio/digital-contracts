import React, { Component } from 'react';
import FileReaderInput from 'react-file-reader-input';
import assert from 'assert';
import './App.css';


const newLocal = global.web3;
const web3 = newLocal;
// web3.setProvider(new Web3.providers.HttpProvider("https://ropsten.infura.io/bzIe8XXWYWzZGESfBfm1"));

const abiArray = [{
  constant: true, inputs: [{ name: 'bboDocHash', type: 'bytes32' }, { name: 'userSign', type: 'bytes' }], name: 'verifyBBODocument', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: true, inputs: [{ name: 'bboDocHash', type: 'bytes32' }], name: 'getUsersByDocHash', outputs: [{ name: 'userSigneds', type: 'address[]' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: false, inputs: [{ name: 'bboDocHash', type: 'bytes32' }, { name: 'userSign', type: 'bytes' }], name: 'signBBODocument', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: false, inputs: [], name: 'renounceOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  constant: true, inputs: [], name: 'owner', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: true, inputs: [], name: 'getUserSignedDocuments', outputs: [{ name: 'docHashes', type: 'bytes32[]' }], payable: false, stateMutability: 'view', type: 'function',
}, {
  constant: false, inputs: [{ name: '_newOwner', type: 'address' }], name: 'transferOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
}, {
  anonymous: false, inputs: [{ indexed: false, name: 'bboDocHash', type: 'bytes32' }, { indexed: false, name: 'userSign', type: 'bytes' }, { indexed: false, name: 'timestamp', type: 'uint256' }, { indexed: false, name: 'user', type: 'address' }], name: 'BBODocumentSigned', type: 'event',
}, {
  anonymous: false, inputs: [{ indexed: true, name: 'previousOwner', type: 'address' }], name: 'OwnershipRenounced', type: 'event',
}, {
  anonymous: false, inputs: [{ indexed: true, name: 'previousOwner', type: 'address' }, { indexed: true, name: 'newOwner', type: 'address' }], name: 'OwnershipTransferred', type: 'event',
}];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yourAddress: '',
      docHash: null,
      userSign: null,
      signed: false,
      signStt: false,
      err: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ yourAddress: web3.eth.defaultAccount });
    }, 1000);
    this.connectMetaMask();
  }

  getNetwork(netId) {
    switch (netId) {
      case '1':
        return 'MAINNET';
      case '2':
        return 'MORDEN';
      case '3':
        return 'ROPSTEN';
      case '4':
        return 'RINKEBY';
      case '42':
        return 'KOVAN';
      default:
        return 'UNKNOW';
    }
  }

  connectMetaMask() {
    if (!web3) {
      this.setState({ err: 'Please install Metamask!' });
    } else {
      web3.version.getNetwork((err, netId) => {
        if (err) {
          // console.log(err);
        } else if (this.getNetwork(netId) !== 'ROPSTEN') {
          this.setState({ err: 'Please choose Ropsten to test' });
        } else {
          web3.eth.getAccounts((err2, accounts) => {
            if (accounts.length > 0) {
              this.setState({ err: 'connected to metamask' });
            } else {
              this.setState({ err: 'Please connect your wallet with Metamask' });
            }
          });
        }
      });
    }
  }

  async userSign(dochash) {
    web3.eth.sign(web3.eth.defaultAccount, dochash, (err, result) => {
      this.signContract(result, dochash);
      this.setState({ userSign: result });
    });
    //
  }

  async verifyDocumentHashSigned(instance, dochash, usersign) {
    const signed = instance.verifyBBODocument(dochash, usersign, (err, result) => {
      this.setState({ signed: result, signStt: true });
      if (result) {
        assert.equal(signed, true);
      }
    });
  }

  signContract(usersign, dochash) {
    const contractAddress = '0x88ef6526247a36c130009553213dd678a7e273d8';
    const MyContract = web3.eth.contract(abiArray);
    console.log('MyContract: ', MyContract);
    const contractInstance = MyContract.at(contractAddress);
    // sign BBO Document
    contractInstance.signBBODocument(dochash, usersign, { from: web3.eth.defaultAccount }, (err, result) => {
      if (result) {
        this.verifyDocumentHashSigned(contractInstance, dochash, usersign);
      }
    });
    console.log('contractInstance: ', contractInstance);
  }

  handleChange(err, results) {
    results.forEach((result) => {
      const [e, file] = result;
      const textBuff = new Uint8Array(e.target.result);
      const docHash = web3.sha3(JSON.stringify(textBuff));
      // const docHash = Web3.utils.sha3(textBuff); we3 v1
      this.userSign(docHash);
      this.setState({ docHash });
    });
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <p>Metamask: {this.state.err}</p>
          <p>Your address: {this.state.yourAddress}</p>
          <p className={this.state.docHash ? 'show' : 'hide'}>docHash: {this.state.docHash}</p>
          <p className={this.state.userSign ? 'show' : 'hide'}>userSign: {this.state.userSign}</p>
          <p className={this.state.signStt ? 'show' : 'hide'}>signed: {this.state.signed ? <span className="success">Success!</span> : <span className="failed">Failed :(</span>}</p>
        </div>
        <FileReaderInput
          as="buffer"
          id="my-file-input"
          onChange={this.handleChange}
        >
          <div className="submit-btn">
            <p>Select your contract to sign </p>
            <button className="btn">Select a file!</button>
          </div>
        </FileReaderInput>
      </div>
    );
  }
}

export default App;
