export async function generateFromDomain(domain, level, apiKey, onChunk) {
  if (!domain.trim()) throw new Error('Domain text required')

  // Try Vercel serverless endpoint first (key stays server-side)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, level }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (res.ok) return await res.json()
    if (res.status !== 404) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Server error ${res.status}`)
    }
  } catch (e) {
    if (!e.message?.includes('Server error') && !e.message?.includes('Failed to fetch')) throw e
  }

  // Fallback: direct DeepSeek call (local dev)
  if (!apiKey) apiKey = import.meta.env.VITE_DEEPSEEK_KEY || ''
  if (!apiKey) throw new Error('API key not configured. Set VITE_DEEPSEEK_KEY in .env')

  const SYSTEM_PROMPTS = {
    child: `You are a knowledge graph builder for kids. Given the text below, extract 7-12 key concepts and arrange them in a pedagogical tree (0 = root, simplest concept). For each concept write:
- title: 2-4 words
- explanation: one FUN sentence a 10-year-old would understand, use analogies
- code: empty string
- lucide: best matching icon name from lucide.dev
- details: 2-3 short sentences for TTS, very simple words

Output ONLY valid JSON matching: { "topics": [{"id":0,"title":"...","explanation":"...","code":"","lucide":"...","details":"..."}], "edges": [[0,1],[1,2],...] }`,

    layman: `You are a knowledge graph builder. Given the text below, extract 7-12 key concepts and arrange them in a pedagogical tree (0 = root, simplest concept). For each concept write:
- title: 2-4 words
- explanation: one plain-English sentence, no jargon, friendly tone
- code: 3-5 lines of simple Python pseudocode showing the idea
- lucide: best matching icon name from lucide.dev
- details: 2-3 natural sentences for TTS narration

Output ONLY valid JSON matching: { "topics": [{"id":0,"title":"...","explanation":"...","code":"...","lucide":"...","details":"..."}], "edges": [[0,1],[1,2],...] }`,

    pro: `You are a knowledge graph builder. Given the text below, extract 7-12 key concepts and arrange them in a pedagogical tree (0 = root, simplest concept). For each concept write:
- title: 2-4 words (use proper technical terms)
- explanation: one concise technical sentence with appropriate terminology
- code: 3-5 lines of real Keras/PyTorch or domain-relevant code
- lucide: best matching icon name from lucide.dev
- details: 2-3 detailed sentences for TTS with key technical points

Output ONLY valid JSON matching: { "topics": [{"id":0,"title":"...","explanation":"...","code":"...","lucide":"...","details":"..."}], "edges": [[0,1],[1,2],...] }`,
  }

  const prompt = SYSTEM_PROMPTS[level] || SYSTEM_PROMPTS.layman

  const dsController = new AbortController()
  const dsTimeout = setTimeout(() => dsController.abort(), 25000)

  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: `Here is the knowledge to organize:\n\n${domain}` },
    ],
    temperature: 0,
    max_tokens: 4096,
  }

  let raw

  if (onChunk) {
    body.stream = true
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: dsController.signal,
    })
    clearTimeout(dsTimeout)
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${err}`)
    }
    raw = ''
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() || ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') break
        try {
          const ev = JSON.parse(data)
          const delta = ev.choices?.[0]?.delta?.content || ''
          if (delta) {
            raw += delta
            onChunk(raw)
          }
        } catch {}
      }
    }
  } else {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: dsController.signal,
    })
    clearTimeout(dsTimeout)
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${err}`)
    }
    const json = await res.json()
    raw = json.choices?.[0]?.message?.content || ''
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try { parsed = JSON.parse(match[1]) } catch { throw new Error('Failed to parse AI response as JSON') }
    } else {
      throw new Error('Failed to parse AI response as JSON')
    }
  }

  if (!parsed.topics || !parsed.edges) {
    throw new Error('AI response missing required fields (topics, edges)')
  }

  return parsed
}
