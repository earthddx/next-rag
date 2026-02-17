import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UIMessage } from 'ai'

// Mock useChatSession hook
const mockSendMessage = vi.fn()
const mockSetMessages = vi.fn()
const mockCreateNewSession = vi.fn()
const mockUseChatSession = vi.fn()

vi.mock('@/lib/hooks/useChatSession', () => ({
  useChatSession: (...args: any[]) => mockUseChatSession(...args),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock ai-elements with simple passthroughs
vi.mock('@/components/ai-elements/conversation', () => ({
  Conversation: ({ children, ...props }: any) => <div data-testid="conversation" {...props}>{children}</div>,
  ConversationContent: ({ children }: any) => <div data-testid="conversation-content">{children}</div>,
  ConversationEmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  ),
  ConversationScrollButton: () => null,
}))

vi.mock('@/components/ai-elements/message', () => ({
  Message: ({ children, from }: any) => <div data-testid={`message-${from}`}>{children}</div>,
  MessageContent: ({ children }: any) => <div data-testid="message-content">{children}</div>,
  MessageResponse: ({ children }: any) => <div data-testid="message-response">{children}</div>,
}))

vi.mock('@/components/ai-elements/prompt-input', () => ({
  PromptInput: ({ children, onSubmit, ...props }: any) => (
    <form data-testid="prompt-input" onSubmit={(e: any) => {
      e.preventDefault()
      onSubmit({ text: e.currentTarget.querySelector('textarea')?.value || '', files: [] }, e)
    }} {...props}>{children}</form>
  ),
  PromptInputTextarea: (props: any) => <textarea data-testid="prompt-textarea" {...props} />,
  PromptInputSubmit: (props: any) => <button data-testid="submit-btn" type="submit" {...props}>Send</button>,
  PromptInputTools: ({ children }: any) => <>{children}</>,
  PromptInputFooter: ({ children }: any) => <>{children}</>,
  PromptInputActionMenu: ({ children }: any) => <>{children}</>,
  PromptInputActionMenuTrigger: () => null,
  PromptInputActionMenuContent: ({ children }: any) => <>{children}</>,
  PromptInputActionAddAttachments: () => null,
  usePromptInputAttachments: () => ({ files: [], remove: vi.fn() }),
}))

vi.mock('@/components/ai-elements/attachments', () => ({
  Attachments: ({ children }: any) => <>{children}</>,
  Attachment: ({ children }: any) => <>{children}</>,
  AttachmentPreview: () => null,
  AttachmentInfo: () => null,
  AttachmentRemove: () => null,
}))

vi.mock('@/components/ai-elements/suggestion', () => ({
  Suggestions: ({ children }: any) => <div data-testid="suggestions">{children}</div>,
  Suggestion: ({ suggestion, onClick }: any) => (
    <button data-testid={`suggestion`} onClick={onClick}>{suggestion}</button>
  ),
}))

vi.mock('@/components/ai-elements/loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}))

vi.mock('lucide-react', () => ({
  FileTextIcon: () => <span>FileIcon</span>,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

import Chat from '../chat-component'

function defaultHookReturn(overrides: Partial<ReturnType<typeof mockUseChatSession>> = {}) {
  return {
    messages: [] as UIMessage[],
    sendMessage: mockSendMessage,
    setMessages: mockSetMessages,
    status: 'ready' as const,
    sessionId: 'session-1',
    isLoadingSession: false,
    isStreaming: false,
    isReady: true,
    createNewSession: mockCreateNewSession,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseChatSession.mockReturnValue(defaultHookReturn())
})

describe('Chat', () => {
  describe('empty state', () => {
    it('shows empty state when there are no messages', () => {
      render(<Chat />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    })

    it('renders suggestion buttons', () => {
      render(<Chat />)

      const suggestions = screen.getAllByTestId('suggestion')
      expect(suggestions).toHaveLength(4)
      expect(screen.getByText('What documents have been uploaded?')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loader when session is loading', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        isLoadingSession: true,
      }))

      render(<Chat />)

      expect(screen.getByTestId('loader')).toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })

    it('shows loader when streaming', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        isStreaming: true,
        messages: [
          { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
        ] as UIMessage[],
      }))

      render(<Chat />)

      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('disables textarea when session is loading', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        isLoadingSession: true,
        isReady: false,
      }))

      render(<Chat />)

      expect(screen.getByTestId('prompt-textarea')).toBeDisabled()
    })

    it('shows loading placeholder when session is loading', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        isLoadingSession: true,
        isReady: false,
      }))

      render(<Chat />)

      expect(screen.getByTestId('prompt-textarea')).toHaveAttribute(
        'placeholder',
        'Loading session...'
      )
    })
  })

  describe('messages', () => {
    it('renders user messages', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        messages: [
          { id: '1', role: 'user', parts: [{ type: 'text', text: 'Hello there' }] },
        ] as UIMessage[],
      }))

      render(<Chat />)

      expect(screen.getByTestId('message-user')).toBeInTheDocument()
      expect(screen.getByText('Hello there')).toBeInTheDocument()
    })

    it('renders assistant messages', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        messages: [
          { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hi! How can I help?' }] },
        ] as UIMessage[],
      }))

      render(<Chat />)

      expect(screen.getByTestId('message-assistant')).toBeInTheDocument()
      expect(screen.getByTestId('message-response')).toBeInTheDocument()
    })

    it('shows "View PDF" button for PDF upload messages', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        messages: [
          {
            id: '1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Processed doc.pdf' }],
            metadata: { isPdfUpload: true, fileUrl: 'https://example.com/doc.pdf', fileName: 'doc.pdf' },
          },
        ] as UIMessage[],
      }))

      render(<Chat />)

      expect(screen.getByText('View PDF')).toBeInTheDocument()
    })

    it('does not show "View PDF" button for regular assistant messages', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        messages: [
          { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Just a response' }] },
        ] as UIMessage[],
      }))

      render(<Chat />)

      expect(screen.queryByText('View PDF')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls sendMessage when a suggestion is clicked', async () => {
      const user = userEvent.setup()
      render(<Chat />)

      await user.click(screen.getByText('What documents have been uploaded?'))

      expect(mockSendMessage).toHaveBeenCalledWith({ text: 'What documents have been uploaded?' })
    })

    it('calls sendMessage when submitting text', async () => {
      const user = userEvent.setup()
      render(<Chat />)

      const textarea = screen.getByTestId('prompt-textarea')
      await user.type(textarea, 'Hello AI')
      await user.click(screen.getByTestId('submit-btn'))

      expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Hello AI' })
    })

    it('opens PDF preview dialog when "View PDF" is clicked', async () => {
      const user = userEvent.setup()
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        messages: [
          {
            id: '1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Processed doc.pdf' }],
            metadata: { isPdfUpload: true, fileUrl: 'https://example.com/doc.pdf', fileName: 'doc.pdf' },
          },
        ] as UIMessage[],
      }))

      render(<Chat />)

      await user.click(screen.getByText('View PDF'))

      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    })
  })

  describe('ready state', () => {
    it('enables textarea when ready and not loading', () => {
      render(<Chat />)

      expect(screen.getByTestId('prompt-textarea')).not.toBeDisabled()
    })

    it('disables textarea when streaming', () => {
      mockUseChatSession.mockReturnValue(defaultHookReturn({
        status: 'streaming',
      }))

      render(<Chat />)

      expect(screen.getByTestId('prompt-textarea')).toBeDisabled()
    })
  })
})
