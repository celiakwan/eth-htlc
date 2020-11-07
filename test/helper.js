const crypto = require('crypto');

const BN = n => new web3.utils.BN(n);

const random = bytes => crypto.randomBytes(bytes);

const sha256 = secret => crypto.createHash('sha256').update(secret).digest('hex');

const leading0x = hex => `0x${hex}`;

const gasFee = async receipt => {
    const tx = await web3.eth.getTransaction(receipt.tx);
    const gasPrice = BN(tx.gasPrice);
    const gasUsed = BN(receipt.receipt.gasUsed);
    return gasUsed.mul(gasPrice);
};

const now = () => Math.floor(new Date().getTime() / 1000);

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = {
    random,
    sha256,
    leading0x,
    gasFee,
    now,
    sleep
};