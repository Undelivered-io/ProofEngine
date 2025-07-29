# ProofEngine

A modern, lightweight Proof-of-Work (PoW) implementation for Nuxt 3 applications. ProofEngine provides bot protection and spam prevention through client-side computational challenges using the Scrypt algorithm.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.x-brightgreen.svg)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)


https://github.com/user-attachments/assets/ab773d7d-4b55-472c-875b-7140e522e03c


## 🚀 Features

- **🛡️ Bot Protection**: Effectively deters automated attacks and spam
- **⚡ WebAssembly Powered**: High-performance Scrypt implementation
- **🎯 Adaptive Difficulty**: Configurable challenge difficulty levels (1-20+)
- **👥 Multi-Worker Support**: Parallel computation across CPU cores
- **📊 Real-time Progress**: Live hash rate and progress visualization
- **🎨 Modern UI**: Clean, responsive component with dark mode support
- **♿ Accessible**: WCAG compliant with proper ARIA labels
- **📱 Mobile Friendly**: Optimized for all device sizes

## 🔧 Technical Overview

### Architecture

ProofEngine consists of three main components:

1. **Nuxt Component** (`ProofEngine.vue`) - The UI layer
2. **Worker Script** (`powScript.js`) - Manages Web Workers and challenge orchestration
3. **Composable** (`useProofEngine.ts`) - Server communication and state management

### How It Works

1. **Challenge Generation**: Server generates a unique challenge with specific difficulty
2. **Client Computation**: Browser computes Scrypt hashes to find a valid nonce
3. **Proof Submission**: Valid solution is sent back to server for verification
4. **Server Validation**: Server verifies the proof before allowing the action

### Difficulty System

The difficulty level determines how hard the computational challenge is. Here's how it works:

- **Difficulty Level**: An integer (typically 1-16) that represents the number of trailing zero bits required in the hash. The difficulty then gets converted to a hex string (i.e. difficulty 6 = '03'). The computed hash must end with this hex string to be considered a valid solution.
- **Computational Complexity**: Each additional difficulty level approximately doubles the computational effort required
- **Success Probability**: The probability of finding a valid nonce is `1/2^difficulty`

For example:
- Difficulty 8: Requires 8 trailing zero bits (success rate: 1 in 256 attempts)
- Difficulty 10: Requires 10 trailing zero bits (success rate: 1 in 1024 attempts)
- Difficulty 12: Requires 12 trailing zero bits (success rate: 1 in 4096 attempts)

### Hash Rate and Performance

- **Hash Rate**: Measured in hashes per second (H/s). In other words, how many nonces are computed per second
- **Multi-Worker Architecture**: Utilizes multiple Web Workers to parallelize computation across CPU cores
- **WebAssembly Optimization**: Uses compiled WASM for faster Scrypt computation compared to pure JavaScript
- **Progressive Difficulty**: Start with lower difficulty for initial challenges, increase for suspicious behavior

### Memory-Hard Function (Scrypt)

ProofEngine uses Scrypt as its proof-of-work algorithm because:
- **Memory-Hard**: Requires significant RAM, making ASIC attacks more difficult
- **Configurable Parameters**: N, r, p values can be tuned for different security/performance trade-offs
- **CPU-Intensive**: Provides good protection against bot attacks while remaining feasible for legitimate users

### Scrypt Parameters

We use the following Scrypt parameters for our implementation:

```javascript
{
  N: 16384,      // CPU/memory cost parameter
  r: 8,          // Block size
  p: 1,          // Parallelization parameter
  klen: 16       // Key length in bytes
}
```

## 📦 Installation

1. Copy the required files from src/ to your project:
   - `ProofEngine.vue` - Main component (place in `/components`)
   - `powScript.js` - Worker orchestrator (place in `/public`)
   - `ProofOfWorker.js` - Web Worker (place in `/public`)
   - `proofengine-wasm/glue.js` - Glue code for WebAssembly (place in `/public/proofengine-wasm`)
   - `proofengine-wasm/pe_scrypt.wasm` - Scrypt WASM implementation (place in `/public/proofengine-wasm`)
   - `useProofEngine.ts` - Composable (place in `/composables`)

2. Replace the `PE_SERVER_URL` variable in useProofEngine.ts or define it in your Nuxt runtimeConfig:

```typescript
runtimeConfig: {
    public: {
      proofEngine: {
        url: 'your ProofEngine server URL here',
      }
    }
  },
```

3. Import and use the component:

```html
<template>
  <ProofEngine
    ref="powComponent"
    :challenge="currentChallenge"
    :is-dark="true"
    @completed="handlePowCompleted"
    @progress="handlePowProgress"
    @error="handlePowError"
  />
  </template>

<script setup>
// Initialize PoW composable
const powState = useProofEngine()
const currentChallenge = ref('');
const powComponent = ref();

// PoW event handlers  
const handlePowCompleted = (nonce) => {
  console.log('PoW completed with nonce:', nonce)
}

const handlePowProgress = (data) => {
  console.log('PoW progress:', data)
}

const handlePowError = (errorMsg) => {
  console.error('PoW error:', errorMsg)
}

const resetPow = () => {
  // reset PoW component
  powComponent.value.reset();
}

onMounted(async () => {
  // Generate a new challenge 
   try {
      currentChallenge.value = await powState.generateChallenge()
      console.log('Generated challenge:', currentChallenge.value)
    } catch (error) {
      powError.value = `Failed to generate challenge: ${error}`
  }
})
</script>
```

## 🔌 API Reference

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ref` | Ref | `''` | Ref used to interact with the component |
| `challenge` | String | `''` | Base64 encoded challenge from server |
| `is-dark` | Boolean | `false` | Enable dark mode styling |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `completed` | `nonce: string` | Emitted when valid proof is found |
| `progress` | `{attempts, smallestHash, difficulty}` | Progress updates during computation |
| `error` | `message: string` | Error during computation |

### Methods

```javascript
// Access via template ref
const powRef = ref()

// Manually trigger computation
powRef.value.triggerPow()

// Stop current computation
powRef.value.stopChallenge()

// Reset component state
powRef.value.reset()
```

## 🖥️ Server Integration

Refer to the server/ directory in this repo to take a look at an example. Here is an overview:

### Challenge Generation

Generate challenges with varying difficulty:

```javascript
const preimageBytes = crypto.randomBytes(8); // Preimage byte length = 8
const preimage = preimageBytes.toString('base64');

// difficultyLevel = 8
const difficultyBytesLength = Math.ceil(difficultyLevel / 8);
const difficultyBytes = Buffer.alloc(difficultyBytesLength);

for (let j = 0; j < difficultyBytesLength; j++) {
  let difficultyByte = 0;
  for (let k = 0; k < 8; k++) {
    const currentBitIndex = (j * 8 + (7 - k));
      if (currentBitIndex + 1 > difficultyLevel) {
        difficultyByte = difficultyByte | (1 << k);
      }
  }
  difficultyBytes[j] = difficultyByte;
}

const difficulty = difficultyBytes.toString('hex');
        
// Create challenge object
const challengeData = {
  N: scryptParameters.N,
  r: scryptParameters.r,
  p: scryptParameters.p,
  klen: scryptParameters.klen,
  i: preimage,
  d: difficulty,
  dl: difficultyLevel
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
```

### Verification

Verify the proof on your server:

```javascript
const verifyPoW = async (challenge, nonce) => {
  const nonceBytes = Buffer.from(nonceHex, 'hex');
  const challenge = JSON.parse(Buffer.from(challengeBase64, 'base64').toString('utf8'));
  const preimageBytes = Buffer.from(challenge.i, 'base64');

  const hash = crypto.scryptSync(nonceBytes, preimageBytes, challenge.klen, {
    N: challenge.N,
    r: challenge.r,
    p: challenge.p
  });

  const hashHex = hash.toString('hex');
  const endOfHash = hashHex.substring(hashHex.length - challenge.d.length);

  if (endOfhash > challenge.d) return { success: false, message: 'Invalid solution'};

  return { success: true, message: 'Challenge solved successfully!' };
}
```

## 📊 Performance

**We have found that difficulty levels from 8 to 10 provide a good balance between user experience and security.** Here are the average times and success probabilities for each difficulty level:

| Difficulty | Average Time | Hash Rate | Success Probability |
|------------|--------------|-----------|---------------------|
| 8 | 6s | ~50 H/s | 1/256 |
| 9 | 7.5s | ~50 H/s | 1/512 |
| 10 | 17s | ~50 H/s | 1/1024 |
| 11 | 37s | ~50 H/s | 1/2048 |
| 12 | 53s | ~50 H/s | 1/4096 |

*Times vary based on device performance and number of CPU cores*

You can also use [our own test page](https://undelivered.io/pow-test) to experiment with the challenge parameters!

https://github.com/user-attachments/assets/a074c5fb-459d-4112-9622-74a374fd1fae


## 🎨 Customization

### Styling

The component uses CSS custom properties for easy theming:

```css
:root {
  --pow-primary-color: #2563eb;
  --pow-success-color: #21bd5b;
  --pow-warning-color: #ddb95a;
  --pow-error-color: #dc2626;
  --pow-bg-light: #f8fafc;
  --pow-bg-dark: #1e293b;
}
```

## 🔒 Security Considerations

1. **Server-Side Validation**: Always verify proofs on the server
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Dynamic Difficulty**: Adjust difficulty based on attack patterns
4. **Timeout Handling**: Set reasonable time limits for challenges
5. **Challenge Expiration**: Expire challenges after use or time limit

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

SPDX-License-Identifier: AGPL-3.0-or-later WITH LICENSE-ATTRIBUTION

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) with [attribution term](LICENSE-ATTRIBUTION).

## 🙏 Credits

ProofEngine is inspired by [pow-bot-deterrent](https://github.com/sequentialread/pow-bot-deterrent) by [sequentialread](https://github.com/sequentialread) licensed under GPL-3.0, and uses a heavily modified version of the worker scripts found in that project.

## 📞 Support

- 📧 Email: support@undelivered.io
- 🐛 Issues: [GitHub Issues](https://github.com/Undelivered-io/ProofEngine/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Undelivered-io/ProofEngine/discussions)

---

Made with ❤️ by [Undelivered.io](https://undelivered.io)
