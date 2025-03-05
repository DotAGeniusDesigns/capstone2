import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js')

// Test component that uses the auth context
const TestComponent = () => {
    const { user, isLoading, signIn, signUp, signOut } = useAuth()

    return (
        <div>
            {isLoading && <div data-testid="loading">Loading...</div>}
            {user ? (
                <>
                    <div data-testid="user-email">{user.email}</div>
                    <button onClick={() => signOut()}>Sign Out</button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => signIn({ email: 'test@example.com', password: 'password123' })}
                        data-testid="sign-in-btn"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => signUp({ email: 'new@example.com', password: 'password123' })}
                        data-testid="sign-up-btn"
                    >
                        Sign Up
                    </button>
                </>
            )}
        </div>
    )
}

describe('AuthContext', () => {
    const mockCreateClient = createClient as jest.Mock
    const mockAuth = {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateClient.mockReturnValue({
            auth: mockAuth,
        })
    })

    test('provides loading state initially', () => {
        // Mock getSession to return a promise that doesn't resolve immediately
        mockAuth.getSession.mockReturnValue(new Promise(() => { }))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    test('provides user when authenticated', async () => {
        // Mock getSession to return a user
        mockAuth.getSession.mockResolvedValue({
            data: {
                session: {
                    user: { email: 'test@example.com' }
                }
            }
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Wait for the user to be loaded
        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toBeInTheDocument()
        })

        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    })

    test('handles sign in', async () => {
        // Mock getSession to return no session initially
        mockAuth.getSession.mockResolvedValue({
            data: { session: null }
        })

        // Mock sign in to succeed
        mockAuth.signInWithPassword.mockResolvedValue({
            data: {
                user: { email: 'test@example.com' },
                session: {}
            },
            error: null
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Wait for the loading to finish
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        })

        // Click sign in button
        const user = userEvent.setup()
        await user.click(screen.getByTestId('sign-in-btn'))

        // Verify sign in was called with correct params
        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        })
    })

    test('handles sign up', async () => {
        // Mock getSession to return no session initially
        mockAuth.getSession.mockResolvedValue({
            data: { session: null }
        })

        // Mock sign up to succeed
        mockAuth.signUp.mockResolvedValue({
            data: {
                user: { email: 'new@example.com' },
                session: {}
            },
            error: null
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Wait for the loading to finish
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        })

        // Click sign up button
        const user = userEvent.setup()
        await user.click(screen.getByTestId('sign-up-btn'))

        // Verify sign up was called with correct params
        expect(mockAuth.signUp).toHaveBeenCalledWith({
            email: 'new@example.com',
            password: 'password123'
        })
    })

    test('handles sign out', async () => {
        // Mock getSession to return a user
        mockAuth.getSession.mockResolvedValue({
            data: {
                session: {
                    user: { email: 'test@example.com' }
                }
            }
        })

        // Mock sign out to succeed
        mockAuth.signOut.mockResolvedValue({ error: null })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Wait for the user to be loaded
        await waitFor(() => {
            expect(screen.getByText('Sign Out')).toBeInTheDocument()
        })

        // Click sign out button
        const user = userEvent.setup()
        await user.click(screen.getByText('Sign Out'))

        // Verify sign out was called
        expect(mockAuth.signOut).toHaveBeenCalled()
    })

    test('listens for auth state changes', async () => {
        // Mock getSession to return no session initially
        mockAuth.getSession.mockResolvedValue({
            data: { session: null }
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        // Wait for the loading to finish
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        })

        // Verify onAuthStateChange was called
        expect(mockAuth.onAuthStateChange).toHaveBeenCalled()
    })
}) 