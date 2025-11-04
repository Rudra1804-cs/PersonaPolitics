// Web Audio API utility for playing event notification sounds
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Play a tone based on urgency level
export function playEventSound(urgency: "low" | "medium" | "high") {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Set frequency based on urgency
    const frequencies = {
      low: 440, // A4
      medium: 554.37, // C#5
      high: 659.25, // E5
    }

    oscillator.frequency.value = frequencies[urgency]
    oscillator.type = "sine"

    // Set volume envelope
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    oscillator.start(now)
    oscillator.stop(now + 0.3)
  } catch (error) {
    console.warn("[v0] Audio playback failed:", error)
  }
}
