const STORAGE_KEY = 'w06_cache'
const MAX_ENTRIES = 20

function md5(s) {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + c
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch { return {} }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function cacheGet(domain, level) {
  const key = md5(domain.trim().toLowerCase()) + '_' + level
  const data = load()
  return data[key] || null
}

export function cacheSet(domain, level, value) {
  const key = md5(domain.trim().toLowerCase()) + '_' + level
  const data = load()
  data[key] = value
  const keys = Object.keys(data)
  if (keys.length > MAX_ENTRIES) {
    delete data[keys[0]]
  }
  save(data)
}

export function cacheHas(domain, level) {
  return cacheGet(domain, level) !== null
}

export function cacheClear() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
