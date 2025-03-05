import { render, screen, waitFor } from '../../lib/test-utils'
import userEvent from '@testing-library/user-event'
import { SignIn } from '../SignIn'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'

// Mock the auth context and Next.js router
jest.mock('../../context/AuthContext')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

describe('SignIn Component', () => {
    const mockUseAuth = useAuth as jest.Mock
    const mockUseRouter = useRouter as jest.Mock
    const mockSignIn = jest.fn()
    const mockPush = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock auth context
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            signIn: mockSignIn,
        })

        // Mock router
        mockUseRouter.mockReturnValue({
            push: mockPush,
        })
    })

    test('renders sign in form', () => {
        render(<SignIn />)

        // Check form elements are present
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    test('allows entering email and password', async () => {
        render(<SignIn />)

        const user = userEvent.setup()
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)

        // Type in the inputs
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')

        // Check values were entered
        expect(emailInput).toHaveValue('test@example.com')
        expect(passwordInput).toHaveValue('password123')
    })

    test('submits the form with email and password', async () => {
        // Mock successful sign in
        mockSignIn.mockResolvedValue({ error: null })

        render(<SignIn />)

        const user = userEvent.setup()

        // Fill out the form
        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        // Submit the form
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        // Check sign in was called with correct credentials
        expect(mockSignIn).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        })
    })

    test('redirects to home page after successful sign in', async () => {
        // Mock successful sign in
        mockSignIn.mockResolvedValue({ error: null })

        render(<SignIn />)

        const user = userEvent.setup()

        // Fill out and submit the form
        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        // Wait for the redirect
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/')
        })
    })

    test('displays error message on sign in failure', async () => {
        // Mock failed sign in
        mockSignIn.mockResolvedValue({
            error: { message: 'Invalid login credentials' }
        })

        render(<SignIn />)

        const user = userEvent.setup()

        // Fill out and submit the form
        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'wrong-password')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        // Check error message is displayed
        await waitFor(() => {
            expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
        })

        // Check we didn't redirect
        expect(mockPush).not.toHaveBeenCalled()
    })

    test('disables form submission while loading', async () => {
        // Set up loading state
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: true,
            signIn: mockSignIn,
        })

        render(<SignIn />)

        // Check submit button is disabled
        expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    test('redirects to home if user is already authenticated', async () => {
        // Mock authenticated user
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com' },
            isLoading: false,
            signIn: mockSignIn,
        })

        render(<SignIn />)

        // Check we redirected
        expect(mockPush).toHaveBeenCalledWith('/')
    })
}) 