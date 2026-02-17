import { describe, it, expect } from 'vitest'
import { chunkContent } from '../chunking'

describe('chunkContent', () => {
  it('splits text into chunks', async () => {
    const text = 'word '.repeat(50) // 250 chars, should produce multiple chunks
    const chunks = await chunkContent(text)
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('returns chunks that respect the chunk size', async () => {
    const text = 'hello '.repeat(100)
    const chunks = await chunkContent(text)
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(100)
    }
  })

  it('trims whitespace from input', async () => {
    const text = '   some content here   '
    const chunks = await chunkContent(text)
    expect(chunks[0]).not.toMatch(/^\s/)
    expect(chunks[chunks.length - 1]).not.toMatch(/\s$/)
  })

  it('handles short text as a single chunk', async () => {
    const text = 'short text'
    const chunks = await chunkContent(text)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe('short text')
  })
})
