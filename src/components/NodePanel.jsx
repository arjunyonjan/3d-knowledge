import { useState, useEffect, useRef } from 'preact/hooks'
import { FileText, Video, MessageCircle, X } from 'lucide-preact'

const TABS = [
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'media', label: 'Media', icon: Video },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
]

function loadNodeData(id) {
  try { return JSON.parse(localStorage.getItem(`node-${id}`)) || {} } catch { return {} }
}

function saveNodeData(id, data) {
  localStorage.setItem(`node-${id}`, JSON.stringify(data))
}

export default function NodePanel({ step, topics, visible, onClose, timerProgress }) {
  const [tab, setTab] = useState('notes')
  const [nodeData, setNodeData] = useState({})
  const [notes, setNotes] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [chatMsg, setChatMsg] = useState('')
  const chatEnd = useRef(null)

  const topic = topics?.[step]
  const isOpen = visible && step >= 0 && topic

  // Load/save node data when step changes
  useEffect(() => {
    if (step < 0) return
    const data = loadNodeData(step)
    setNodeData(data)
    setNotes(data.notes || '')
    setMediaUrl('')
  }, [step])

  // Auto-save notes with debounce
  useEffect(() => {
    if (step < 0) return
    const timer = setTimeout(() => {
      const data = loadNodeData(step)
      data.notes = notes
      saveNodeData(step, data)
      setNodeData(data)
    }, 500)
    return () => clearTimeout(timer)
  }, [notes, step])

  // Scroll chat to bottom
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [nodeData.chat])

  const addMedia = () => {
    if (!mediaUrl.trim()) return
    const data = loadNodeData(step)
    const type = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? 'youtube' : 'iframe'
    data.media = [...(data.media || []), { type, url: mediaUrl }]
    saveNodeData(step, data)
    setNodeData(data)
    setMediaUrl('')
  }

  const sendChat = () => {
    if (!chatMsg.trim()) return
    const data = loadNodeData(step)
    data.chat = [...(data.chat || []), { text: chatMsg, ts: Date.now() }]
    saveNodeData(step, data)
    setNodeData(data)
    setChatMsg('')
  }

  if (!isOpen) return null

  const r = 20, cx = 24, cy = 24, circ = 2 * Math.PI * r
  const pct = timerProgress ? timerProgress.ratio : 0
  const offset = circ * (1 - pct)
  const secs = timerProgress ? Math.max(0, Math.ceil(timerProgress.delay - timerProgress.elapsed)) : 0

  return (
    <div id="node-panel" class="open">
      <div class="np-header">
        <div class="np-title">
          <span class="np-step">STEP {step + 1}</span>
          <span class="np-name">{topic.title?.toUpperCase()}</span>
        </div>
        <div class="np-close" onClick={onClose}><X size={16} /></div>
      </div>

      <div class="np-tabs">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <div key={t.id} class={'np-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
              <Icon size={14} />
              <span>{t.label}</span>
            </div>
          )
        })}
      </div>

      <div class="np-body">
        {tab === 'notes' && (
          <textarea class="np-notes"
            value={notes}
            onInput={e => setNotes(e.target.value)}
            placeholder="Write notes about this node..."
          />
        )}

        {tab === 'media' && (
          <div class="np-media">
            <div class="np-media-input">
              <input value={mediaUrl} onInput={e => setMediaUrl(e.target.value)}
                placeholder="Paste YouTube URL or embed link" />
              <button onClick={addMedia}>Add</button>
            </div>
            <div class="np-media-list">
              {(nodeData.media || []).map((m, i) => (
                <div key={i} class="np-media-item">
                  {m.type === 'youtube' ? (
                    <iframe src={`https://www.youtube.com/embed/${new URL(m.url).searchParams.get('v') || m.url.split('/').pop()}`}
                      frameborder="0" allowfullscreen />
                  ) : (
                    <iframe src={m.url} frameborder="0" />
                  )}
                </div>
              ))}
              {!(nodeData.media || []).length && <div class="np-empty">No media added yet</div>}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div class="np-chat">
            <div class="np-chat-log">
              {(nodeData.chat || []).map((m, i) => (
                <div key={i} class="np-msg">
                  <span class="np-msg-text">{m.text}</span>
                  <span class="np-msg-ts">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
              {!(nodeData.chat || []).length && <div class="np-empty">No messages yet</div>}
              <div ref={chatEnd} />
            </div>
            <div class="np-chat-input">
              <input value={chatMsg} onInput={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..." />
              <button onClick={sendChat}>Send</button>
            </div>
          </div>
        )}
      </div>

      <div class="np-footer">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00ffaa" strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 24 24)"
            style={{ transition: 'stroke-dashoffset 0.3s linear' }} />
        </svg>
        <span class="np-timer-label">{secs}s</span>
      </div>
    </div>
  )
}