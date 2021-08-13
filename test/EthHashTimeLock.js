const h = require('./helper.js');

const EthHashTimeLock = artifacts.require('EthHashTimeLock');

const BN = n => new web3.utils.BN(n);

contract('EthHashTimeLock', accounts => {
    const preimage = h.random(32);
    const hashlock = h.leading0x(h.sha256(preimage));
    const amount = web3.utils.toWei('2', 'ether');
    const defaultBalance = web3.utils.toWei('100', 'ether');
    const sender = accounts[1];
    const recipient = accounts[2];
    let htlc;
    let expectedSenderBalance = BN(defaultBalance);
    let expectedRecipientBalance = BN(defaultBalance);

    beforeEach(async () => {
        htlc = await EthHashTimeLock.new();
    });

    it('Sender initiates exchange', async () => {
        const timelock = h.now() + 60; // Expire after one minute
        const initiate = await htlc.initiate(recipient, hashlock, timelock, {
            from: sender,
            value: amount,
        });

        assert.equal(initiate.logs[0].args.sender, sender, 'Incorrect sender account');
        assert.equal(initiate.logs[0].args.recipient, recipient, 'Incorrect recipient account');
        assert.equal(initiate.logs[0].args.amount, amount, 'Incorrect ETH amount');
        assert.equal(initiate.logs[0].args.hashlock, hashlock, 'Incorrect hashlock');
        assert.equal(initiate.logs[0].args.timelock, timelock, 'Incorrect timelock');

        const initiateGasFee = await h.gasFee(initiate);
        expectedSenderBalance = expectedSenderBalance.sub(BN(amount)).sub(initiateGasFee);

        const senderBalanceAfter = BN(await web3.eth.getBalance(sender));
        const recipientBalanceAfter = BN(await web3.eth.getBalance(recipient));

        assert.equal(senderBalanceAfter.toString(), expectedSenderBalance.toString(), 'Incorrect balance of the sender account after initiation');
        assert.equal(recipientBalanceAfter.toString(), expectedRecipientBalance.toString(), 'Incorrect balance of the recipient account after initiation');
    });

    it('Recipient withdraws ETH with correct preimage', async () => {
        const timelock = h.now() + 60; // Expire after one minute
        const initiate = await htlc.initiate(recipient, hashlock, timelock, {
            from: sender,
            value: amount,
        });

        const initiateGasFee = await h.gasFee(initiate);
        expectedSenderBalance = expectedSenderBalance.sub(BN(amount)).sub(initiateGasFee);
        
        // Assume recipient has obtained the preimage after sender withdrew coins in another blockchain
        const withdraw = await htlc.withdraw(preimage, {from: recipient});

        assert.equal(withdraw.logs[0].args.sender, sender, 'Incorrect sender account');
        assert.equal(withdraw.logs[0].args.recipient, recipient, 'Incorrect recipient account');
        assert.equal(withdraw.logs[0].args.amount, amount, 'Incorrect ETH amount withdrawn');
        assert.equal(withdraw.logs[0].args.preimage, h.leading0x(preimage.toString('hex')), 'Incorrect preimage');

        const withdrawGasFee = await h.gasFee(withdraw);
        expectedRecipientBalance = expectedRecipientBalance.add(BN(amount)).sub(withdrawGasFee);

        const senderBalanceAfter = BN(await web3.eth.getBalance(sender));
        const recipientBalanceAfter = BN(await web3.eth.getBalance(recipient));
        
        assert.equal(senderBalanceAfter.toString(), expectedSenderBalance.toString(), 'Incorrect balance of the sender account after withdrawal');
        assert.equal(recipientBalanceAfter.toString(), expectedRecipientBalance.toString(), 'Incorrect balance of the recipient account after withdrawal');
    });

    it('Sender refunds after timelock expires', async () => {
        const timelock = h.now() + 1; // Expire after one second
        const initiate = await htlc.initiate(recipient, hashlock, timelock, {
            from: sender,
            value: amount,
        });

        const initiateGasFee = await h.gasFee(initiate);
        expectedSenderBalance = expectedSenderBalance.sub(BN(amount)).sub(initiateGasFee);
        
        // Sleep for two seconds
        await h.sleep(2000);

        // Assume sender did not withdraw coins in another blockchain
        const refund = await htlc.refund(preimage, {from: sender});

        assert.equal(refund.logs[0].args.sender, sender, 'Incorrect sender account');
        assert.equal(refund.logs[0].args.amount, amount, 'Incorrect ETH amount refunded');

        const refundGasFee = await h.gasFee(refund);
        expectedSenderBalance = BN(expectedSenderBalance).add(BN(amount)).sub(refundGasFee);

        const senderBalanceAfter = BN(await web3.eth.getBalance(sender));
        const recipientBalanceAfter = BN(await web3.eth.getBalance(recipient));

        assert.equal(senderBalanceAfter.toString(), expectedSenderBalance.toString(), 'Incorrect balance of the sender account after refund');
        assert.equal(recipientBalanceAfter.toString(), expectedRecipientBalance.toString(), 'Incorrect balance of the recipient account after refund');
    });

    it('Recipient withdraws ETH with incorrect preimage', async () => {
        const timelock = h.now() + 60; // Expire after one minute
        await htlc.initiate(recipient, hashlock, timelock, {
            from: sender,
            value: amount,
        });
        
        const fakePreimage = web3.utils.fromAscii('fake preimage');
        let f;

        try {
            await htlc.withdraw(fakePreimage, {from: recipient});
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /revert/, 'Cannot withdraw ETH with incorrect preimage');
        }
    });

    it('Sender refunds before timelock expires', async () => {
        const timelock = h.now() + 60; // Expire after one minute
        await htlc.initiate(recipient, hashlock, timelock, {
            from: sender,
            value: amount,
        });

        let f;

        try {
            await htlc.refund(preimage, {from: sender});
        } catch(e) {
            f = () => {throw e};
        } finally {
            assert.throws(f, /revert/, 'Cannot refund before timelock expires');
        }
    });
});
