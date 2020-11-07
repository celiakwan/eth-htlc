# eth-htlc
A Hash Time Locked Contract (HTLC) example for Ethereum enabling cross-chain swap with another blockchain network of cryptocurrency.

### Version
- [Solidity](https://solidity.readthedocs.io/): 0.6.0
- [Truffle](https://www.trufflesuite.com/): 5.1.50
- [Ganache](https://www.trufflesuite.com/ganache): 2.4.0
- [Web3.js](https://web3js.readthedocs.io/): 1.2.9
- [Node.js](https://nodejs.org/en/): 15.0.1
- [@openzeppelin/contracts](https://openzeppelin.com/): 3.2.0

### Installation
Install Ganache from https://www.trufflesuite.com/ganache.

Install Node.js.
```
brew install node
```
Install Truffle globally.
```
npm install truffle -g
```
Install the required Node.js packages in this project including @openzeppelin/contracts.
```
npm install
```

### Configuration
By default, Truffle comes bundled with a local development blockchain server which provides 10 accounts and preloads each of them with 100 ETH. For testing purposes, we can use it without modifying the network settings. However, you will need to update the Truffle configuration file `truffle-config.js` if you are connecting to other Ethereum networks.

### Deployment
1. Compile the smart contracts.
    ```
    truffle compile
    ```

2. Before migrating to our local blockchain, we should open Ganache first.

3. Deploy the smart contracts.
    ```
    truffle migrate
    ```

### Testing
Run test cases for the HTLC.
```
truffle test test/EthHashTimeLock.js
```