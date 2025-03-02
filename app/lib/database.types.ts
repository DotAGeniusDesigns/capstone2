export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

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