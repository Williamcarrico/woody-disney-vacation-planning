import React from 'react'
import { 
  whimsicalFonts, 
  getFontsByCategory, 
  tailwindClasses,
  disneyThemeRecommendations 
} from '../whimsical-fonts.config'

/**
 * Font Showcase Component
 * Demonstrates all 7 whimsical fonts in Disney-themed contexts
 */
export function FontShowcase() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Page Header */}
      <header className="text-center mb-16">
        <h1 className="font-londrina-shadow text-6xl text-blue-600 mb-4">
          WHIMSICAL FONTS SHOWCASE
        </h1>
        <p className="font-sunshiney text-2xl text-yellow-500">
          Bringing Disney Magic to Typography ✨
        </p>
      </header>

      {/* Individual Font Demonstrations */}
      <section className="space-y-16">
        {whimsicalFonts.map((font, index) => (
          <div key={font.name} className="border-2 border-purple-200 rounded-2lg p-8 bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Font Header */}
            <div className="mb-6">
              <h2 className={`${font.className} text-4xl mb-2`} style={{ color: getFontColor(index) }}>
                {font.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {font.category}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {font.className}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{font.description}</p>
              <p className="text-purple-700 font-medium">{font.disneyThemeMatch}</p>
            </div>

            {/* Size Demonstrations */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Size Variations</h3>
              <div className={`${font.className} space-y-2`}>
                <div className="text-6xl" style={{ color: getFontColor(index) }}>
                  Magical Adventure
                </div>
                <div className="text-4xl" style={{ color: getFontColor(index) }}>
                  Disney Dreams Come True
                </div>
                <div className="text-2xl" style={{ color: getFontColor(index) }}>
                  Planning Your Perfect Vacation
                </div>
                <div className="text-lg" style={{ color: getFontColor(index) }}>
                  Experience the magic of Disney with every detail carefully planned
                </div>
              </div>
            </div>

            {/* Use Case Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Disney Context Examples</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {font.useCases.slice(0, 4).map((useCase, useCaseIndex) => (
                  <div key={useCaseIndex} className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{useCase}</h4>
                    <div className={`${font.className} text-lg`} style={{ color: getFontColor(index) }}>
                      {getExampleText(font.name, useCase)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Disney Park Themed Sections */}
      <section className="space-y-12">
        <h2 className="font-londrina-shadow text-4xl text-center text-purple-600 mb-8">
          Disney Park Themes
        </h2>
        
        {/* Magic Kingdom */}
        <div className="bg-gradient-to-br from-yellow-50 to-pink-50 p-8 rounded-2lg">
          <h3 className="font-sunshiney text-3xl text-yellow-600 mb-6 text-center">
            🏰 Magic Kingdom
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-sunshiney text-2xl text-yellow-500 mb-3">
                Welcome to the Magic!
              </h4>
              <p className="font-crafty-girls text-lg text-pink-600">
                Where fairy tales come to life and dreams really do come true
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-crafty-girls text-xl text-pink-600 mb-3">
                Family Fun Activities
              </h4>
              <p className="font-just-me-again-down-here text-lg text-purple-600">
                Create magical memories with Mickey and friends
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-just-me-again-down-here text-xl text-purple-600 mb-3">
                Personal Touch
              </h4>
              <p className="font-sunshiney text-lg text-yellow-500">
                ✨ Your magical story begins here ✨
              </p>
            </div>
          </div>
        </div>

        {/* EPCOT */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2lg">
          <h3 className="font-kranky text-3xl text-blue-600 mb-6 text-center">
            🌍 EPCOT
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-kranky text-2xl text-blue-600 mb-3">
                Future World
              </h4>
              <p className="font-schoolbell text-lg text-green-600">
                Discover innovation and technology that shapes tomorrow
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-schoolbell text-xl text-green-600 mb-3">
                World Showcase
              </h4>
              <p className="font-londrina-shadow text-lg text-blue-600">
                EXPLORE THE WORLD
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-londrina-shadow text-xl text-blue-600 mb-3">
                LEARN & DISCOVER
              </h4>
              <p className="font-kranky text-lg text-green-600">
                Educational adventures await
              </p>
            </div>
          </div>
        </div>

        {/* Hollywood Studios */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2lg">
          <h3 className="font-rock-salt text-3xl text-red-600 mb-6 text-center">
            🎬 Hollywood Studios
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-rock-salt text-2xl text-red-600 mb-3">
                Star Wars Galaxy
              </h4>
              <p className="font-londrina-shadow text-lg text-orange-600">
                MAY THE FORCE BE WITH YOU
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-londrina-shadow text-xl text-orange-600 mb-3">
                MOVIE MAGIC
              </h4>
              <p className="font-kranky text-lg text-red-600">
                Behind the scenes excitement
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-kranky text-xl text-red-600 mb-3">
                Action & Adventure
              </h4>
              <p className="font-rock-salt text-lg text-orange-600">
                Thrills around every corner
              </p>
            </div>
          </div>
        </div>

        {/* Animal Kingdom */}
        <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-8 rounded-2lg">
          <h3 className="font-rock-salt text-3xl text-green-600 mb-6 text-center">
            🦁 Animal Kingdom
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-rock-salt text-2xl text-green-600 mb-3">
                Wild Adventures
              </h4>
              <p className="font-just-me-again-down-here text-lg text-orange-600">
                Discover the natural world and its wonders
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-just-me-again-down-here text-xl text-orange-600 mb-3">
                Nature's Beauty
              </h4>
              <p className="font-crafty-girls text-lg text-green-600">
                Conservation meets adventure
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-crafty-girls text-xl text-green-600 mb-3">
                Family Explorer
              </h4>
              <p className="font-rock-salt text-lg text-orange-600">
                Wild family fun awaits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Font Categories */}
      <section>
        <h2 className="font-londrina-shadow text-4xl text-center text-purple-600 mb-8">
          FONT CATEGORIES
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {(['cursive', 'serif', 'sans-serif'] as const).map(category => {
            const fontsInCategory = getFontsByCategory(category)
            return (
              <div key={category} className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-700 mb-4 capitalize text-center">
                  {category} Fonts ({fontsInCategory.length})
                </h3>
                <div className="space-y-4">
                  {fontsInCategory.map(font => (
                    <div key={font.name} className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className={`${font.className} text-xl mb-1`} style={{ color: getCategoryColor(category) }}>
                        {font.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {font.useCases[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t-2 border-purple-200">
        <p className="font-sunshiney text-2xl text-yellow-500 mb-2">
          ✨ Magic in Every Letter ✨
        </p>
        <p className="font-crafty-girls text-lg text-pink-600">
          Making your Disney vacation planning as magical as the destination
        </p>
      </footer>
    </div>
  )
}

// Helper functions
function getFontColor(index: number): string {
  const colors = [
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#3B82F6', // blue
    '#EF4444', // red
    '#EC4899', // pink
    '#10B981', // emerald
    '#F97316'  // orange
  ]
  return colors[index % colors.length]
}

function getCategoryColor(category: 'cursive' | 'serif' | 'sans-serif'): string {
  switch (category) {
    case 'cursive': return '#EC4899' // pink
    case 'serif': return '#3B82F6'   // blue
    case 'sans-serif': return '#10B981' // emerald
    default: return '#8B5CF6' // purple
  }
}

function getExampleText(fontName: string, useCase: string): string {
  const examples: Record<string, Record<string, string>> = {
    "Just Me Again Down Here": {
      "Personal messages": "Dear Diary, today was absolutely magical!",
      "Casual headings": "Sarah's Disney Adventure",
      "User testimonials": "Best vacation ever! - The Johnson Family",
      "Character quotes": "To all who come to this happy place, welcome!"
    },
    "Kranky": {
      "Playful headings": "It's a Small World After All",
      "Attraction names": "Pirates of the Caribbean",
      "Fun announcements": "FastPass+ Now Available!",
      "Event titles": "Mickey's Very Merry Christmas Party"
    },
    "Londrina Shadow": {
      "Hero titles": "WELCOME TO MAGIC KINGDOM",
      "Call-to-action buttons": "BOOK NOW",
      "Important announcements": "PARK HOURS EXTENDED",
      "Section headers": "DINING RESERVATIONS"
    },
    "Rock Salt": {
      "Artistic headings": "Splash Mountain Adventure",
      "Adventure themes": "Expedition Everest",
      "Rustic content": "Frontierland Exploration",
      "Creative captions": "Wild West Fun Awaits"
    },
    "Crafty Girls": {
      "DIY sections": "Make Your Own Mickey Ears",
      "Tips and tricks": "Pro Tip: Use Genie+ wisely",
      "Family content": "Fun for the Whole Family",
      "Planning notes": "Don't forget your park tickets!"
    },
    "Schoolbell": {
      "Educational content": "Walt Disney World opened in 1971",
      "Tips and guides": "How to maximize your FastPass",
      "Historical information": "The Story Behind the Magic",
      "Study materials": "Disney Park Facts & Trivia"
    },
    "Sunshiney": {
      "Happy messages": "Have a Magical Day!",
      "Celebration content": "Happy Birthday Princess!",
      "Positive quotes": "Dreams Really Do Come True",
      "Welcome messages": "Welcome Home to Disney!"
    }
  }
  
  return examples[fontName]?.[useCase] || "Magical Disney Experience!"
}

export default FontShowcase 