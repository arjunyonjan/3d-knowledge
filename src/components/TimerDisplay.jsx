export default function TimerDisplay({ progress }) {
  if (!progress) return null
  const r = 28, cx = 32, cy = 32, circ = 2 * Math.PI * r
  const offset = circ * (1 - progress.ratio)
  const secs = Math.max(0, Math.ceil(progress.delay - progress.elapsed))
  const active = progress.elapsed > 0
  return (
    <div id="timer-display" class={active ? 'active' : ''}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00ffaa" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.3s linear' }} />
      </svg>
      <span class="timer-label">{secs}s</span>
    </div>
  )
}