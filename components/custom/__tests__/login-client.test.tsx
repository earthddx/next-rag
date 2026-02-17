import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginClient from '@/components/custom/login-client'

// Mock next-auth/react
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock child components to isolate LoginClient logic
vi.mock('@/components/custom/login/google-login-button', () => ({
  default: () => <button>Google</button>,
}))
vi.mock('@/components/custom/login/github-login-button', () => ({
  default: () => <button>GitHub</button>,
}))
vi.mock('@/components/custom/logo-brand', () => ({
  default: () => <div>Logo</div>,
}))
vi.mock('@/components/custom/divider', () => ({
  default: () => <hr />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginClient', () => {
  it('renders the login page heading', () => {
    render(<LoginClient />)

    expect(screen.getByText('ChatDocs')).toBeInTheDocument()
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('renders the sign up link', () => {
    render(<LoginClient />)

    const link = screen.getByText('Sign up')
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders social login buttons', () => {
    render(<LoginClient />)

    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('calls signIn and redirects on successful login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginClient />)

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@test.com',
      password: 'password123',
      redirect: false,
    })
    expect(mockPush).toHaveBeenCalledWith('/chatroom')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' })

    render(<LoginClient />)

    await user.type(screen.getByLabelText('Email'), 'wrong@test.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText(/Incorrect email or password/)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('displays generic error when signIn throws', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<LoginClient />)

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })
})
