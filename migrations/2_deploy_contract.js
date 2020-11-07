const EthHashTimeLock = artifacts.require('EthHashTimeLock');

module.exports = async deployer => {
  deployer.deploy(EthHashTimeLock);
};
