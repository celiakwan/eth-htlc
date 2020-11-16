# eth-htlc
A Hash Time Locked Contract (HTLC) example for Ethereum enabling cross-chain swap with another blockchain network of cryptocurrency.

### Version
- [Solidity](https://solidity.readthedocs.io/): 0.6.0
- [Truffle](https://www.trufflesuite.com/): 5.1.50
- [Ganache CLI](https://github.com/trufflesuite/ganache-cli): 6.12.1
- [Web3.js](https://web3js.readthedocs.io/): 1.2.9
- [Node.js](https://nodejs.org/en/): 15.0.1
- [@openzeppelin/contracts](https://openzeppelin.com/): 3.2.0

### Installation
Install Node.js.
```
brew install node
```

Install Truffle globally.
```
npm install truffle -g
```

Install Ganache CLI globally.
```
npm install ganache-cli -g
```

Install the required Node.js packages in this project including @openzeppelin/contracts.
```
npm install
```

### Configuration
By default, Ganache will create 10 accounts and preload each with 100 ETH on your local blockchain network. If you want to connect to other Ethereum networks, you will need to update the Truffle configuration file `truffle-config.js`.

### Deployment
1. Compile the smart contracts.
    ```
    truffle compile
    ```

2. Before migrating to our local blockchain, we should start the Ganache CLI in a new terminal.
    ```
    ganache-cli -p 7545
    ```

3. Deploy the smart contracts.
    ```
    truffle migrate
    ```

### Testing
Run test cases for the HTLC.
```
truffle test test/EthHashTimeLock.js
```