import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import { CalendarProvider } from '../context/CalendarContext'

// Define the AllProviders wrapper for tests
const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <CalendarProvider>
                {children}
            </CalendarProvider>
        </AuthProvider>
    )
}

// Custom render function
const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options })

// Export
export * from '@testing-library/react'
export { customRender as render } 