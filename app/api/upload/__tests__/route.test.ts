import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock external dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authConfig: {},
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: { create: vi.fn(), update: vi.fn() },
    documentChunk: { create: vi.fn() },
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
  },
}))

vi.mock('@/lib/chunking', () => ({
  chunkContent: vi.fn(),
}))

vi.mock('@/lib/embeddings', () => ({
  generateEmbeddings: vi.fn(),
}))

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
}))

vi.mock('pdf2json', () => ({
  default: vi.fn(),
}))

import { POST } from '../route'
import { getServerSession } from 'next-auth'

beforeEach(() => {
  vi.clearAllMocks()
})

// Helper: create a fake PDF file with valid magic bytes
function makePdfFile(name: string, sizeOverride?: number) {
  const pdfContent = '%PDF-1.4 fake pdf content here'
  const blob = new Blob([pdfContent], { type: 'application/pdf' })
  const file = new File([blob], name, { type: 'application/pdf' })
  if (sizeOverride) {
    Object.defineProperty(file, 'size', { value: sizeOverride })
  }
  return file
}

function makeRequest(file: File) {
  const formData = new FormData()
  formData.append('pdf', file)
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: formData,
  })
}

describe('POST /api/upload', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const file = makePdfFile('test.pdf')
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when no file is provided', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData(), // empty form
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('No file provided')
  })

  it('returns 413 when file exceeds 10MB', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    // Create a Blob large enough to exceed 10MB
    const bigContent = new Uint8Array(11 * 1024 * 1024)
    // Write PDF magic bytes at the start
    const pdfHeader = new TextEncoder().encode('%PDF-1.4 ')
    bigContent.set(pdfHeader, 0)
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' })

    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(413)
    expect(body.error).toContain('File too large')
  })

  it('returns 400 for non-PDF mime type', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['hello'], 'doc.pdf', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('pdf', file)
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file type')
  })

  it('returns 400 for non-.pdf file extension', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['data'], 'report.docx', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('pdf', file)
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file extension')
  })

  it('returns 400 when file has wrong magic bytes', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    // File with .pdf name and correct mime, but not actual PDF content
    const file = new File(['not a real pdf'], 'fake.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('pdf', file)
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid PDF file format')
  })
})
