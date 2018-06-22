import React, { Component } from 'react';
import FileReaderInput from 'react-file-reader-input';
import Eth from 'ethjs';
import sigUtil from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';
import CircularProgress from '@material-ui/core/CircularProgress';
import assert from 'assert';
import './App.css';


const newLocal = global.web3;
const web3 = newLocal;
console.log(web3);
let that;
// web3.setProvider(new Web3.providers.HttpProvider("https://ropsten.infura.io/bzIe8XXWYWzZGESfBfm1"));
const eth = new Eth(web3.currentProvider);
const abiArray = [{"constant":true,"inputs":[{"name":"bboDocHash","type":"bytes32"},{"name":"userSign","type":"bytes"}],"name":"verifyBBODocument","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"bboDocHash","type":"bytes32"}],"name":"getUsersByDocHash","outputs":[{"name":"userSigneds","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"bboDocHash","type":"bytes32"},{"name":"userSign","type":"bytes"}],"name":"signBBODocument","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getUserSignedDocuments","outputs":[{"name":"docHashes","type":"bytes32[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bboDocHash","type":"bytes32"},{"indexed":true,"name":"user","type":"address"}],"name":"BBODocumentSigned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yourAddress: '',
      docHash: null,
      userSign: null,
      signed: false,
      signStt: false,
      load: false,
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
    console.log(dochash);

    // web3.eth.sign(web3.eth.defaultAccount, dochash, (err, rs)=>{
    //   console.log(rs);
    //   if (err) return console.error(err);
    //   console.log(rs);
    //   this.signContract(rs, dochash);
    //   this.setState({ userSign: rs });
    // });

    eth.personal_sign(dochash, web3.eth.defaultAccount)
      .then((signed) => {
        console.log('Signed!  Result is: ', signed);
        console.log('Recovering...');
        this.signContract(signed, dochash);
        this.setState({ userSign: signed });
        return eth.personal_ecRecover(dochash, signed);
      })
      .then((recovered) => {
        if (recovered === web3.eth.defaultAccount) {
          console.log('Ethjs recovered the message signer!');
        } else {
          console.log('Ethjs failed to recover the message signer!');
          console.dir({ recovered });
        }
      });
  }

  ethjsSignTypedDataButton(dochash) {
  
    const msgParams = [
      {
        type: 'bytes32',
        name: 'Message',
        value: dochash
      }
    ]
  
    var from = web3.eth.defaultAccount;
  
    console.log('CLICKED, SENDING PERSONAL SIGN REQ')
    var params = [msgParams, from]
  
    var eth = new Eth(web3.currentProvider)
  
    eth.signTypedData(msgParams, from)
    .then((signed) => {
      console.log('Signed!  Result is: ', signed)
      console.log('Recovering...')
      this.signContract(signed, dochash);
      this.setState({ userSign: signed });
      const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })
      if (recovered === from ) {
        console.log('Successfully ecRecovered signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + signed + ' to ' + from)
      }
  
    })

  };


  async verifyDocumentHashSigned(instance, dochash, usersign) {
    that = this;
    this.setState({ load: true });
    const resultInterval = setInterval(() => {
      instance.verifyBBODocument(dochash, usersign, { from: web3.eth.defaultAccount }, (err, result) => {
        if (result) {
          that.setState({ signed: result, signStt: true, load: false });
          assert.equal(result, true);
          clearInterval(resultInterval);
        }
      });
    }, 10000);
  }

  async signContract(usersign, dochash) {
    that = this;
    const contractAddress = '0x188d253335e64132e6f9051ba28d71e3ef8d69be';
    const MyContract = web3.eth.contract(abiArray);
    console.log('MyContract: ', MyContract);
    const contractInstance = MyContract.at(contractAddress);
    // sign BBO Document
    contractInstance.signBBODocument(dochash, usersign, { from: web3.eth.defaultAccount }, (err, result) => {
      if (result) {
        that.verifyDocumentHashSigned(contractInstance, dochash, usersign);
      }
    });
    console.log('contractInstance: ', contractInstance);
  }

  handleChange(err, results) {
    that = this;
    results.forEach((result) => {
      const [e, file] = result;
      const textBuff = new Uint8Array(e.target.result);
      const docHash = web3.toHex(web3.sha3(JSON.stringify(textBuff)));
      // const docHash = Web3.utils.sha3(textBuff); we3 v1
      setTimeout(() => {
        //that.userSign(docHash);
        that.ethjsSignTypedDataButton(docHash);
        that.setState({ docHash });
      }, 1000);
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
          <div className={this.state.load ? 'sign-stt show' : 'hide'}><CircularProgress /></div>
          <div className={this.state.signStt ? 'sign-stt show' : 'hide'}>signed: {this.state.signed ? <span className="success">Success!</span> : <span className="pendding"> Wait a moment </span>}</div>
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
