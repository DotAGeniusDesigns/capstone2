# Release Calendar Database Schema

This document outlines the database schema for the Release Calendar application.

## Overview

The Release Calendar application uses a PostgreSQL database hosted on Supabase. The schema consists of the following tables:

1. `events` - Stores all release information
2. `user_events` - Stores user-specific event information (favorites, reminders, etc.)

## Table Definitions

### Events Table

The `events` table is the primary table that stores all release information.

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    release_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    subcategory1 TEXT NULL,
    subcategory2 TEXT NULL,
    link TEXT NULL,
    created_by UUID REFERENCES auth.users(id) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_release_date ON events(release_date);
CREATE INDEX idx_events_created_by ON events(created_by);
```

#### Fields:

- `id`: Unique identifier for each event (UUID)
- `title`: The title of the release (required)
- `description`: A description of the release
- `release_date`: The date and time when the release becomes available (required)
- `category`: The category of the release (Movies, TV Shows, Anime, Games, Music)
- `subcategory1`: First optional subcategory for the release (nullable)
- `subcategory2`: Second optional subcategory for the release (nullable)
- `link`: Optional URL for more information about the release (nullable)
- `created_by`: Reference to the user who created the event (nullable for admin/system created events)
- `created_at`: Timestamp when the event was created
- `updated_at`: Timestamp when the event was last updated

### User Events Table

The `user_events` table stores user-specific information about events, such as favorites.

```sql
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    reminder_time TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_id ON user_events(event_id);
```

#### Fields:

- `id`: Unique identifier for each user event record (UUID)
- `user_id`: Reference to the user (required)
- `event_id`: Reference to the event (required)
- `is_favorite`: Indicates if the event is favorited by the user
- `reminder_time`: Optional timestamp for when the user wants to be reminded about the event
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated

## TypeScript Type Definitions

The database schema is represented in TypeScript using the following type definitions:

```typescript
export interface Database {
    public: {
        Tables: {
            events: {
                Row: {
                    id: string
                    title: string
                    description: string
                    release_date: string
                    category: string
                    subcategory1: string | null
                    subcategory2: string | null
                    link: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    release_date: string
                    category: string
                    subcategory1?: string | null
                    subcategory2?: string | null
                    link?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    release_date?: string
                    category?: string
                    subcategory1?: string | null
                    subcategory2?: string | null
                    link?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "events_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            },
            user_events: {
                Row: {
                    id: string
                    user_id: string
                    event_id: string
                    is_favorite: boolean
                    reminder_time: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    event_id: string
                    is_favorite?: boolean
                    reminder_time?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    event_id?: string
                    is_favorite?: boolean
                    reminder_time?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_events_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_events_event_id_fkey"
                        columns: ["event_id"]
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
```

## Entity Relationship Diagram

```
[auth.users]
  - id (PK)
  - email
  - ...other auth fields

[events]
  - id (PK)
  - title
  - description
  - release_date
  - category
  - subcategory1
  - subcategory2
  - link
  - created_by (FK -> auth.users.id)
  - created_at
  - updated_at

[user_events]
  - id (PK)
  - user_id (FK -> auth.users.id)
  - event_id (FK -> events.id)
  - is_favorite
  - reminder_time
  - created_at
  - updated_at
```

## Security

The database uses Supabase's Row Level Security (RLS) to control access to the data:

```sql
-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT USING (true);

CREATE POLICY "Users can insert their own events" 
ON events FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
ON events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
ON events FOR DELETE USING (auth.uid() = created_by);

-- User events policies
CREATE POLICY "Users can view their own user_events" 
ON user_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_events" 
ON user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_events" 
ON user_events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_events" 
ON user_events FOR DELETE USING (auth.uid() = user_id);
```

## Complete Setup Script

Here's the complete SQL script to set up the database:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table (main table for all releases)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    release_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    subcategory1 TEXT NULL,
    subcategory2 TEXT NULL,
    link TEXT NULL,
    created_by UUID REFERENCES auth.users(id) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User events table (for user-specific event data)
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    reminder_time TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_release_date ON events(release_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_id ON user_events(event_id);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT USING (true);

CREATE POLICY "Users can insert their own events" 
ON events FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
ON events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
ON events FOR DELETE USING (auth.uid() = created_by);

-- User events policies
CREATE POLICY "Users can view their own user_events" 
ON user_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_events" 
ON user_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_events" 
ON user_events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_events" 
ON user_events FOR DELETE USING (auth.uid() = user_id);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_events_updated_at
BEFORE UPDATE ON user_events
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
```

## Sample Data

Here's some sample data to populate the database for testing:

```sql
-- Sample events data
INSERT INTO events (title, description, release_date, category, subcategory1, subcategory2, link) VALUES
('Dune: Part Two', 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.', '2024-03-01T00:00:00Z', 'Movies', 'Sci-Fi', 'Adventure', 'https://www.imdb.com/title/tt15239678/'),
('Stranger Things Season 5', 'The final season of the hit Netflix series.', '2024-07-15T00:00:00Z', 'TV Shows', 'Sci-Fi', 'Horror', 'https://www.netflix.com/title/80057281'),
('Attack on Titan: Final Season', 'The epic conclusion to the anime series.', '2024-04-10T00:00:00Z', 'Anime', 'Action', 'Drama', 'https://www.imdb.com/title/tt2560140/'),
('The Legend of Zelda: Echoes of Wisdom', 'Play as Zelda in this new adventure.', '2024-05-23T00:00:00Z', 'Games', 'Adventure', 'RPG', 'https://www.nintendo.com/us/store/products/the-legend-of-zelda-echoes-of-wisdom-switch/'),
('Taylor Swift - The Tortured Poets Department', 'New album release.', '2024-04-19T00:00:00Z', 'Music', 'Pop', NULL, 'https://www.taylorswift.com/');
```

## User Authentication

The application uses Supabase Auth for user authentication, which provides:

1. Email/password authentication
2. Social login options (Google, GitHub, etc.)
3. Email verification
4. Password reset functionality
5. JWT token-based sessions

User authentication is managed through the Supabase client library and custom API routes.

## User Features

With authentication in place, users can:

1. Create personal accounts
2. Save their category preferences
3. Mark events as favorites
4. Set reminders for upcoming releases
5. Add their own events to the calendar (which are associated with their user ID)

## API Usage

The database is accessed through Supabase client in the application. Here's an example of how events are fetched with user-specific data:

```typescript
// GET /api/events
export async function GET(request: Request) {
    const { data: { user } } = await supabase.auth.getUser()
    const url = new URL(request.url)
    const categories = url.searchParams.get('categories')?.split(',').filter(Boolean) || []

    try {
        let query = supabase
            .from('events')
            .select(`
                *,
                user_events!inner(*)
            `)
            .eq('user_events.user_id', user.id)

        // Apply category filter if provided
        if (categories.length > 0) {
            query = query.in('category', categories)
        }

        const { data, error } = await query.order('release_date', { ascending: true })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Return empty array if no data
        if (!data) {
            return NextResponse.json({ events: [] })
        }

        // Return events array
        return NextResponse.json({
            events: data
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

## Future Enhancements

Potential future enhancements to the schema could include:

1. User profiles with additional preferences
2. Social features (comments, ratings, discussions)
3. User activity history
4. Notifications system
5. Event categories management system
6. Event reminders and notifications
7. Social sharing features
8. Admin dashboard for content management 