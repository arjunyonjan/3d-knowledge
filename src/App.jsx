import { useState, useEffect, useRef } from 'preact/hooks'
import ThreeCanvas from './components/ThreeCanvas.jsx'
import Header from './components/Header.jsx'
import NodePanel from './components/NodePanel.jsx'
import Toolbar from './components/Toolbar.jsx'
import StepCounter from './components/StepCounter.jsx'
import ApiPanel from './components/ApiPanel.jsx'
import TimerDisplay from './components/TimerDisplay.jsx'
import RandomGenButton from './components/RandomGenButton.jsx'
import KnowledgeButton from './components/KnowledgeButton.jsx'
import { speak, stopSpeech } from './utils/tts.js'
import { TOPICS as DEFAULT_TOPICS } from './data/theme.js'
import { treePositions as DEFAULT_POSITIONS, treeEdges as DEFAULT_EDGES } from './data/tree.js'
import { computeTreePositions } from './utils/treeLayout.js'
import { cacheGet, cacheSet } from './utils/cache.js'
import { generateFromDomain } from './utils/deepseek.js'

const RANDOM_SEEDS = [
  'business', 'travel', 'philosophy', 'science',
  'fashion', 'entertainment', 'technology', 'psychology',
  'history', 'art', 'music', 'medicine',
  'architecture', 'sports', 'food', 'finance'
]

function pickRandom() {
  return RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)]
}

export default function App() {
  const [tourStep, setTourStep] = useState(-1)
  const [showStart, setShowStart] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const [speed, setSpeed] = useState('mid')
  const [level, setLevel] = useState('layman')

  const [topics, setTopics] = useState(DEFAULT_TOPICS)
  const [positions, setPositions] = useState(DEFAULT_POSITIONS)
  const [edges, setEdges] = useState(DEFAULT_EDGES)

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [currentDomain, setCurrentDomain] = useState('')
  const [timerProgress, setTimerProgress] = useState(null)
  const [streamContent, setStreamContent] = useState('')
  const [showStream, setShowStream] = useState(false)

  const autoTimer = useRef(null)
  const fsAttempted = useRef(false)

  // Auto fullscreen on first user interaction
  useEffect(() => {
    const go = () => {
      if (fsAttempted.current) return
      fsAttempted.current = true
      document.removeEventListener('click', go)
      document.removeEventListener('touchstart', go)
      // Delay slightly so browser registers the gesture
      setTimeout(() => {
        try { document.documentElement.requestFullscreen() } catch (e) {
          // Try alternative: request from a child element
          try { document.getElementById('three-container')?.requestFullscreen() } catch {}
        }
      }, 100)
    }
    document.addEventListener('click', go, { once: true })
    document.addEventListener('touchstart', go, { once: true })
    return () => { document.removeEventListener('click', go); document.removeEventListener('touchstart', go) }
  }, [])

  const isTour = tourStep >= 0

  useEffect(() => {
    if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null }

    if (tourStep >= 0) {
      const t = topics[tourStep]
      const iconName = (t.lucide || '').replace(/([A-Z])/g, ' $1').trim().toUpperCase()
      const speechText = `${iconName}. ${t.title}. ${t.explanation}`

      speak(speechText, () => {
        autoTimer.current = setTimeout(() => {
          if (window.__tourNext) window.__tourNext()
        }, 2000)
      }, speed)
    } else {
      stopSpeech()
    }
  }, [tourStep])

  const handleGenerate = async (domain) => {
    setCurrentDomain(domain)
    setStreamContent('')
    setShowStream(true)
    const cached = cacheGet(domain, level)
    if (cached) {
      setTopics(cached.topics)
      setEdges(cached.edges)
      setPositions(computeTreePositions(cached.topics.length))
      setShowSettings(false)
      return
    }
    const data = await generateFromDomain(domain, level, null, (t) => setStreamContent(t))
    cacheSet(domain, level, { topics: data.topics, edges: data.edges })
    setTopics(data.topics)
    setEdges(data.edges)
    setPositions(computeTreePositions(data.topics.length))
    setShowSettings(false)
  }

  const handleLevelChange = (lvl) => {
    setLevel(lvl)
    if (currentDomain) {
      const cached = cacheGet(currentDomain, lvl)
      if (cached) {
        setTopics(cached.topics)
        setEdges(cached.edges)
        setPositions(computeTreePositions(cached.topics.length))
        return
      }
      setShowSettings(true)
    }
  }

  const handleStart = () => {
    setShowStart(false)
    setTourStep(0)
    if (window.__startTour) window.__startTour()
  }

  const handleRandomGenerate = async () => {
    const seed = pickRandom()
    setCurrentDomain(seed)
    setGenerating(true)
    try {
      await handleGenerate(seed)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <ThreeCanvas
        onTourStep={(idx) => setTourStep(idx)}
        topics={topics}
        positions={positions}
        edges={edges}
        speed={speed}
        onTimerTick={(p) => setTimerProgress(p)}
      />
      <Header />
      <KnowledgeButton domain={currentDomain} onClick={() => setShowSettings(!showSettings)} />
      <RandomGenButton onClick={handleRandomGenerate} />
      <TimerDisplay progress={!isTour ? timerProgress : null} />
      <ApiPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onGenerate={handleGenerate}
        generating={generating}
        setGenerating={setGenerating}
        setError={setError}
        domain={currentDomain}
        onDomainChange={setCurrentDomain}
      />
      <Toolbar
        speed={speed}
        level={level}
        onSpeedChange={setSpeed}
        onLevelChange={handleLevelChange}
        onSettingsClick={() => setShowSettings(!showSettings)}
        showStart={showStart}
        onStartClick={handleStart}
      />
      <NodePanel step={tourStep} topics={topics} visible={isTour}
        onClose={() => setTourStep(-1)} timerProgress={timerProgress} />
      <StepCounter current={isTour ? tourStep : -1} onSelect={isTour ? (i) => { setTourStep(i); if (window.__goToStep) window.__goToStep(i) } : undefined} />
      {isTour && (
        <>
          <div className="nav-btn prev-btn" onClick={() => {
            if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null }
            const i = Math.max(0, tourStep - 1)
            setTourStep(i); if (window.__goToStep) window.__goToStep(i)
          }}>&#8249;</div>
          <div className="nav-btn next-btn" onClick={() => {
            if (autoTimer.current) { clearTimeout(autoTimer.current); autoTimer.current = null }
            const i = Math.min(topics.length - 1, tourStep + 1)
            setTourStep(i); if (window.__goToStep) window.__goToStep(i)
          }}>&#8250;</div>
        </>
      )}
      {error && (
        <div id="error-toast" onClick={() => setError('')}>{error}</div>
      )}
      {(generating || streamContent) && (
        <div id="stream-panel" class={showStream ? 'expanded' : ''}>
          <div id="stream-bar" onClick={() => setShowStream(!showStream)}>
            <span class="stream-status">
              {generating ? <span class="stream-dot" /> : <span class="stream-done">✓</span>}
              {generating ? 'Generating...' : 'Done'}
            </span>
            <span class="stream-toggle">{showStream ? '▾ Hide' : '▸ Show'} stream</span>
          </div>
          {showStream && (
            <pre id="stream-content">{streamContent}</pre>
          )}
        </div>
      )}
    </>
  )
}
