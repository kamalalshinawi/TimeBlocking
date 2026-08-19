let audioContext: AudioContext | null = null

function tone(frequency: number, start: number, duration: number, volume = 0.08) {
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, audioContext.currentTime + start)
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + start + duration)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(audioContext.currentTime + start)
  oscillator.stop(audioContext.currentTime + start + duration + 0.05)
}

export function playCompletionSound(): void {
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
    tone(880, 0, 0.5)
    tone(1108.73, 0.25, 0.5)
    tone(1318.51, 0.5, 0.5)
  } catch {
    audioContext = null
  }
}