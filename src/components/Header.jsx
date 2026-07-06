import { Cpu, Settings } from 'lucide-preact'
import ModeSelector from './ModeSelector.jsx'

export default function Header({ speed, level, onSpeedChange, onLevelChange, onSettingsClick, showSettings }) {
  return (
    <div id="header">
      <div class="header-l" />
      <div class="header-c">
        <Cpu size={14} color="#00ffaa" style={{ opacity: 0.6 }} />
        <span class="header-tag">SYS::WEEK06</span>
        <span class="header-title">Sequence Models & Attention</span>
        <span class="header-byline">powered by yonjan ventures</span>
        <div class="header-sep" />
        <ModeSelector speed={speed} level={level} onSpeedChange={onSpeedChange} onLevelChange={onLevelChange} />
        <Settings
          size={14}
          color={showSettings ? '#00ffaa' : '#6b7280'}
          class="gear-icon"
          onClick={(e) => { e.stopPropagation(); onSettingsClick() }}
        />
      </div>
      <div class="header-r" />
    </div>
  )
}
