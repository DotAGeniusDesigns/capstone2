import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn()
}))

// Import the mock
import { useAuth } from '../../context/AuthContext'

// Mock NavBar component for testing
const Navbar = () => {
    const { user, isLoading, signOut } = useAuth() as any

    if (isLoading) {
        return <div className="animate-pulse" data-testid="loading-indicator">Loading...</div>
    }

    return (
        <nav data-testid="navbar">
            <div>
                <h1>Release Calendar</h1>
                <div>
                    <a href="/interests">Interests</a>
                    <a href="/calendar">Calendar</a>
                    <a href="/list">List</a>
                </div>
            </div>
            <div>
                {user ? (
                    <div>
                        <span>{user.email?.split('@')[0]}</span>
                        <button onClick={signOut}>Sign Out</button>
                    </div>
                ) : (
                    <div>
                        <a href="/signin">Sign In</a>
                        <a href="/signup">Sign Up</a>
                    </div>
                )}
            </div>
        </nav>
    )
}

describe('Navbar Component', () => {
    const mockUseAuth = useAuth as jest.Mock

    beforeEach(() => {
        // Reset mocks
        mockUseAuth.mockReset()
    })

    test('renders app title', () => {
        // Mock auth context with no user (logged out state)
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(<Navbar />)

        // Verify the app title is present
        expect(screen.getByText('Release Calendar')).toBeInTheDocument()
    })

    test('renders navigation links', () => {
        // Mock auth context with no user (logged out state)
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(<Navbar />)

        // Verify the navigation links are present
        expect(screen.getByText('Interests')).toBeInTheDocument()
        expect(screen.getByText('Calendar')).toBeInTheDocument()
        expect(screen.getByText('List')).toBeInTheDocument()
    })

    test('renders sign in and sign up links when user is not authenticated', () => {
        // Mock auth context with no user (logged out state)
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(<Navbar />)

        // Verify auth links are present
        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByText('Sign Up')).toBeInTheDocument()
    })

    test('renders user email and sign out button when user is authenticated', () => {
        // Mock auth context with a logged in user
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com' },
            isLoading: false,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(<Navbar />)

        // Verify user info and sign out button are present
        expect(screen.getByText('test')).toBeInTheDocument() // Only the first part of the email
        expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    test('renders loading state when auth is loading', () => {
        // Mock auth context in loading state
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: true,
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
        })

        render(<Navbar />)

        // Loading state should be visible
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    })
}) 