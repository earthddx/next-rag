import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toolbar from '@/components/custom/Toolbar'

// Mock next-auth/react
const mockSignOut = vi.fn()
vi.mock('next-auth/react', () => ({
  signOut: (...args: any[]) => mockSignOut(...args),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock DocumentsDialog to avoid pulling in its dependencies
vi.mock('@/components/custom/DocumentsDialog', () => ({
  default: () => null,
}))

beforeEach(() => {
  mockSignOut.mockClear()
  mockPush.mockClear()
})

/** Helper: open the hamburger dropdown menu */
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const menuButton = screen.getByRole('button', { name: 'Open menu' })
  await user.click(menuButton)
}

describe('Toolbar', () => {
  it('renders the app name', () => {
    render(<Toolbar userName="John" userImageSrc={null} userEmail={null} />)

    expect(screen.getByText('ChatDocs')).toBeInTheDocument()
  })

  it('displays the user name in the dropdown menu', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc={null} userEmail="john@example.com" />)

    await openMenu(user)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('displays fallback "User" when no user name is provided', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName={null} userImageSrc={null} userEmail={null} />)

    await openMenu(user)

    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('renders the avatar section when an image source is provided', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc="https://example.com/avatar.jpg" userEmail={null} />)

    await openMenu(user)

    // Radix AvatarImage is hidden until the image loads (never in jsdom),
    // so the fallback is shown instead. Verify the avatar area renders.
    const avatar = document.querySelector('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })

  it('renders initial letter fallback when no image but name exists', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc={null} userEmail={null} />)

    await openMenu(user)

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders a Sign Out menu item in the dropdown', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc={null} userEmail={null} />)

    await openMenu(user)

    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('calls signOut after confirming in the sign-out dialog', async () => {
    const user = userEvent.setup()
    render(<Toolbar userName="John" userImageSrc={null} userEmail={null} />)

    // Open dropdown and click "Sign Out" menu item
    await openMenu(user)
    const signOutMenuItem = screen.getByText('Sign Out')
    await user.click(signOutMenuItem)

    // Confirmation dialog should appear – click the confirm button
    const confirmButton = await screen.findByRole('button', { name: 'Sign Out' })
    await user.click(confirmButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
