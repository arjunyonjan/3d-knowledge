import { useRef, useEffect } from 'preact/hooks'
import { cacheClear } from '../utils/cache.js'

export default function ApiPanel({ visible, onClose, onGenerate, generating, setGenerating, setError, domain, onDomainChange }) {
  const panelRef = useRef(null)
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, left: 0, top: 0 })

  useEffect(() => {
    if (!visible) return
    const el = panelRef.current
    if (!el) return
    const d = dragRef.current
    el.style.left = ''; el.style.top = ''
    const onDown = (e) => {
      if (e.target.closest('.api-textarea') || e.target.closest('.api-actions')) return
      d.dragging = true
      const pt = e.touches ? e.touches[0] : e
      d.startX = pt.clientX
      d.startY = pt.clientY
      d.left = el.offsetLeft
      d.top = el.offsetTop
      el.style.cursor = 'grabbing'
    }
    const onMove = (e) => {
      if (!d.dragging) return
      const pt = e.touches ? e.touches[0] : e
      const dx = pt.clientX - d.startX
      const dy = pt.clientY - d.startY
      el.style.left = (d.left + dx) + 'px'
      el.style.top = (d.top + dy) + 'px'
      el.style.transform = 'none'
    }
    const onUp = () => {
      if (!d.dragging) return
      d.dragging = false
      el.style.cursor = ''
    }
    el.addEventListener('mousedown', onDown)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [visible])

  if (!visible) return null

  const handleGenerate = async () => {
    if (!domain.trim()) { setError('Paste some knowledge first'); return }
    setGenerating(true)
    setError('')
    try {
      await onGenerate(domain)
    } catch (e) {
      setError(e.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div id="api-panel" ref={panelRef}>
      <div class="api-header" style={{ cursor: 'grab' }}>
        <span class="api-title">Configure Domain</span>
        <span class="api-close" onClick={onClose}>✕</span>
      </div>
      <textarea
        class="api-textarea"
        placeholder="Paste your knowledge here..."
        value={domain}
        onInput={(e) => onDomainChange(e.target.value)}
        rows={6}
        disabled={generating}
      />
      <div class="api-actions">
        <button class="api-btn primary" onClick={handleGenerate} disabled={generating}>
          {generating ? <span class="api-spinner" /> : 'Generate'}
        </button>
        <button class="api-btn" onClick={() => { cacheClear(); setError('Cache cleared') }}>Clear Cache</button>
      </div>
    </div>
  )
}
