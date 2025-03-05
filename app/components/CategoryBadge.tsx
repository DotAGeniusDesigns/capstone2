"use client"

import React from 'react'
import { Badge } from './ui/badge'

interface CategoryBadgeProps {
    category: string
}

const categoryColorMap: Record<string, string> = {
    'Movies': 'bg-blue-500',
    'TV Shows': 'bg-purple-500',
    'Music': 'bg-pink-500',
    'Games': 'bg-green-500',
    'Anime': 'bg-orange-500',
    'Books': 'bg-yellow-500',
    'Other': 'bg-gray-500'
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
    const colorClass = categoryColorMap[category] || 'bg-gray-500'

    return (
        <Badge className={`${colorClass} text-white`}>
            {category}
        </Badge>
    )
} 