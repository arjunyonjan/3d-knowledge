let utterance = null
let speaking = false
let selectedVoice = null
let _onEnd = null

function findBestVoice() {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const priority = [
    v => /Google UK English Female/i.test(v.name) ? 10 : 0,
    v => /Google UK English/i.test(v.name) ? 9 : 0,
    v => /Google US English/i.test(v.name) ? 8 : 0,
    v => /Google.*English/i.test(v.name) ? 7 : 0,
    v => /Microsoft.*English/i.test(v.name) ? 6 : 0,
    v => /English/i.test(v.name) ? 3 : 0,
    v => v.name.includes('Female') ? 0.5 : 0,
  ]

  let best = voices[0]
  let bestScore = -1
  for (const v of voices) {
    let score = 0
    for (const fn of priority) score += fn(v)
    if (score > bestScore) { bestScore = score; best = v }
  }
  return best
}

function ensureVoices() {
  selectedVoice = findBestVoice()
  if (!selectedVoice && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      selectedVoice = findBestVoice()
    }
  }
}
ensureVoices()

export function speak(text, onEnd, speed) {
  if (!window.speechSynthesis) return
  _onEnd = null
  try { window.speechSynthesis.cancel() } catch(e) {}
  _onEnd = onEnd
  utterance = new SpeechSynthesisUtterance(text)
  if (selectedVoice) utterance.voice = selectedVoice
  const rateMap = { fast: 1.0, mid: 0.82, slow: 0.6 }
  utterance.rate = rateMap[speed] || 0.82
  utterance.pitch = 1.0
  utterance.volume = 1
  utterance.onstart = () => { speaking = true }
  utterance.onend = () => { speaking = false; if (_onEnd) _onEnd() }
  utterance.onerror = () => { speaking = false; if (_onEnd) _onEnd() }
  window.speechSynthesis.speak(utterance)
}

export function stopSpeech() {
  if (!window.speechSynthesis) return
  _onEnd = null
  try { window.speechSynthesis.cancel() } catch(e) {}
  speaking = false
}

export function isSpeaking() { return speaking }
export function getVoiceName() { return selectedVoice ? selectedVoice.name : 'default' }
