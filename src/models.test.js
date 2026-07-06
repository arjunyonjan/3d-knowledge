import { describe, test, expect } from 'vitest'

describe('Module exports', () => {
  test('theme imports correctly (already tested)', async () => {
    const mod = await import('./data/theme.js')
    expect(mod.TOPICS.length).toBe(9)
  })

  test('icons module is importable', async () => {
    const mod = await import('./icons.js')
    expect(mod.getIconTexture).toBeDefined()
    expect(typeof mod.getIconTexture).toBe('function')
  })

  test('TopicCard class is importable', async () => {
    const mod = await import('./cards/TopicCard.js')
    expect(mod.default).toBeDefined()
  })

  test('RNNCell class is importable', async () => {
    const mod = await import('./models/RNNCell.js')
    expect(mod.default).toBeDefined()
  })

  test('LSTMCell class is importable', async () => {
    const mod = await import('./models/LSTMCell.js')
    expect(mod.default).toBeDefined()
  })

  test('GRUCell class is importable', async () => {
    const mod = await import('./models/GRUCell.js')
    expect(mod.default).toBeDefined()
  })

  test('Seq2SeqModel class is importable', async () => {
    const mod = await import('./models/Seq2SeqModel.js')
    expect(mod.default).toBeDefined()
  })

  test('AttentionModel class is importable', async () => {
    const mod = await import('./models/AttentionModel.js')
    expect(mod.default).toBeDefined()
  })

  test('CompareModel class is importable', async () => {
    const mod = await import('./models/CompareModel.js')
    expect(mod.default).toBeDefined()
  })

  test('NMTDemo class is importable', async () => {
    const mod = await import('./demos/NMTDemo.js')
    expect(mod.default).toBeDefined()
  })

  test('ForecastingDemo class is importable', async () => {
    const mod = await import('./demos/ForecastingDemo.js')
    expect(mod.default).toBeDefined()
  })
})
