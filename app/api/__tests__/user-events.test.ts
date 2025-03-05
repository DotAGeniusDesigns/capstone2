import { NextRequest } from 'next/server'
import { GET as getUserEventsHandler } from '../user-events/route'
import { POST as createUserEventHandler } from '../user-events/route'
import { DELETE as deleteUserEventHandler } from '../user-events/[id]/route'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js')

describe('User Events API Routes', () => {
    const mockCreateClient = createClient as jest.Mock
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        single: jest.fn(),
        data: null,
        error: null,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateClient.mockReturnValue(mockSupabase)
    })

    describe('GET /api/user-events', () => {
        test('returns 401 if user is not authenticated', async () => {
            // Mock unauthenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Not authenticated' }
            })

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events')

            const response = await getUserEventsHandler(req)

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toBe('Not authenticated')
        })

        test('returns 200 with user events if authenticated', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock successful query
            const mockUserEvents = [
                { id: '1', user_id: '123', event_id: 'event1', is_favorite: true },
                { id: '2', user_id: '123', event_id: 'event2', is_favorite: false }
            ]
            mockSupabase.data = mockUserEvents
            mockSupabase.error = null

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events')

            const response = await getUserEventsHandler(req)

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data).toEqual(mockUserEvents)
        })

        test('returns 500 if database query fails', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock failed query
            mockSupabase.data = null
            mockSupabase.error = { message: 'Database error' }

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events')

            const response = await getUserEventsHandler(req)

            expect(response.status).toBe(500)
            const data = await response.json()
            expect(data.error).toBe('Database error')
        })
    })

    describe('POST /api/user-events', () => {
        test('returns 401 if user is not authenticated', async () => {
            // Mock unauthenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Not authenticated' }
            })

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events', {
                method: 'POST',
                body: JSON.stringify({ event_id: 'event1', is_favorite: true }),
            })

            const response = await createUserEventHandler(req)

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toBe('Not authenticated')
        })

        test('returns 400 if event_id is missing', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Create request with missing event_id
            const req = new NextRequest('http://localhost:3000/api/user-events', {
                method: 'POST',
                body: JSON.stringify({ is_favorite: true }),
            })

            const response = await createUserEventHandler(req)

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.error).toBe('Event ID is required')
        })

        test('returns 201 with created user event', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock successful insert
            const mockCreatedEvent = {
                id: '1',
                user_id: '123',
                event_id: 'event1',
                is_favorite: true,
                created_at: '2023-01-01T00:00:00Z'
            }
            mockSupabase.data = mockCreatedEvent
            mockSupabase.error = null

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events', {
                method: 'POST',
                body: JSON.stringify({ event_id: 'event1', is_favorite: true }),
            })

            const response = await createUserEventHandler(req)

            expect(response.status).toBe(201)
            const data = await response.json()
            expect(data).toEqual(mockCreatedEvent)
        })

        test('returns 500 if database insert fails', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock failed insert
            mockSupabase.data = null
            mockSupabase.error = { message: 'Database error' }

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events', {
                method: 'POST',
                body: JSON.stringify({ event_id: 'event1', is_favorite: true }),
            })

            const response = await createUserEventHandler(req)

            expect(response.status).toBe(500)
            const data = await response.json()
            expect(data.error).toBe('Database error')
        })
    })

    describe('DELETE /api/user-events/[id]', () => {
        test('returns 401 if user is not authenticated', async () => {
            // Mock unauthenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Not authenticated' }
            })

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events/1')
            const params = { params: { id: '1' } }

            const response = await deleteUserEventHandler(req, params)

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toBe('Not authenticated')
        })

        test('returns 200 if user event is deleted', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock successful delete
            mockSupabase.data = { id: '1' }
            mockSupabase.error = null

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events/1')
            const params = { params: { id: '1' } }

            const response = await deleteUserEventHandler(req, params)

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.message).toBe('User event deleted successfully')
        })

        test('returns 404 if user event is not found', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock not found
            mockSupabase.data = null
            mockSupabase.error = { code: 'PGRST116', message: 'Not found' }

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events/999')
            const params = { params: { id: '999' } }

            const response = await deleteUserEventHandler(req, params)

            expect(response.status).toBe(404)
            const data = await response.json()
            expect(data.error).toBe('User event not found')
        })

        test('returns 500 if database delete fails', async () => {
            // Mock authenticated user
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            })

            // Mock failed delete
            mockSupabase.data = null
            mockSupabase.error = { message: 'Database error' }

            // Create request
            const req = new NextRequest('http://localhost:3000/api/user-events/1')
            const params = { params: { id: '1' } }

            const response = await deleteUserEventHandler(req, params)

            expect(response.status).toBe(500)
            const data = await response.json()
            expect(data.error).toBe('Database error')
        })
    })
}) 