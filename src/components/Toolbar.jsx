import { useState, useEffect } from 'preact/hooks'
import { Settings, Zap, Brain, Play, Maximize2, Minimize2 } from 'lucide-preact'

const SPEEDS = ['fast', 'mid', 'slow']
const SPEED_ICONS = { fast: 'Fast', mid: 'Mid', slow: 'Slow' }
const LEVELS = ['child', 'layman', 'pro']
const LEVEL_ICONS = { child: 'Child', layman: 'Lay', pro: 'Pro' }

export default function Toolbar({ speed, level, onSpeedChange, onLevelChange, onSettingsClick, showStart, onStartClick }) {
  const [fs, setFs] = useState(false)

  useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFs = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  return (
    <div id="toolbar">
      <div class="tb-icon" onClick={onSettingsClick} title="Configure">
        <Settings size={16} color="#00ffaa" />
      </div>
      <div class="tb-icon" onClick={() => onSpeedChange(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])} title={SPEED_ICONS[speed]}>
        <Zap size={16} color="#fbbf24" />
        <span class="tb-badge">{SPEED_ICONS[speed][0]}</span>
      </div>
      <div class="tb-icon" onClick={() => onLevelChange(LEVELS[(LEVELS.indexOf(level) + 1) % LEVELS.length])} title={LEVEL_ICONS[level]}>
        <Brain size={16} color="#a78bfa" />
        <span class="tb-badge">{LEVEL_ICONS[level].slice(0, 2)}</span>
      </div>
      <div class="tb-icon" onClick={toggleFs} title={fs ? 'Exit fullscreen' : 'Fullscreen'}>
        {fs ? <Minimize2 size={16} color="#9ca3af" /> : <Maximize2 size={16} color="#9ca3af" />}
      </div>
      {showStart && (
        <div class="tb-icon tb-start-icon" onClick={onStartClick} title="Start Tour">
          <Play size={16} color="#00ffaa" />
        </div>
      )}
    </div>
  )
}