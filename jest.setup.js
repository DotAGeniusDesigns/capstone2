// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        pathname: '/',
        query: {},
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock Supabase
jest.mock('./app/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn(() => ({ data: { user: null }, error: null })),
            getSession: jest.fn(() => ({ data: { session: null }, error: null })),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } }
            })),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    in: jest.fn(() => ({
                        order: jest.fn(() => ({ data: [], error: null }))
                    })),
                    order: jest.fn(() => ({ data: [], error: null }))
                })),
                in: jest.fn(() => ({
                    order: jest.fn(() => ({ data: [], error: null }))
                })),
                order: jest.fn(() => ({ data: [], error: null }))
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => ({ data: {}, error: null }))
                }))
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({ data: {}, error: null }))
            })),
            delete: jest.fn(() => ({
                eq: jest.fn(() => ({ data: {}, error: null }))
            }))
        }))
    }
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Suppress console errors during tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
} 