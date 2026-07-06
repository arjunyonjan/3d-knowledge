import { TOPICS } from '../data/theme.js'

export default function CodePanel({ step, visible }) {
  const t = TOPICS[step]
  if (!visible || !t) return null
  return (
    <div id="code-panel" class="visible">
      <div id="code-title">STEP {step + 1}  ·  {t.title.toUpperCase()}</div>
      <pre id="code-content">{t.code || ''}</pre>
    </div>
  )
}
