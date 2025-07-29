export interface PowChallenge {
  N: number      // CPU and memory cost
  r: number      // Block size  
  p: number      // Parallelization
  klen: number   // Key length
  i: string      // Preimage (base64)
  d: string      // Difficulty (hex)
  dl: number     // Difficulty level
}

export interface PowState {
  isLoading: boolean
  isCompleted: boolean
  currentNonce: string | null
  error: string | null
  progress: {
    attempts: number
    smallestHash: string
    difficulty: string
  } | null
}

export const useProofEngine = () => {
  const state = reactive<PowState>({
    isLoading: false,
    isCompleted: false,
    currentNonce: null,
    error: null,
    progress: null
  })

  // PoW server configuration from runtime config
  const config = useRuntimeConfig()
  const PE_SERVER_URL = config.public.proofEngine.url

  // Generate a challenge by fetching from the backend
  const generateChallenge = async (): Promise<string> => {
    try {
      const response = await $fetch<string[]>(`${PE_SERVER_URL}/getChallenges`, {
        method: 'POST'
      })
      
      if (!response || response.length === 0) {
        throw new Error('No challenges received from server')
      }
      
      // Return the first challenge from the batch
      return response[0] as string
    } catch (error) {
      console.error('Failed to fetch challenge from server:', error)
      throw new Error(`Failed to generate challenge`)
    }
  }

  // Validate a PoW solution with the backend server
  const validatePow = async (challenge: string, nonce: string): Promise<boolean> => {
    try {
      await $fetch(`${PE_SERVER_URL}/verify`, {
        method: 'POST',
        query: {
          challenge: challenge,
          nonce: nonce
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // If the request succeeds, the PoW is valid
      return true
    } catch (error) {
      console.error('PoW validation failed:', error)
      return false
    }
  }

  // Handle PoW completion
  const onCompleted = async (nonce: string, challenge?: string) => {
    state.currentNonce = nonce
    state.isLoading = false
    state.error = null
    
    // Validate with server immediately when PoW completes
    if (challenge) {
      console.log('🔍 Validating PoW solution with server immediately...')
      try {
        const isValid = await validatePow(challenge, nonce)
        if (isValid) {
          state.isCompleted = true
          console.log('✅ Server validation successful!')
        } else {
          state.error = 'Server validation failed'
          console.error('❌ Server validation failed')
        }
      } catch (error) {
        state.error = `Validation error: ${error}`
        console.error('❌ Validation error:', error)
      }
    } else {
      // Fallback if no challenge provided (shouldn't happen)
      state.isCompleted = true
    }
  }

  // Handle PoW progress updates
  const onProgress = (data: { attempts: number, smallestHash: string, difficulty: string }) => {
    state.progress = data
    state.isLoading = true
  }

  // Handle PoW errors
  const onError = (message: string) => {
    state.error = message
    state.isLoading = false
  }

  // Reset state
  const reset = () => {
    state.isLoading = false
    state.isCompleted = false
    state.currentNonce = null
    state.error = null
    state.progress = null
  }

  // Check if PoW is required for a form submission
  const isPowRequired = (formData: FormData): boolean => {
    // Add your logic here to determine when PoW is required
    // For example, based on user authentication, rate limiting, etc.
    return true
  }

  return {
    state: readonly(state),
    generateChallenge,
    validatePow,
    onCompleted,
    onProgress, 
    onError,
    reset,
    isPowRequired
  }
}

export default useProofEngine