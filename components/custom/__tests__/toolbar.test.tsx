import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toolbar from '@/components/custom/Toolbar'

// Mock next-auth/react
const mockSignOut = vi.fn()
vi.mock('next-auth/react', () => ({
  signOut: (...args: any[]) => mockSignOut(...args),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('Toolbar', () => {
  it('renders the app name', () => {
    render(<Toolbar userName="John" userImageSrc={null} />)

    expect(screen.getByText('ChatDocs')).toBeInTheDocument()
  })

  it('displays a welcome message with the user name', () => {
    render(<Toolbar userName="John" userImageSrc={null} />)

    expect(screen.getByText('Welcome Back, John!')).toBeInTheDocument()
  })

  it('displays a generic welcome message when no user name', () => {
    render(<Toolbar userName={null} userImageSrc={null} />)

    expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
  })

  it('renders the user avatar image when provided', () => {
    render(<Toolbar userName="John" userImageSrc="https://example.com/avatar.jpg" />)

    const img = screen.getByAltText("John's avatar")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders initial letter fallback when no image but name exists', () => {
    render(<Toolbar userName="John" userImageSrc={null} />)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders a Sign Out button', () => {
    render(<Toolbar userName="John" userImageSrc={null} />)

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('calls signOut when Sign Out is clicked', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc={null} />)

    await user.click(screen.getByRole('button', { name: 'Sign Out' }))

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
