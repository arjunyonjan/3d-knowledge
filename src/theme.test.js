import { describe, test, expect } from 'vitest'
import { TOPICS, COLORS, CARD_COLORS } from './data/theme.js'

describe('Theme', () => {
  test('has valid primary color', () => {
    expect(COLORS.primary).toBe('#00ffaa')
  })

  test('has glass background', () => {
    expect(COLORS.glassBg).toContain('rgba')
  })
})

describe('Topics', () => {
  test('has 9 topics', () => {
    expect(TOPICS.length).toBe(9)
  })

  test('every topic has id, title, icon, explanation, details', () => {
    TOPICS.forEach(t => {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('title')
      expect(t).toHaveProperty('icon')
      expect(t).toHaveProperty('explanation')
      expect(t).toHaveProperty('details')
    })
  })

  test('each topic has unique id', () => {
    const ids = TOPICS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('sequence fundamentals is first', () => {
    expect(TOPICS[0].title).toContain('Sequence')
  })

  test('NMT and Forecasting are last two tasks', () => {
    expect(TOPICS[7].title).toContain('NMT')
    expect(TOPICS[8].title).toContain('Forecasting')
  })

  test('each topic references a valid icon key', () => {
    TOPICS.forEach(t => {
      expect(['layers', 'loop', 'gitBranch', 'gitMerge', 'arrowLeftRight', 'eye', 'barChart']).toContain(t.icon)
    })
  })

  test('each topic has non-empty explanation', () => {
    TOPICS.forEach(t => {
      expect(t.explanation.length).toBeGreaterThan(10)
    })
  })

  test('each topic has at least 2 details', () => {
    TOPICS.forEach(t => {
      expect(t.details.length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('Card Colors', () => {
  test('has color for all 9 topics', () => {
    for (let i = 0; i < 9; i++) {
      expect(CARD_COLORS).toHaveProperty(i.toString())
    }
  })

  test('all colors are valid hex', () => {
    Object.values(CARD_COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})
