import { Settings } from 'lucide-preact'

const SPEEDS = [
  { id: 'fast', label: 'Fast' },
  { id: 'mid', label: 'Mid' },
  { id: 'slow', label: 'Slow' },
]

const LEVELS = [
  { id: 'child', label: 'Child' },
  { id: 'layman', label: 'Layman' },
  { id: 'pro', label: 'Pro' },
]

export default function Toolbar({ speed, level, onSpeedChange, onLevelChange, onSettingsClick, showStart, onStartClick }) {
  return (
    <div id="toolbar">
      <div class="tb-section tb-config" onClick={onSettingsClick}>
        <Settings size={14} color="#00ffaa" style={{ opacity: 0.7 }} />
        <span class="tb-label">Configure</span>
      </div>
      <div class="tb-divider" />
      <div class="tb-section">
        {SPEEDS.map(s => (
          <span key={s.id} class={'tb-chip' + (speed === s.id ? ' active' : '')} onClick={() => onSpeedChange(s.id)}>{s.label}</span>
        ))}
      </div>
      <div class="tb-divider" />
      <div class="tb-section">
        {LEVELS.map(l => (
          <span key={l.id} class={'tb-chip' + (level === l.id ? ' active' : '')} onClick={() => onLevelChange(l.id)}>{l.label}</span>
        ))}
      </div>
      {showStart && (
        <>
          <div class="tb-divider" />
          <button class="tb-start" onClick={onStartClick}>▶ START</button>
        </>
      )}
    </div>
  )
}
