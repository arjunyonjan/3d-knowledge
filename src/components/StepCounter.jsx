import { TOPICS, CARD_COLORS } from '../data/theme.js'
import * as Icons from 'lucide-preact'

export default function StepCounter({ current, onSelect }) {
  const isTour = current >= 0
  return (
    <div style={{
      position:'fixed', bottom:16, left:0, right:0, display:'flex', justifyContent:'center', gap:14, zIndex:12, pointerEvents:'none', padding:'8px 0',
      opacity: isTour ? 1 : 0.15, transition:'opacity 0.4s'
    }}>
      {TOPICS.map((t, i) => {
        const active = i === current
        const color = CARD_COLORS[i] || '#00ffaa'
        const Icon = Icons[t.lucide] || Icons.Circle
        return (
          <button
            onClick={() => onSelect && onSelect(i)}
            style={{
              width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              background: active ? color : 'transparent',
              borderColor: active ? color : 'rgba(255,255,255,0.1)',
              borderWidth:1, borderStyle:'solid',
              boxShadow: active ? '0 0 16px ' + color : 'none',
              transition:'all 0.3s', padding:0,
              pointerEvents:'auto',
            }}
          >
            <Icon size={14} color={active ? '#030712' : 'rgba(255,255,255,0.3)'} />
          </button>
        )
      })}
    </div>
  )
}
