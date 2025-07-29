<template>
  <div 
    class="pow-container"
    :class="{
      'dark': isDark,
      'computing': status === 'computing',
      'success': status === 'success',
      'error': status === 'error',
      'hidden': !challenge
    }"
  >
    <!-- Header -->
    <div class="pow-header">
      <div class="pow-header-content">
        <!-- Shield Icon -->
        <svg 
          v-if="status !== 'computing' && status !== 'success'"
          class="pow-icon shield"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>

        <!-- Computing Icon -->
        <svg 
          v-if="status === 'computing'"
          class="pow-icon computing"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        <!-- Success Icon -->
        <svg 
          v-if="status === 'success'"
          class="pow-icon success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div>
          <h4 class="pow-title">Security Verification</h4>
          <p class="pow-subtitle">ProofEngine by Undelivered</p>
        </div>
      </div>
      
      <!-- Help Button -->
      <button
        type="button"
        class="pow-help-button"
        @click="showHelpModal = true"
        aria-label="Learn about Proof of Work"
      >
        <svg
          class="pow-help-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>

    <!-- Description -->
    <div class="pow-description">
      <span v-if="status === 'success'">
        PoW complete, you may continue.
      </span>
      <span v-else>
        Computing cryptographic proof to verify you're human...
      </span>
    </div>

    <!-- Progress Section -->
    <div v-if="status === 'computing' || status === 'success'" class="pow-progress-section">
      <!-- Hash Info -->
      <div class="pow-hash-info">
        <span class="pow-hash-label">Computing:</span>
        <code 
          class="pow-hash-value"
          :class="{ 'success': status === 'success' }"
        >
          {{ hashProgressText }}
        </code>
      </div>

      <!-- Progress Bar -->
      <div class="pow-progress-container">
        <div 
          class="pow-progress-bar"
          :class="{ 'success': status === 'success' }"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>
  </div>
  
  <!-- Help Modal -->
  <Teleport to="body">
    <div
      v-if="showHelpModal"
      class="pow-modal-overlay"
      @click="showHelpModal = false"
    >
      <div
        class="pow-modal"
        @click.stop
      >
        <div class="pow-modal-header">
          <h3 class="pow-modal-title">What is Proof of Work?</h3>
          <button
            type="button"
            class="pow-modal-close"
            @click="showHelpModal = false"
            aria-label="Close modal"
          >
            <svg
              class="pow-close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div class="pow-modal-body">
          <div class="pow-modal-section">
            <h4 class="pow-modal-subtitle">Why do we use this?</h4>
            <p class="pow-modal-text">
              Proof of Work (PoW) is a security mechanism that helps protect our service from automated bots and spam. 
              It requires your device to perform a small computational task before submitting forms.
            </p>
          </div>
          
          <div class="pow-modal-section">
            <h4 class="pow-modal-subtitle">How does it work?</h4>
            <p class="pow-modal-text">
              Your browser will compute a cryptographic puzzle by finding a special number (nonce) that, when combined 
              with our challenge data, produces a hash with specific properties. This process typically takes 5-30 seconds 
              depending on the difficulty level and your device's speed.
            </p>
          </div>
          
          <div class="pow-modal-section">
            <h4 class="pow-modal-subtitle">What you'll see:</h4>
            <ul class="pow-modal-list">
              <li>A progress bar showing the computation status</li>
              <li>Best hash found so far (updates as work progresses)</li>
              <li>Automatic completion when the solution is found</li>
            </ul>
          </div>
          
          <div class="pow-modal-section">
            <h4 class="pow-modal-subtitle">Privacy & Security</h4>
            <p class="pow-modal-text">
              This process happens entirely in your browser. No personal data is collected or transmitted during 
              the proof of work computation. It's simply a way to verify that a real person is using our service.
            </p>
          </div>

          <div class="pow-modal-section">
            <h4 class="pow-modal-subtitle">Have more questions?</h4>
            <p class="pow-modal-text">
              Check out <a href="https://simple.wikipedia.org/wiki/Proof-of-work_system" class="underline text-secondary font-semibold cursor-pointer">Proof of Work</a> on Wikipedia for a overview of PoW,
              or refer to our <a href="https://github.com/Undelivered-io/ProofEngine" class="underline text-secondary font-semibold cursor-pointer">GitHub repository</a> for technical details.
            </p>
          </div>
        </div>
        
        <div class="pow-modal-footer">
          <button
            type="button"
            class="pow-modal-button"
            @click="showHelpModal = false"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Props
const props = defineProps({
  challenge: {
    type: String,
    default: ''
  },
  powUrl: {
    type: String,
    default: ''
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['completed', 'progress', 'error']);

// State
const status = ref('idle'); // idle, computing, success, error
const attempts = ref(0);
const smallestHash = ref('');
const difficulty = ref('');
const progressPercentage = ref(0);
const startTime = ref(0);
const showHelpModal = ref(false);

// PoW instance
let powInstance = null;
let currentChallengeId = null;

// Computed
const hashProgressText = computed(() => {
  if (!attempts.value || !startTime.value) return 'initializing...';
  
  const duration = (Date.now() - startTime.value) / 1000;
  const hashRate = duration > 1 ? Math.round(attempts.value / duration) : 0;
  const hashRateText = `[${hashRate.toString().padStart(hashRate.toString().length, ' ')}h/s]`;
  
  // If we're in success state, show the successful hash
  if (status.value === 'success') {
    const successHash = smallestHash.value || 'completed';
    return `${successHash} < ${difficulty.value} (${attempts.value} tries)`;
  }
  
  // During computation, show the hash comparison
  const hashDisplay = smallestHash.value || 'searching...';
  const difficultyDisplay = difficulty.value || 'loading...';
  
  return `${hashRateText} ${hashDisplay} < ${difficultyDisplay}`;
})

// Methods
const initializePow = async () => {
  if (!powInstance) {
    // Load the modern PoW script
    if (!window.PowChallenge) {
      await loadScript('/powScript.js');
    }
    powInstance = window.PowChallenge.create();
  }
  return powInstance;
}

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  })
}

const startChallenge = async () => {
  if (!props.challenge) {
    console.log('No challenge provided, skipping start');
    return;
  }
  
  console.log('Starting challenge with:', props.challenge);
  
  try {
    const pow = await initializePow();
    console.log('PoW initialized:', pow);
    
    // Reset state
    status.value = 'computing';
    attempts.value = 0;
    smallestHash.value = '';
    difficulty.value = '';
    progressPercentage.value = 0;
    startTime.value = Date.now();
    
    // Start the challenge
    currentChallengeId = await pow.startChallenge(props.challenge, {
      onProgress: handleProgress,
      onSuccess: handleSuccess,
      onError: handleError
    });
    
    console.log('Challenge started with ID:', currentChallengeId);
    
  } catch (error) {
    console.error('Failed to start challenge:', error);
    handleError(`Failed to start challenge: ${error.message}`);
  }
}

const handleProgress = (data) => {
  attempts.value = data.attempts || 0;
  difficulty.value = data.difficulty || '';
  
  // Always update smallestHash if provided
  if (data.smallestHash) {
    smallestHash.value = data.smallestHash;
  }
  
  // Calculate progress based on probability
  if (difficulty.value) {
    const difficultyLevel = parseInt(difficulty.value.replace(/[^0-9]/g, '').length * 4) || 1;
    const probabilityOfFailurePerAttempt = 1 - (1 / Math.pow(2, difficultyLevel));
    const probabilityOfSuccess = 1 - Math.pow(probabilityOfFailurePerAttempt, attempts.value);
    progressPercentage.value = Math.min(probabilityOfSuccess * 100, 95);
  }
  
  emit('progress', data);
}

const handleSuccess = (data) => {
  status.value = 'success';
  progressPercentage.value = 100;
  
  // Update the final successful hash if provided
  if (data.smallestHash) {
    smallestHash.value = data.smallestHash;
  }
  
  emit('completed', data.nonce);
}

const handleError = (errorMessage) => {
  status.value = 'error';
  emit('error', errorMessage);
}

const stopChallenge = () => {
  if (powInstance && currentChallengeId) {
    powInstance.stopChallenge(currentChallengeId);
    currentChallengeId = null;
  }
  status.value = 'idle';
}

const reset = () => {
  console.log('Resetting modern PoW component...');
  stopChallenge();
  if (powInstance) {
    powInstance.reset();
    powInstance = null;
  }
  status.value = 'idle';
  attempts.value = 0;
  smallestHash.value = '';
  difficulty.value = '';
  progressPercentage.value = 0;
  startTime.value = 0;
  currentChallengeId = null;
}

// Public methods for parent component
const triggerPow = () => {
  startChallenge();
}

// Expose methods
defineExpose({
  triggerPow,
  reset,
  stopChallenge
});

// Watch for challenge changes
watch(() => props.challenge, (newChallenge) => {
  if (newChallenge && status.value === 'idle') {
    nextTick(() => {
      startChallenge();
    });
  }
}, { immediate: true });

// Cleanup on unmount
onUnmounted(() => {
  stopChallenge();
  if (powInstance) {
    powInstance.reset();
  }
});
</script>

<style>
:root {
  --pow-primary-color: #2563eb;
  --pow-success-color: #21bd5b;
  --pow-warning-color: #ddb95a;
  --pow-error-color: #dc2626;
  --pow-bg-light: #f8fafc;
  --pow-bg-dark: #1e293b;
  --pow-border-light: #e2e8f0;
  --pow-border-dark: #334155;
  --pow-text-light: #1f2937;
  --pow-text-dark: #f1f5f9;
  --pow-text-muted: #64748b;
}

/* Main container */
.pow-container {
  background: var(--pow-bg-light);
  border: 1px solid var(--pow-border-light);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.pow-container.dark {
  background: var(--ui-bg-muted, var(--pow-bg-dark));
  border-color: var(--pow-border-dark);
  color: var(--ui-text, var(--pow-text-dark));
}

.pow-container.hidden {
  display: none;
}

/* Header section */
.pow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.pow-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pow-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.3s ease;
}

.pow-icon.shield {
  color: var(--pow-primary-color);
}

.pow-icon.success {
  color: var(--pow-success-color);
}

.pow-icon.computing {
  color: var(--pow-warning-color);
  animation: pow-spin 1s linear infinite;
}

@keyframes pow-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pow-title {
  font-weight: 600;
  color: var(--pow-text-light);
  margin: 0;
}

.pow-container.dark .pow-title {
  color: var(--pow-text-dark);
}

.pow-subtitle {
  font-size: 0.75rem;
  color: var(--ui-text-muted, var(--pow-text-muted));
  margin: 0;
}

/* Description */
.pow-description {
  color: var(--ui-text-muted, var(--pow-text-muted));
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.pow-description a {
  color: var(--pow-primary-color);
  text-decoration: none;
}

.pow-description a:hover {
  text-decoration: underline;
}

/* Progress section */
.pow-progress-section {
  margin-top: 0.75rem;
}

.pow-hash-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.pow-hash-label {
  color: var(--ui-text-muted, var(--pow-text-muted));
}

.pow-hash-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background: var(--pow-warning-color);
  color: var(--ui-text-inverted, var(--pow-text-light));
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.pow-hash-value.success {
  background: var(--pow-success-color);
  color: var(--ui-text-inverted, var(--pow-text-light));
}

/* Progress bar */
.pow-progress-container {
  background: var(--pow-border-light);
  border-radius: 9999px;
  height: 0.5rem;
  overflow: hidden;
  margin-top: 0.5rem;
}

.pow-container.dark .pow-progress-container {
  background: var(--pow-border-dark);
}

.pow-progress-bar {
  background: var(--pow-warning-color);
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease-out;
  width: 0;
}

.pow-progress-bar.success {
  background: var(--pow-success-color);
  width: 100%;
}

/* States */
.pow-container.computing {
  border-color: var(--pow-warning-color);
}

.pow-container.success {
  border-color: var(--pow-success-color);
}

.pow-container.error {
  border-color: var(--pow-error-color);
}

/* Success state */
.pow-success-message {
  color: var(--pow-success-color);
  font-weight: 500;
  margin-top: 0.5rem;
}

.pow-success-message a {
  color: var(--pow-success-color);
  text-decoration: underline;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 640px) {
  .pow-container {
    padding: 0.75rem;
    font-size: 0.8125rem;
  }

  .pow-hash-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pow-container:not(.force-light) {
    background: var(--pow-bg-dark);
    border-color: var(--pow-border-dark);
    color: var(--pow-text-dark);
  }

  .pow-container:not(.force-light) .pow-title {
    color: var(--pow-text-dark);
  }
}

/* Help Button */
.pow-help-button {
  background: transparent;
  border: 1px solid var(--pow-border-light);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--pow-text-muted);
}

.pow-help-button:hover {
  background: var(--pow-bg-light);
  border-color: var(--pow-primary-color);
  color: var(--pow-primary-color);
}

.pow-container.dark .pow-help-button {
  border-color: var(--pow-border-dark);
}

.pow-container.dark .pow-help-button:hover {
  background: var(--pow-bg-dark);
}

.pow-help-icon {
  width: 14px;
  height: 14px;
}

/* Modal Overlay */
.pow-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

/* Modal Container */
.pow-modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .pow-modal {
    background: var(--pow-bg-dark);
    color: var(--pow-text-dark);
  }
}

/* Modal Header */
.pow-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--pow-border-light);
}

@media (prefers-color-scheme: dark) {
  .pow-modal-header {
    border-color: var(--pow-border-dark);
  }
}

.pow-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--pow-text-light);
}

@media (prefers-color-scheme: dark) {
  .pow-modal-title {
    color: var(--pow-text-dark);
  }
}

.pow-modal-close {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--pow-text-muted);
  transition: color 0.2s ease;
}

.pow-modal-close:hover {
  color: var(--pow-text-light);
}

@media (prefers-color-scheme: dark) {
  .pow-modal-close:hover {
    color: var(--pow-text-dark);
  }
}

.pow-close-icon {
  width: 20px;
  height: 20px;
}

/* Modal Body */
.pow-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.pow-modal-section {
  margin-bottom: 1.5rem;
}

.pow-modal-section:last-child {
  margin-bottom: 0;
}

.pow-modal-subtitle {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--pow-text-light);
}

@media (prefers-color-scheme: dark) {
  .pow-modal-subtitle {
    color: var(--pow-text-dark);
  }
}

.pow-modal-text {
  margin: 0;
  line-height: 1.6;
  color: var(--pow-text-muted);
}

.pow-modal-list {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
  list-style-type: disc;
  color: var(--pow-text-muted);
  line-height: 1.6;
}

/* Modal Footer */
.pow-modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--pow-border-light);
  display: flex;
  justify-content: flex-end;
}

@media (prefers-color-scheme: dark) {
  .pow-modal-footer {
    border-color: var(--pow-border-dark);
  }
}

.pow-modal-button {
  background: var(--pow-primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pow-modal-button:hover {
  background: #1d4ed8;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>