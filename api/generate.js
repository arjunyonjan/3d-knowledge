const API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPTS = {
  child: `You are a knowledge graph builder for kids. Given the text below, extract 7-12 key concepts and arrange them in a pedagogical tree (0 = root, simplest concept). For each concept write:
- title: 2-4 words
- explanation: one FUN sentence a 10-year-old would understand, use analogies
- code: empty string (no code for kids)
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { domain, level } = req.body || {}
  if (!domain || !domain.trim()) {
    return res.status(400).json({ error: 'Domain text required' })
  }

  const apiKey = process.env.DEEPSEEK_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server key not configured' })
  }

  const prompt = SYSTEM_PROMPTS[level] || SYSTEM_PROMPTS.layman

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Here is the knowledge to organize:\n\n${domain}` },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => '')
      return res.status(response.status).json({ error: `DeepSeek error: ${err}` })
    }

    const json = await response.json()
    const raw = json.choices?.[0]?.message?.content || ''

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        try { parsed = JSON.parse(match[1]) } catch { throw new Error('Failed to parse response as JSON') }
      } else {
        throw new Error('Failed to parse response as JSON')
      }
    }

    if (!parsed.topics || !parsed.edges) {
      throw new Error('Response missing required fields (topics, edges)')
    }

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Generation failed' })
  }
}
