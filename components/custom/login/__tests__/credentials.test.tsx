import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Credentials from '@/components/custom/login/credentials'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Credentials', () => {
  const defaultProps = {
    mode: 'login' as const,
    onSubmit: vi.fn((e) => { e.preventDefault(); return Promise.resolve() }),
    isLoading: false,
    error: '',
  }

  describe('login mode', () => {
    it('renders email and password fields', () => {
      render(<Credentials {...defaultProps} />)

      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('does not render confirm password field', () => {
      render(<Credentials {...defaultProps} />)

      expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument()
    })

    it('shows "Sign In" on the submit button', () => {
      render(<Credentials {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('shows "Remember me" checkbox and "Forgot password?" link', () => {
      render(<Credentials {...defaultProps} />)

      expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    })
  })

  describe('signup mode', () => {
    it('renders confirm password field', () => {
      render(<Credentials {...defaultProps} mode="signup" />)

      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    })

    it('shows "Sign Up" on the submit button', () => {
      render(<Credentials {...defaultProps} mode="signup" />)

      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    })

    it('does not show "Remember me" or "Forgot password?"', () => {
      render(<Credentials {...defaultProps} mode="signup" />)

      expect(screen.queryByLabelText('Remember me')).not.toBeInTheDocument()
      expect(screen.queryByText('Forgot password?')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays error message when provided', () => {
      render(<Credentials {...defaultProps} error="Invalid credentials" />)

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('does not display error element when empty', () => {
      const { container } = render(<Credentials {...defaultProps} error="" />)

      expect(container.querySelector('.text-red-400')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('disables the submit button when loading', () => {
      render(<Credentials {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('shows "Signing in..." text when loading in login mode', () => {
      render(<Credentials {...defaultProps} isLoading={true} />)

      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('shows "Creating account..." text when loading in signup mode', () => {
      render(<Credentials {...defaultProps} mode="signup" isLoading={true} />)

      expect(screen.getByText('Creating account...')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls onSubmit when the form is submitted', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((e) => { e.preventDefault(); return Promise.resolve() })
      render(<Credentials {...defaultProps} onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText('Email'), 'test@test.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
