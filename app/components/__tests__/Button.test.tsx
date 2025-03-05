import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Simple Button component for testing
const Button = ({
    onClick,
    disabled = false,
    children
}: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            data-testid="test-button"
        >
            {children}
        </button>
    )
}

describe('Button Component', () => {
    test('renders button with text', () => {
        const mockOnClick = jest.fn()

        render(<Button onClick={mockOnClick}>Click Me</Button>)

        const button = screen.getByTestId('test-button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('Click Me')
    })

    test('calls onClick when clicked', async () => {
        const mockOnClick = jest.fn()

        render(<Button onClick={mockOnClick}>Click Me</Button>)

        const button = screen.getByTestId('test-button')
        const user = userEvent.setup()
        await user.click(button)

        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    test('is disabled when disabled prop is true', () => {
        const mockOnClick = jest.fn()

        render(<Button onClick={mockOnClick} disabled={true}>Click Me</Button>)

        const button = screen.getByTestId('test-button')
        expect(button).toBeDisabled()
    })
}) 