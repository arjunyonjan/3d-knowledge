import { Cpu } from 'lucide-preact'

export default function Header() {
  return (
    <div id="header">
      <div class="header-l" />
      <div class="header-c">
        <Cpu size={14} color="#00ffaa" style={{ opacity: 0.6 }} />
        <span class="header-tag">SYS::WEEK06</span>
        <span class="header-title">Sequence Models & Attention</span>
        <span class="header-byline">powered by yonjan ventures</span>
      </div>
      <div class="header-r" />
    </div>
  )
}
