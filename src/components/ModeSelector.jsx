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

export default function ModeSelector({ speed, level, onSpeedChange, onLevelChange, disabled }) {
  return (
    <div class="mode-selector">
      <div class="mode-group">
        {SPEEDS.map(s => (
          <span
            key={s.id}
            class={'mode-chip' + (speed === s.id ? ' active' : '') + (disabled ? ' disabled' : '')}
            onClick={() => !disabled && onSpeedChange(s.id)}
          >{s.label}</span>
        ))}
      </div>
      <div class="mode-divider" />
      <div class="mode-group">
        {LEVELS.map(l => (
          <span
            key={l.id}
            class={'mode-chip' + (level === l.id ? ' active' : '') + (disabled ? ' disabled' : '')}
            onClick={() => !disabled && onLevelChange(l.id)}
          >{l.label}</span>
        ))}
      </div>
    </div>
  )
}
