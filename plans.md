# Week 6 3D Visualizer — v0.2 Plans

## Vision
Replace hardcoded Week-6 data with a **dynamic domain explorer**. Paste any knowledge → AI generates a structured tree + tour + TTS on the fly.

---

## Learning Modes

### Speed (affects timing only, no regeneration)

| Mode  | TTS Rate | Auto-Advance     | Animation Speed |
|-------|----------|------------------|-----------------|
| Fast  | 1.0      | 6s               | 1.5x            |
| Mid   | 0.82     | 12s + speech-end | 1x              |
| Slow  | 0.6      | 15s + speech-end | 0.5x            |

- Fast: rapid overview, skips speech pauses
- Mid: balanced, waits for TTS to finish
- Slow: extra pauses, slower camera drift

### Level (content regeneration on change)

| Level    | Prompt Style                      | Card Text         | Code            |
|----------|-----------------------------------|-------------------|-----------------|
| Child    | 10yo level, fun analogies, emoji  | 1 short sentence  | No code / emoji |
| Layman   | Plain English, no jargon          | Current style     | Simple pseudo   |
| Pro      | Technical, proper terminology     | Full detail       | Keras/PyTorch   |

**Switching level while on the same domain → check cache → load or regenerate.**

---

## Data Flow

```
[Textarea: paste knowledge]
        |
        v
[Generate Button] ──→ [DeepSeek API] ──→ [Structured JSON]
        |                                      |
        v                                      v
[Cache]                              [Rebuild 3D Scene]
(domain_hash + "_" + level)          (tree + cards + tour + TTS)
```

### Cache Key
```
cache_key = md5(domain.trim().toLowerCase()) + "_" + level
```

### Regenerate Rules
- **Level switch (no cache)** → call DeepSeek → store → render
- **Level switch (cached)** → load from cache → render
- **Speed switch** → no regeneration, only adjust timing
- **New domain** → always regenerate (no cache for new domain)

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│ [⚙] SYS::WEEK06                 Fast [Mid] Slow │  ← Header with settings
│                                   Child [Layman] Pro │
├─────────────────────────────────────────────────┤
│                                                 │
│              3D Scene (full canvas)             │
│                                                 │
│  [◀]                                    [▶]    │  ← Tour nav
│                                                 │
│   ① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨                         │  ← Step counter
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  LAYERS — Sequences. Data where order... │   │  ← Subtitle bar
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Configuration Panel
- **Trigger:** Gear icon in header
- **Contents:**
  - Domain textarea (multi-line, paste zone)
  - Generate button
  - Status indicator (Generating… / Done / Error)
  - Cache clear button
  - Current mode badges
- **Behavior:**  
  - Opens as a slide-down panel from the top (with glass effect)
  - Does NOT cover the 3D scene entirely — overlays top portion
  - Can be dismissed

---

## Files to Add / Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/ApiPanel.jsx` | Textarea + API key + Generate + cache controls |
| `src/components/SubtitleBar.jsx` | Real-time subtitle below 3D scene |
| `src/components/ModeSelector.jsx` | Speed + Level toggle chips |
| `src/utils/deepseek.js` | DeepSeek API call with prompt template + JSON validation |
| `src/utils/cache.js` | localStorage cache (get/set/has/clear) |

### Modify
| File | Change |
|------|--------|
| `src/App.jsx` | Add `level`, `speed`, `cache`, `subtitleText` state; wire DeepSeek generate flow; pass timing to TourController |
| `src/components/ThreeCanvas.jsx` | Accept `topics`, `edges`, `speed` as props; rebuild scene on regenerate |
| `src/three/TourController.js` | Accept `speed` parameter → adjusts delay + lerp speed |
| `src/utils/tts.js` | Accept `speed` → adjusts `utterance.rate` |
| `src/components/Header.jsx` | Add gear icon to toggle ApiPanel |
| `src/style.css` | Styles for ApiPanel, SubtitleBar, ModeSelector |

---

## Subtitle Bar Lifecycle

1. Tour step changes → `subtitleText` = full speech text (icon + title + explanation)
2. Subtitle fades in (`opacity 0→1 transition 0.3s`)
3. TTS speaks the same text
4. TTS `onEnd` → 2s delay → fade out subtitle
5. Manual prev/next → immediate clear → set new text

---

## Default Behavior
- On first load (no domain entered, no cache): use **hardcoded Week-6 data** (current `theme.js` + `tree.js`)
- Level default: **Layman**
- Speed default: **Mid**
- Once user pastes domain + generates → hardcoded data is replaced

---

## Edge Cases
- **Empty domain** → Generate is disabled, show "Paste knowledge first"
- **API failure** → Show error toast, keep current data
- **Invalid JSON from DeepSeek** → Retry once, then show error
- **Cache full** → LRU eviction (keep last 20 entries)
- **Mobile** → ModeSelector collapses into a single tap-to-cycle row

---

## Future (v0.3+)
- Export/import generated JSON files
- Multi-language TTS (Hindi, Spanish, etc.)
- Collaborative share link
- Upload PDF / URL instead of paste
