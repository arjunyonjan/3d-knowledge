import { BookOpen } from 'lucide-preact'

export default function KnowledgeButton({ domain, onClick }) {
  const label = domain || 'Knowledge'
  return (
    <div id="knowledge-btn" onClick={onClick}>
      <BookOpen size={14} />
      <span>{label}</span>
    </div>
  )
}