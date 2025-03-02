"use client"

import React, { useState, useEffect } from "react"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { useCalendar } from "../context/CalendarContext"
import { categoryColors } from "../calendar/page"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function InterestsPage() {
  const { userInterests, toggleInterest } = useCalendar()

  const mainCategories = [
    "Movies",
    "TV Shows",
    "Anime",
    "Games",
    "Music"
  ]

  // Subcategories based on our sample data
  const subcategories: Record<string, string[]> = {
    "Movies": ["Sci-Fi", "Action", "Superhero", "Horror", "Thriller", "Adventure", "Drama", "Historical"],
    "TV Shows": ["Fantasy", "Drama", "Horror", "Thriller", "Sci-Fi", "Action", "Comedy"],
    "Anime": ["Action", "Fantasy", "Superhero", "Horror", "Comedy", "Supernatural"],
    "Games": ["RPG", "Open World", "Action", "Adventure", "Souls-like"],
    "Music": ["Pop", "Soul", "Hip-Hop", "Rap", "Alternative", "K-Pop", "R&B"]
  }

  // Helper functions
  const isSubcategoryInterest = (interest: string) => {
    return interest.includes(":");
  }

  const getMainCategoryFromSubcategory = (subcategoryInterest: string) => {
    return subcategoryInterest.split(":")[0];
  }

  // Find categories with selected subcategories for initial expansion
  const getInitialExpandedCategories = () => {
    const categoriesWithSelectedSubcategories = new Set<string>();

    userInterests.forEach(interest => {
      if (isSubcategoryInterest(interest)) {
        categoriesWithSelectedSubcategories.add(getMainCategoryFromSubcategory(interest));
      }
    });

    return Array.from(categoriesWithSelectedSubcategories);
  };

  const [expandedCategories, setExpandedCategories] = useState<string[]>(getInitialExpandedCategories())

  // Keep expanded categories in sync with subcategory selections
  useEffect(() => {
    const categoriesWithSelectedSubcategories = new Set<string>();

    userInterests.forEach(interest => {
      if (isSubcategoryInterest(interest)) {
        categoriesWithSelectedSubcategories.add(getMainCategoryFromSubcategory(interest));
      }
    });

    // Add any categories with selected subcategories to expanded list if not already there
    setExpandedCategories(prev => {
      const newExpanded = [...prev];
      categoriesWithSelectedSubcategories.forEach(category => {
        if (!newExpanded.includes(category)) {
          newExpanded.push(category);
        }
      });
      return newExpanded;
    });
  }, [userInterests]);

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-gray-500";
  }

  const toggleExpand = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getSubcategoryFromInterest = (subcategoryInterest: string) => {
    return subcategoryInterest.split(":")[1];
  }

  const isSubcategorySelected = (category: string, subcategory: string) => {
    return userInterests.has(`${category}:${subcategory}`);
  }

  const isCategoryExpanded = (category: string) => {
    return expandedCategories.includes(category);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Select Your Interests</h1>
      <p className="mb-6 text-gray-600">
        Select categories and subcategories you're interested in. Events matching your interests will be highlighted.
      </p>
      <div className="space-y-4">
        {mainCategories.map((category) => {
          const colorClass = getCategoryColor(category);
          const isChecked = userInterests.has(category);
          const isExpanded = isCategoryExpanded(category);
          const hasSubcategorySelected = Array.from(userInterests).some(interest =>
            isSubcategoryInterest(interest) && getMainCategoryFromSubcategory(interest) === category
          );

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <div
                className={`flex items-center justify-between p-4 ${colorClass} ${isChecked || hasSubcategorySelected ? 'bg-opacity-20' : 'bg-opacity-10'} hover:bg-opacity-25 transition-all cursor-pointer`}
                onClick={() => toggleExpand(category)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex justify-center items-center w-6 h-6 rounded-md ${colorClass} bg-opacity-30`}>
                    <Checkbox
                      id={category}
                      checked={isChecked}
                      onCheckedChange={() => toggleInterest(category)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=unchecked]:bg-white"
                    />
                  </div>
                  <Label
                    htmlFor={category}
                    className="font-medium cursor-pointer flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category}
                  </Label>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>

              {isExpanded && (
                <div className="p-3 pl-12 bg-gray-50 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subcategories[category].map(subcategory => (
                      <div key={`${category}-${subcategory}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category}-${subcategory}`}
                          checked={isSubcategorySelected(category, subcategory)}
                          onCheckedChange={() => toggleInterest(`${category}:${subcategory}`)}
                          className={`${colorClass} bg-opacity-20 border-gray-300`}
                        />
                        <Label
                          htmlFor={`${category}-${subcategory}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {subcategory}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

