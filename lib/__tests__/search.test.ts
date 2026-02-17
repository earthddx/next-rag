import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/embeddings', () => ({
  generateEmbedding: vi.fn(),
}))

import { semanticSearch } from '@/lib/search'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('semanticSearch', () => {
  it('returns rows that meet the minScore threshold', async () => {
    vi.mocked(generateEmbedding).mockResolvedValue([0.1, 0.2, 0.3])
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { id: '1', content: 'relevant', documentId: 'd1', similarity: 0.9 },
      { id: '2', content: 'not relevant', documentId: 'd2', similarity: 0.3 },
    ] as never)

    const results = await semanticSearch({
      query: 'test query',
      userId: 'user-1',
    })

    expect(results).toHaveLength(1)
    expect(results[0].similarity).toBe(0.9)
  })

  it('uses default minScore of 0.7', async () => {
    vi.mocked(generateEmbedding).mockResolvedValue([0.1])
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { id: '1', content: 'ok', documentId: 'd1', similarity: 0.71 },
      { id: '2', content: 'low', documentId: 'd2', similarity: 0.69 },
    ] as never)

    const results = await semanticSearch({
      query: 'test',
      userId: 'user-1',
    })

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('1')
  })

  it('returns empty array when no rows meet threshold', async () => {
    vi.mocked(generateEmbedding).mockResolvedValue([0.1])
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { id: '1', content: 'low', documentId: 'd1', similarity: 0.2 },
    ] as never)

    const results = await semanticSearch({
      query: 'test',
      userId: 'user-1',
    })

    expect(results).toHaveLength(0)
  })

  it('calls generateEmbedding with the query', async () => {
    vi.mocked(generateEmbedding).mockResolvedValue([0.1])
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never)

    await semanticSearch({ query: 'my search', userId: 'user-1' })

    expect(generateEmbedding).toHaveBeenCalledWith('my search')
  })
})
