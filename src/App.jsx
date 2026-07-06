import { useState, useEffect, useRef } from 'preact/hooks'
import ThreeCanvas from './components/ThreeCanvas.jsx'
import Header from './components/Header.jsx'
import CodePanel from './components/CodePanel.jsx'
import StartButton from './components/StartButton.jsx'
import StepCounter from './components/StepCounter.jsx'
import ApiPanel from './components/ApiPanel.jsx'
import { speak, stopSpeech } from './utils/tts.js'
import { TOPICS as DEFAULT_TOPICS } from './data/theme.js'
import { treePositions as DEFAULT_POSITIONS, treeEdges as DEFAULT_EDGES } from './data/tree.js'
import { computeTreePositions } from './utils/treeLayout.js'
import { cacheGet, cacheSet } from './utils/cache.js'
import { generateFromDomain } from './utils/deepseek.js'

export default function App() {
  const [tourStep, setTourStep] = useState(-1)
  const [showStart, setShowStart] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const [speed, setSpeed] = useState('mid')
  const [level, setLevel] = useState('layman')

  const [topics, setTopics] = useState(DEFAULT_TOPICS)
  const [positions, setPositions] = useState(DEFAULT_POSITIONS)
  const [edges, setEdges] = useState(DEFAULT_EDGES)

  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_DEEPSEEK_KEY || localStorage.getItem('w06_api_key') || '')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [currentDomain, setCurrentDomain] = useState('')

  const autoTimer = useRef(null)

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
    const cached = cacheGet(domain, level)
    if (cached) {
      setTopics(cached.topics)
      setEdges(cached.edges)
      setPositions(computeTreePositions(cached.topics.length))
      setShowSettings(false)
      return
    }
    const data = await generateFromDomain(domain, level, apiKey)
    if (!apiKey) localStorage.setItem('w06_api_key', apiKey)
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

  return (
    <>
      <ThreeCanvas
        onTourStep={(idx) => setTourStep(idx)}
        topics={topics}
        positions={positions}
        edges={edges}
        speed={speed}
      />
      <Header
        speed={speed}
        level={level}
        onSpeedChange={setSpeed}
        onLevelChange={handleLevelChange}
        onSettingsClick={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
      />
      <ApiPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onGenerate={handleGenerate}
        apiKey={apiKey}
        setApiKey={setApiKey}
        generating={generating}
        setGenerating={setGenerating}
        setError={setError}
        domain={currentDomain}
        onDomainChange={setCurrentDomain}
      />
      <StartButton
        visible={showStart}
        onClick={() => {
          setShowStart(false)
          setTourStep(0)
          if (window.__startTour) window.__startTour()
        }}
      />
      <CodePanel step={tourStep} visible={isTour} />
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
      <div id="hint" style={{
        position:'fixed', bottom:40, left:0, right:0, margin:'0 auto', width:'fit-content',
        color:'#4b5563', fontSize:12, zIndex:10, opacity: isTour ? 0 : 0.6,
        transition:'opacity 0.3s', pointerEvents:'none', userSelect:'none'
      }}>
        Click a card to explore · Scroll to zoom · Drag to orbit
      </div>
    </>
  )
}
