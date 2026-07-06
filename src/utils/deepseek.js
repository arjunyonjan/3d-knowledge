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

export async function generateFromDomain(domain, level, apiKey) {
  if (!apiKey) throw new Error('API key required')
  if (!domain.trim()) throw new Error('Domain text required')

  const prompt = SYSTEM_PROMPTS[level] || SYSTEM_PROMPTS.layman

  const res = await fetch(API_URL, {
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

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const raw = json.choices?.[0]?.message?.content || ''

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
