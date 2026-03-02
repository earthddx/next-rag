// @vitest-environment node
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

vi.mock('mammoth', () => ({
  default: { extractRawText: vi.fn() },
}))

import { POST } from '../route'
import { getServerSession } from 'next-auth'
import { MIME_PDF, MIME_DOCX } from '@/lib/file-types'

beforeEach(() => {
  vi.clearAllMocks()
})

// Helper: create a fake PDF file with valid magic bytes
function makePdfFile(name: string, sizeOverride?: number) {
  const pdfContent = '%PDF-1.4 fake pdf content here'
  const blob = new Blob([pdfContent], { type: MIME_PDF })
  const file = new File([blob], name, { type: MIME_PDF })
  if (sizeOverride) {
    Object.defineProperty(file, 'size', { value: sizeOverride })
  }
  return file
}

// Helper: create a fake DOCX file with valid magic bytes (ZIP: PK\x03\x04)
function makeDocxFile(name: string) {
  const docxHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...new Array(26).fill(0)])
  const blob = new Blob([docxHeader], { type: MIME_DOCX })
  return new File([blob], name, { type: MIME_DOCX })
}

function makeRequest(file: File) {
  const formData = new FormData()
  formData.append('file', file)
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

    const bigContent = new Uint8Array(11 * 1024 * 1024)
    const pdfHeader = new TextEncoder().encode('%PDF-1.4 ')
    bigContent.set(pdfHeader, 0)
    const file = new File([bigContent], 'big.pdf', { type: MIME_PDF })

    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(413)
    expect(body.error).toContain('File too large')
  })

  it('returns 400 for unsupported mime type', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['hello'], 'doc.pdf', { type: 'text/plain' })
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file type')
  })

  it('returns 400 for unsupported file extension', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    // .txt extension with a valid MIME type — MIME passes but extension is rejected
    const file = new File(['data'], 'report.txt', { type: MIME_PDF })
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file extension')
  })

  it('returns 400 for .doc files (unsupported format)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['data'], 'report.doc', { type: 'application/msword' })
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/Invalid file type|Invalid file extension/)
  })

  it('returns 400 when PDF file has wrong magic bytes', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['not a real pdf'], 'fake.pdf', { type: MIME_PDF })
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file format')
  })

  it('returns 400 when DOCX file has wrong magic bytes', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = new File(['not a real docx'], 'fake.docx', { type: MIME_DOCX })
    const res = await POST(makeRequest(file))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid file format')
  })

  it('accepts a valid DOCX file and begins streaming', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
      expires: '',
    })

    const file = makeDocxFile('report.docx')
    const res = await POST(makeRequest(file))

    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })
})
