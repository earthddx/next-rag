import { describe, it, expect, vi } from 'vitest'

vi.mock('ai', () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: {
    embeddingModel: vi.fn(() => 'mocked-model'),
  },
}))

import { generateEmbedding, generateEmbeddings } from '@/lib/embeddings'
import { embed, embedMany } from 'ai'

describe('generateEmbedding', () => {
  it('returns the embedding from the AI SDK', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3]
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      usage: { tokens: 5 },
      value: 'test',
      rawResponse: undefined,
      response: {} as any,
    } as any)

    const result = await generateEmbedding('hello world')
    expect(result).toEqual(mockEmbedding)
  })

  it('replaces newlines in input text', async () => {
    vi.mocked(embed).mockResolvedValue({
      embedding: [0.1],
      usage: { tokens: 5 },
      value: 'test',
      rawResponse: undefined,
      response: {} as any,
    } as any)

    await generateEmbedding('hello\nworld')

    expect(embed).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'hello world',
      })
    )
  })
})

describe('generateEmbeddings', () => {
  it('returns embeddings for multiple texts', async () => {
    const mockEmbeddings = [[0.1, 0.2], [0.3, 0.4]]
    vi.mocked(embedMany).mockResolvedValue({
      embeddings: mockEmbeddings,
      usage: { tokens: 10 },
      values: ['a', 'b'],
    } as any)

    const result = await generateEmbeddings(['text one', 'text two'])
    expect(result).toEqual(mockEmbeddings)
    expect(result).toHaveLength(2)
  })

  it('replaces newlines in all input texts', async () => {
    vi.mocked(embedMany).mockResolvedValue({
      embeddings: [[0.1]],
      usage: { tokens: 5 },
      values: ['a'],
    } as any)

    await generateEmbeddings(['hello\nworld', 'foo\nbar'])

    expect(embedMany).toHaveBeenCalledWith(
      expect.objectContaining({
        values: ['hello world', 'foo bar'],
      })
    )
  })
})
