import { NextRequest } from 'next/server'
import { POST as signInHandler } from '../auth/signin/route'
import { POST as signUpHandler } from '../auth/signup/route'
import { POST as signOutHandler } from '../auth/signout/route'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js')

describe('Auth API Routes', () => {
    const mockCreateClient = createClient as jest.Mock
    const mockAuth = {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateClient.mockReturnValue({
            auth: mockAuth,
        })
    })

    describe('Sign In API', () => {
        test('returns 400 if email or password is missing', async () => {
            // Create request with missing email
            const req = new NextRequest('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ password: 'password123' }),
            })

            const response = await signInHandler(req)

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('Email and password are required')
        })

        test('returns 401 if sign in fails', async () => {
            // Mock failed sign in
            mockAuth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid login credentials' }
            })

            // Create request with valid credentials
            const req = new NextRequest('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'wrong-password' }),
            })

            const response = await signInHandler(req)

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toBe('Invalid login credentials')
        })

        test('returns 200 with user data if sign in succeeds', async () => {
            // Mock successful sign in
            mockAuth.signInWithPassword.mockResolvedValue({
                data: {
                    user: { id: '123', email: 'test@example.com' },
                    session: { access_token: 'token123' }
                },
                error: null
            })

            // Create request with valid credentials
            const req = new NextRequest('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
            })

            const response = await signInHandler(req)

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.user).toEqual({ id: '123', email: 'test@example.com' })
        })
    })

    describe('Sign Up API', () => {
        test('returns 400 if email or password is missing', async () => {
            // Create request with missing password
            const req = new NextRequest('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            })

            const response = await signUpHandler(req)

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('Email and password are required')
        })

        test('returns 400 if sign up fails', async () => {
            // Mock failed sign up
            mockAuth.signUp.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'User already registered' }
            })

            // Create request with valid credentials
            const req = new NextRequest('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email: 'existing@example.com', password: 'password123' }),
            })

            const response = await signUpHandler(req)

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('User already registered')
        })

        test('returns 201 with user data if sign up succeeds', async () => {
            // Mock successful sign up
            mockAuth.signUp.mockResolvedValue({
                data: {
                    user: { id: '456', email: 'new@example.com' },
                    session: { access_token: 'token456' }
                },
                error: null
            })

            // Create request with valid credentials
            const req = new NextRequest('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
            })

            const response = await signUpHandler(req)

            expect(response.status).toBe(201)
            const data = await response.json()
            expect(data.user).toEqual({ id: '456', email: 'new@example.com' })
        })
    })

    describe('Sign Out API', () => {
        test('returns 200 if sign out succeeds', async () => {
            // Mock successful sign out
            mockAuth.signOut.mockResolvedValue({ error: null })

            // Create request
            const req = new NextRequest('http://localhost:3000/api/auth/signout', {
                method: 'POST',
            })

            const response = await signOutHandler(req)

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.message).toBe('Signed out successfully')
        })

        test('returns 500 if sign out fails', async () => {
            // Mock failed sign out
            mockAuth.signOut.mockResolvedValue({
                error: { message: 'Server error' }
            })

            // Create request
            const req = new NextRequest('http://localhost:3000/api/auth/signout', {
                method: 'POST',
            })

            const response = await signOutHandler(req)

            expect(response.status).toBe(500)
            const data = await response.json()
            expect(data.error).toBe('Server error')
        })
    })
}) 