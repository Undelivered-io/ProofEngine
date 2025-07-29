class PowChallenge {
  constructor() {
    this.workers = []
    this.challenges = new Map()
    this.isInitialized = false
    this.workerCount = 4
  }

  async initialize() {
    if (this.isInitialized) return
    
    try {
      // console.log('Initializing PoW workers...')
      
      // Create workers
      for (let i = 0; i < this.workerCount; i++) {
        const worker = new Worker('/proofOfWorker.js')
        worker.addEventListener('message', (e) => this.handleWorkerMessage(e, i))
        worker.addEventListener('error', (e) => this.handleWorkerError(e, i))
        this.workers.push(worker)
        // console.log(`Created worker ${i}`)
      }
      
      // Give workers time to initialize WASM
      await new Promise(resolve => setTimeout(resolve, 1000))
      // console.log('Workers initialized, waiting for WASM to load...')
      
      this.isInitialized = true
    } catch (error) {
      throw new Error(`Failed to initialize PoW workers: ${error.message}`)
    }
  }

  async startChallenge(challengeBase64, callbacks = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const challengeId = this.generateChallengeId()
    const challenge = {
      id: challengeId,
      challengeBase64,
      callbacks,
      startTime: Date.now(),
      attempts: 0,
      smallestHash: '',
      status: 'running'
    }

    this.challenges.set(challengeId, challenge)
    
    // Store the current challenge for this instance
    this.currentChallengeId = challengeId
    this.currentChallenge = challengeBase64

    // Send challenge to all workers
    this.workers.forEach((worker, index) => {
      // console.log(`Sending challenge to worker ${index}`)
      worker.postMessage({
        challenge: challengeBase64,
        workerId: index
      })
    })

    // Trigger progress callback
    if (callbacks.onProgress) {
      callbacks.onProgress({
        attempts: 0,
        status: 'started'
      })
    }

    return challengeId
  }

  stopChallenge(challengeId) {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) return

    challenge.status = 'stopped'
    
    // Stop all workers for this challenge
    this.workers.forEach(worker => {
      worker.postMessage({ stop: true })
    })

    this.challenges.delete(challengeId)
    
    // Clear current challenge reference
    if (this.currentChallengeId === challengeId) {
      this.currentChallengeId = null
      this.currentChallenge = null
    }
  }

  stopAllChallenges() {
    // console.log('Stopping all challenges...')
    
    // Stop all workers
    this.workers.forEach(worker => {
      worker.postMessage({ stop: true })
    })
    
    // Clear all challenges
    this.challenges.clear()
    this.currentChallengeId = null
    this.currentChallenge = null
  }

  reset() {
    // console.log('Resetting PoW system...')
    this.stopAllChallenges()
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.challenges.clear()
    this.currentChallengeId = null
    this.currentChallenge = null
    this.isInitialized = false
  }

  handleWorkerMessage(event, workerId) {
    const { data } = event
    const { type } = data
    
    // Handle compatibility with original worker that doesn't send challengeId
    // Use currentChallengeId as fallback
    const challengeId = data.challengeId || this.currentChallengeId
    
    // If no challenge ID available, ignore the message silently
    if (!challengeId) {
      return
    }
    
    const challenge = this.challenges.get(challengeId)
    if (!challenge) {
      // Challenge not found - likely already completed or cleaned up
      return
    }
    
    if (challenge.status !== 'running') {
      // Challenge is not running - ignore messages from workers that haven't stopped yet
      return
    }

    // console.log(`Worker ${workerId} message:`, type, data)

    switch (type) {
      case 'progress':
        challenge.attempts += data.attempts || 0
        if (!challenge.smallestHash || data.smallestHash < challenge.smallestHash) {
          challenge.smallestHash = data.smallestHash
        }
        
        if (challenge.callbacks.onProgress) {
          challenge.callbacks.onProgress({
            attempts: challenge.attempts,
            smallestHash: challenge.smallestHash,
            difficulty: data.difficulty,
            workerId
          })
        }
        break

      case 'success':
        if (challenge.status === 'running') {
          challenge.status = 'completed'
          // console.log(`Challenge ${challengeId} completed successfully`)
          
          if (challenge.callbacks.onSuccess) {
            challenge.callbacks.onSuccess({
              nonce: data.nonce,
              attempts: challenge.attempts,
              duration: Date.now() - challenge.startTime,
              smallestHash: data.smallestHash
            })
          }
          
          // Stop the challenge after callback to avoid race conditions
          this.stopChallenge(challengeId)
        }
        break

      case 'error':
        challenge.status = 'error'
        console.error(`Challenge ${challengeId} failed:`, data.message)
        
        if (challenge.callbacks.onError) {
          challenge.callbacks.onError(data.message || 'Unknown worker error')
        }
        
        // Stop the challenge after callback
        this.stopChallenge(challengeId)
        break
    }
  }

  handleWorkerError(error, workerId) {
    console.error(`PoW Worker ${workerId} error:`, error)
    
    // Find challenges that might be affected
    this.challenges.forEach((challenge, challengeId) => {
      if (challenge.status === 'running' && challenge.callbacks.onError) {
        challenge.callbacks.onError(`Worker ${workerId} encountered an error`)
      }
    })
  }

  generateChallengeId() {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Static factory method
  static create() {
    return new PowChallenge()
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PowChallenge
}

// Global for browser compatibility
if (typeof window !== 'undefined') {
  window.PowChallenge = PowChallenge
}