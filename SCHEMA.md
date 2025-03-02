# Release Calendar Database Schema

This document outlines the database schema for the Release Calendar application.

## Overview

The Release Calendar application uses a PostgreSQL database hosted on Supabase. The schema consists of a single table:

1. `events` - Stores all release information

## Table Definition

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
    link TEXT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_release_date ON events(release_date);
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
                }
                Relationships: []
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
[events]
  - id (PK)
  - title
  - description
  - release_date
  - category
  - subcategory1
  - subcategory2
  - link
```

## Security

The database uses Supabase's Row Level Security (RLS) to control access to the data:

```sql
-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access to events" ON events FOR DELETE USING (true);
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
    link TEXT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_release_date ON events(release_date);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your security needs)
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access to events" ON events FOR DELETE USING (true);
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

## API Usage

The database is accessed through Supabase client in the application. Here's an example of how the events are fetched:

```typescript
// GET /api/events
export async function GET(request: Request) {
    const url = new URL(request.url)
    const categories = url.searchParams.get('categories')?.split(',').filter(Boolean) || []

    try {
        let query = supabase
            .from('events')
            .select('*')

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
            events: data as Event[]
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

## User Interests Implementation

User interests are managed client-side using local storage instead of a database table. This approach:

1. Simplifies the implementation by avoiding the need for user authentication
2. Provides faster performance for client-side filtering
3. Works well for the MVP stage of the application

The application stores user category preferences in the browser's local storage and uses them to filter events on the client side.

## Category System

The application uses a hierarchical category system:

1. Main categories: Movies, TV Shows, Anime, Games, Music
2. Subcategories: Each event can have up to two subcategories (subcategory1, subcategory2)

Users can filter events by both main categories and subcategories. The UI represents each category with a distinct color:

```typescript
export const categoryColors: { [key: string]: string } = {
  Movies: "bg-red-500",
  "TV Shows": "bg-blue-500",
  Anime: "bg-purple-500",
  Games: "bg-amber-500",
  Music: "bg-green-500",
}

export const categoryBgColors: { [key: string]: string } = {
  Movies: "bg-red-100",
  "TV Shows": "bg-blue-100",
  Anime: "bg-purple-100",
  Games: "bg-amber-100",
  Music: "bg-green-100",
}
```

## Future Enhancements

Potential future enhancements to the schema could include:

1. User authentication and user profiles
2. Server-side storage of user interests for cross-device synchronization
3. Normalized categories table
4. Support for external API data sources
5. User saved/favorited releases
6. Event reminders and notifications
7. Social sharing features 