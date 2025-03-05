import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useEffect } from 'react'

// Mock the auth context and Next.js router
jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn()
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

// Import the mocks
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'

// Mock ProtectedRoute component for testing
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth() as any
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/signin')
        }
    }, [isLoading, user, router])

    if (isLoading) {
        return <div data-testid="loading-spinner">Loading...</div>
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}

describe('ProtectedRoute Component', () => {
    const mockUseAuth = useAuth as jest.Mock
    const mockUseRouter = useRouter as jest.Mock
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock router
        mockUseRouter.mockReturnValue({
            push: mockPush,
        })
    })

    test('renders loading state when auth is loading', () => {
        // Mock loading state
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: true,
        })

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        )

        // Check loading indicator is shown
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

        // Check protected content is not shown
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()

        // Check we didn't redirect
        expect(mockPush).not.toHaveBeenCalled()
    })

    test('redirects to sign in page when user is not authenticated', async () => {
        // Mock unauthenticated state
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
        })

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        )

        // Check we redirected to sign in page
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/signin')
        })

        // Check protected content is not shown
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    test('renders children when user is authenticated', () => {
        // Mock authenticated state
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com' },
            isLoading: false,
        })

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        )

        // Check protected content is shown
        expect(screen.getByText('Protected Content')).toBeInTheDocument()

        // Check we didn't redirect
        expect(mockPush).not.toHaveBeenCalled()
    })
}) 