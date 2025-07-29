const express = require('express');
const crypto = require('crypto');

const app = express();

const DIFF_LEVEL = 8; // Example difficulty level
const POW_BATCH_SIZE = 10; // Number of challenges to generate in one request
const SCRYPT_COST = 16384; // Example scrypt cost parameter
const PREIMAGE_LENGTH = 8; // Length of the preimage in bytes

// Scrypt parameters
const scryptParameters = {
    N: SCRYPT_COST,
    r: 8,
    p: 1,
    klen: 16
};

const verifyPoW = async (challengeBase64, nonceHex) => {
    // Validate parameters
    if (!challengeBase64 || !nonceHex) {
        return { success: false, status: 400, error: 'Insufficient parameters' };
    }

    // Decode nonce
    let nonceBytes;
    try {
        nonceBytes = Buffer.from(nonceHex, 'hex');
        if (nonceBytes.length === 0) {
            throw new Error('empty nonce');
        }
        console.log(`[VERIFY] Nonce decoded: ${nonceBytes.length} bytes`);
    } catch (err) {
        console.log(`[VERIFY] Error: Invalid nonce hex: ${err.message}`);
        return { success: false, status: 400, error: 'Invalid nonce hex' };
    }

    // Decode challenge
    let challenge;
    try {
        const challengeJSON = Buffer.from(challengeBase64, 'base64').toString('utf8');
        challenge = JSON.parse(challengeJSON);
        console.log(`[VERIFY] Challenge decoded: N=${challenge.N}, r=${challenge.r}, p=${challenge.p}, dl=${challenge.dl}`);
    } catch (err) {
        console.error(`[VERIFY] Challenge parsing error:`, err);
        return { success: false, status: 400, error: 'Invalid challenge format' };
    }

    // Decode preimage
    let preimageBytes;
    try {
        preimageBytes = Buffer.from(challenge.i, 'base64');
        if (preimageBytes.length !== PREIMAGE_LENGTH) {
            throw new Error('invalid preimage length');
        }
        console.log(`[VERIFY] Preimage decoded: ${preimageBytes.length} bytes`);
    } catch (err) {
        console.error(`[VERIFY] Preimage error:`, err);
        return { success: false, status: 400, error: 'Invalid preimage format' };
    }

    // Compute and verify scrypt hash
    try {
        console.log(`[VERIFY] Computing scrypt with N=${challenge.N}, r=${challenge.r}, p=${challenge.p}`);
        const startTime = Date.now();

        const hash = crypto.scryptSync(nonceBytes, preimageBytes, challenge.klen, {
            N: challenge.N,
            r: challenge.r,
            p: challenge.p
        });

        const scryptTime = Date.now() - startTime;
        console.log(`[VERIFY] Scrypt computation took ${scryptTime}ms`);

        const hashHex = hash.toString('hex');
        const endOfHash = hashHex.substring(hashHex.length - challenge.d.length);

        console.log(`[VERIFY] Full hash: ${hashHex}`);
        console.log(`[VERIFY] Hash tail: ${endOfHash} <= Required: ${challenge.d}`);

        if (endOfHash > challenge.d) {
            console.log(`[VERIFY] Verification FAILED: Hash does not meet difficulty requirement`);
            return { success: false, status: 400, error: 'Hash does not meet difficulty requirement' };
        }

        console.log(`[VERIFY] Verification SUCCESSFUL`);
        return { success: true, status: 200, message: 'Challenge verified successfully' };
    } catch (err) {
        console.error('[VERIFY] Scrypt computation error:', err);
        return { success: false, status: 500, error: 'Computation failed' };
    }
};

app.post('/getChallenges', async (_req, res) => {
    const toReturn = [];
    const timestamp = Date.now();

    for (let i = 0; i < parseInt(POW_BATCH_SIZE); i++) {
        const preimageBytes = crypto.randomBytes(PREIMAGE_LENGTH);
        const preimage = preimageBytes.toString('base64');

        const difficultyBytesLength = Math.ceil(DIFF_LEVEL / 8);
        const difficultyBytes = Buffer.alloc(difficultyBytesLength);

        for (let j = 0; j < difficultyBytesLength; j++) {
            let difficultyByte = 0;
            for (let k = 0; k < 8; k++) {
                const currentBitIndex = (j * 8 + (7 - k));
                if (currentBitIndex + 1 > DIFF_LEVEL) {
                    difficultyByte = difficultyByte | (1 << k);
                }
            }
            difficultyBytes[j] = difficultyByte;
        }

        const difficulty = difficultyBytes.toString('hex');
        
        // Create challenge object with randomized key order for more variable base64 output
        const challengeData = {
            N: scryptParameters.N,
            r: scryptParameters.r,
            p: scryptParameters.p,
            klen: scryptParameters.klen,
            i: preimage,
            d: difficulty,
            dl: DIFF_LEVEL
        };
        
        // Randomize key order
        const keys = Object.keys(challengeData);
        const shuffledKeys = keys.sort(() => Math.random() - 0.5);
        const challenge = {};
        shuffledKeys.forEach(key => {
            challenge[key] = challengeData[key];
        });

        const challengeJSON = JSON.stringify(challenge);
        const challengeBase64 = Buffer.from(challengeJSON).toString('base64');

        // Store challenge with timestamp
        challenges.set(challengeBase64, { timestamp });
        toReturn.push(challengeBase64);
    }

    const totalChallenges = challenges.size;
    console.log(`[CHALLENGES] Generated ${toReturn.length} new challenges (${totalChallenges} total stored)`);

    res.json(toReturn);
})

app.post('/verify', async (req, res) => {
    const { powChallenge, nonceHex } = req.body;

    // Call the separated verifyPoW function
    const result = await verifyPoW(powChallenge, nonceHex);

    // Return the appropriate response based on the result
    if (result.success) {
        return res.status(result.status).json({
            status: 'success',
            message: result.message
        });
    } else {
        return res.status(result.status).json({
            status: 'error',
            error: result.error
        });
    }
})

app.listen(3000, () => {
    console.log('Proof of Work server running on http://localhost:3000');
});