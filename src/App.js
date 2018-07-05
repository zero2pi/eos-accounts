import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Eos from "eosjs";
// var request = require("request");
import request from "request";
import axios from 'axios';

var scatter = {};
var pubkey = "EOS8KcZx26i1E4H1fxek1ug7QZWQeu4FP2j8b3wYDYWQKkqvuNL6w";
const network = {
  protocol:'http', // Defaults to https
  blockchain: "eos",
  host: "193.93.219.219",
  port: 8888,
  chainId:
    "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
};

const eosOptions = {
  chainId:
    "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      from: "",
      to: "",
      amount: "",
      errorMsg: "hello",
      errorV: "hidden",
      transfer: "none",
      create: "block",

      placeholderFrom:"Enter Name",
      placeholderTo:"Enter Owner public key",
      placeholdereAmount:"Enter Active public key"
    };
  }
  transferAmount = async () => {
    this.setState({
      errorV:"hidden",
    });
    if (scatter) {
      if(this.state.from && this.state.to){
        console.log("money transfer");
        console.log(
          "from = ",this.state.from,
          "\n to = ",this.state.to,
          "\n amount = ",this.state.amount
        );
        const eos =  scatter.eos(network, Eos, eosOptions);
        try {
          let amount1 = (this.state.amount === "" ? "0" : this.state.amount) + ".0000 EOS";
          let result = await eos.transfer(
            this.state.from,
            this.state.to,
            amount1,
            "transfer from "+this.state.from
            // { authorization: "pooja@active" }
          );
          console.log("result = ", result);
          if (result.broadcast) {
            this.setState({
              errorMsg: amount1 + " amount has been transfered!",
              errorV: "visible"
            });
          } else {
            alert("not transfer");
          }
        } catch (err) {
          console.log("err = ", err);
          switch (typeof err) {
            case "object":
              {
                console.log("object case!");
                if (err.code === 402) {
                  // alert('Reject transfer');
                  this.setState({
                    errorMsg: err.message,
                    errorV: "visible"
                  });
                } else if(err.code === 423){
                  this.setState({
                    errorMsg: "Please unlock your browser scatter!",
                    errorV: "visible"
                  });
                }else{
                  this.setState({
                    errorMsg: "chainId mismatch!",
                    errorV: "visible"
                  });
                }
              }
              break;
            case "string":
              {
                console.log("string case!");
                let err1 = JSON.parse(err);
                if (err1.code === 500) {
                  this.setState({
                    errorMsg: "account name is not valid!",
                    errorV: "visible"
                  });
                }
              }
              break;
          }
        }
      }
      else{
        this.setState({
          errorMsg:'please provide all parameters!',
          errorV:'visible'
        })
      }
    } else {
      console.log("please add scatter plugin on your browser!");
    }
  };
  componentWillMount() {
    //check scatter is available or not
    document.addEventListener("scatterLoaded", scatterExtension => {
      scatter = window.scatter;
      console.log("scatter ", scatter);
      if (scatter) {
        console.log("scatter is available!");
      } else {
        console.log("scatter is not available");
      }
    });
  }
  createAccount = async () => {
    this.setState({
      errorV:"hidden",
    });
    if(this.state.to && this.state.from && this.state.amount){
      if(this.state.from.length!==12){
        this.setState({
          from:"",
          placeholderFrom:"Name length !== 12"
        });
      }
      else if(this.state.to !== this.state.amount){
        this.setState({
          to:"",
          amount:"",
          placeholderTo:"owner != active",
          placeholdereAmount:"owner != active"
        });
      }
      else{
        //  var body = {
        //   "account_name":"pooja"
        // };
        // body = JSON.stringify(body);
        // var options = { 
        //     method: 'POST',
        //     url: 'http://193.93.219.219:8888/v1/chain/get_account',
        //     headers: {
        //       'Accept': 'application/json',
        //       'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     body:body
        //   };

        // request(options, function (error, response, body) {
        //   console.log(' error = ', error, 
        //   "\n respns = ", response,
        //   "\n body ", body)
        // });

          let config = {
            chainId: "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca", // 32 byte (64 char) hex string
            keyProvider: ['5JtiUFrViqvXe8HmsJSE4hAtxoF7ZwWVWNbkjMnorjULdDUi9SM'], // WIF string or array of keys..
            httpEndpoint: 'http://193.93.219.219:8888',
            expireInSeconds: 60,
            broadcast: true,
            verbose: false, // API activity
            sign: true
          }
          
          let eos = Eos(config);
          
          try{
            // const eos =  scatter.eos(network, Eos, eosOptions);
            let result = await eos.transaction(tr => {
            tr.newaccount({
              creator: 'pooja',
              name: this.state.from,
              owner: pubkey,
              active: pubkey,
            })
            tr.buyrambytes({
              payer: 'pooja',
              receiver: this.state.from,
              bytes: 4000,
            })

            tr.delegatebw({
              from: 'pooja',
              receiver: this.state.from,
              stake_net_quantity: '10.0000 EOS',
              stake_cpu_quantity: '10.0000 EOS',
              transfer: 0,
            })
          });
          // console.log('result', result)
          if(result.broadcast){
            this.setState({
              errorMsg:'Account has been created!',
              errorV:'visible'
            });
          }
        }catch(err){
          console.log("err = ", err);
          if(err.code===402){
            this.setState({
              errorMsg:'Missing required accounts!',
              errorV:'visible'
            });
          }
        }
      }
    
    }
    else{
      this.setState({
        errorMsg:'please provide all parameters!',
        errorV:'visible'
      });
    }
  };
  getScatterInstance = ()=>{
    const requiredFields = {
      accounts: [
        {
          blockchain: "eos",
          host: "193.93.219.219",
          port: 8888,
          chainId:
            "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
        }
      ]
    };
    const identity = scatter.getIdentity(requiredFields);
    console.log("identity ", identity);
  }
  handleMenu = (e)=>{
        console.log('target = ', e.target.innerHTML);
    let target = e.target.innerHTML;
    if(target==='Create'){
      this.setState({
        create: "block",
        transfer: "none",
        errorV:'hidden',
        from:"",
        to:"",
        amount:""
      });
    }
    else if(target==="Transfer"){
      this.setState({
        create: "none",
        transfer: "block",
        errorV:'hidden',
        from:"",
        to:"",
        amount:""
      });
    }
    else{
      this.setState({
        errorV:'hidden',
        from:"",
        to:"",
        amount:""
      })
      this.getScatterInstance();
    }
  };
  render() {
    return (
      <div className="App">
        <div className="container">
        <div className='header'>Eosjs And Scatter Demo</div>
        <ul className='tabS' onClick={(e)=>this.handleMenu(e)}>
          <li>Create</li>
          <li>Transfer</li>
          <li>Get Scatter</li>
        </ul>
          <div style={{ display: this.state.transfer }}>
            <div className="heading">
              <p>Transfer Amount</p>
            </div>
            
            <ul className="ul">
              <li className="leftli">From</li>
              <li className="rightli">
                <input
                  placeholder="Enter acounter name"
                  value={this.state.from}
                  onChange={e => {
                    this.setState({ from: e.target.value, errorV:'hidden' });
                  }}
                />
              </li>
            </ul>
            <ul className="ul">
              <li className="leftli">To</li>
              <li className="rightli">
                <input
                  placeholder="Enter acounter name"
                  value={this.state.to}
                  onChange={e => {
                    this.setState({ to: e.target.value, errorV:'hidden' });
                  }}
                />
              </li>
            </ul>
            <ul className="ul">
              <li className="leftli">Amount</li>
              <li className="rightli">
                <input
                  placeholder="Enter amount"
                  value={this.state.amount}
                  onChange={e => {
                    this.setState({ amount: e.target.value , errorV:'hidden'});
                  }}
                />
              </li>
            </ul>
            <div style={{ "visibility": this.state.errorV }} className="errDiv">
              {this.state.errorMsg}
            </div>
            <button onClick={this.transferAmount}>transfer</button>
            {/* <button onClick={this.createAccount}>create</button>
            <button onClick={this.getScatterInstance}>Get Scatter</button> */}
          </div>
          <div style={{ display: this.state.create }}>
            <div className="heading">
              <p>Create Account</p>
            </div>
            
            <ul className="ul">
              <li className="leftli">Account Name</li>
              <li className="rightli">
                <input
                  placeholder={this.state.placeholderFrom}
                  value={this.state.from}
                  onChange={e => {
                    this.setState({ from: e.target.value });
                  }}
                />
              </li>
            </ul>
            <ul className="ul">
              <li className="leftli">Owner P.Key</li>
              <li className="rightli">
                <input
                  placeholder={this.state.placeholderTo}
                  value={this.state.to}
                  onChange={e => {
                    this.setState({ to: e.target.value });
                  }}
                />
              </li>
            </ul>
            <ul className="ul">
              <li className="leftli">Active P.Key</li>
              <li className="rightli">
                <input
                  placeholder={this.state.placeholdereAmount}
                  value={this.state.amount}
                  onChange={e => {
                    this.setState({ amount: e.target.value });
                  }}
                />
              </li>
            </ul>
            <div style={{ visibility: this.state.errorV }} className="errDiv">
              {this.state.errorMsg}
            </div>
            <button onClick={this.createAccount}>create</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
