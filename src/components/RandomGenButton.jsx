import { Sparkles } from 'lucide-preact'

export default function RandomGenButton({ onClick }) {
  return (
    <div id="random-gen-btn" onClick={onClick} title="Random knowledge">
      <Sparkles size={20} color="#00ffaa" />
    </div>
  )
}