## MEMORY Backup — 3d-knowledge-ai

# 3D Knowledge AI — Session Log

> 3D Graph visualization with dynamic node content, tour, TTS, and AI generation.

---

## Session — 2026-07-06

### Completed
| Time | Task | Detail |
|------|------|--------|
| 08:00 | Inactive card dimming | Non-focused cards fade to 30% opacity, smooth lerp |
| 08:15 | API key input removed | Key set server-side (Vercel) + `.env` only |
| 08:30 | Minimal toolbar | 3 icons (Configure, Speed, Level) + Play + Fullscreen |
| 08:35 | StepCounter hidden | `display:none`, code kept for later |
| 08:45 | Billboard effect | Expanded cards rotate to face camera via slerp |
| 09:00 | Timer display | Circular countdown ring (SVG) bottom-right during tour |
| 09:15 | Random gen button | Sparkles icon left-center, opens ApiPanel with random domain |
| 09:30 | Fullscreen toggle | Toolbar icon + auto-request on first user click |
| 09:45 | HTTPS via basic-ssl | Self-signed cert for secure context (Fullscreen API) |
| 10:00 | serve.sh script | `bash serve.sh` — nohup+disown, prints URL |
| 10:15 | memory.md created | Session log + context in project root |

### Project Structure
```
src/
├── components/
│   ├── ThreeCanvas.jsx     — Three.js scene + TourController + timer tick
│   ├── ApiPanel.jsx         — Knowledge input + Generate button
│   ├── Toolbar.jsx          — Minimal icon bar (Config/Speed/Level/Fullscreen/Play)
│   ├── Header.jsx           — Top bar with branding
│   ├── CodePanel.jsx        — Code display during tour
│   ├── StepCounter.jsx      — Step dots (hidden)
│   ├── TimerDisplay.jsx     — SVG countdown ring
│   ├── RandomGenButton.jsx  — Sparkles random knowledge button
│   └── ModeSelector.jsx     — Speed/Level chips (legacy)
├── three/
│   ├── Card3D.js            — 3D card with dim/billboard/update
│   ├── TreeManager.js       — Tree layout + card management
│   ├── TourController.js    — Tour auto-advance + getProgress()
│   └── SceneManager.js      — Scene, camera, controls, lights
├── utils/
│   ├── deepseek.js          — AI generation (Vercel API + fallback)
│   └── cache.js             — localStorage LRU cache
├── data/
│   ├── theme.js             — Default topics, colors
│   └── tree.js              — Default positions, edges
└── App.jsx                  — Root component
```

### Key Commands
```bash
# Dev server
bash serve.sh                    # Start HTTPS on localhost:3000+

# Build
node node_modules/.bin/vite build

# Sync to OneDrive vault
rclone copy /data/data/com.termux/files/home/week6-sequence-models-attention/memory.md onedrive:/"Obsidian Vault"/opencode/3d-knowledge-ai.md
```

### Key Learnings
- `setsid` + `nohup` combo: `nohup cmd > log 2>&1 & disown` — survives shell kill
- Fullscreen API requires secure context (HTTPS) on modern browsers
- `@vitejs/plugin-basic-ssl` generates self-signed cert automatically
- Vite HMR works for most JSX changes, full rebuild needed for config changes
- Three.js `quaternion.slerp()` + camera quaternion = smooth billboard rotation

### Next Steps (v0.4+)
See `3d-knowledge-ai-plans.md` for full plan:
- Dynamic Node Content Panel (notes, media embeds, chat, timer)
- Slide-out billboard replacing CodePanel
- Per-node localStorage persistence
