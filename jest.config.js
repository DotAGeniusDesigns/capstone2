const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        // Handle module aliases (if you configured any in your Next.js app)
        '^@/components/(.*)$': '<rootDir>/app/components/$1',
        '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
        '^@/context/(.*)$': '<rootDir>/app/context/$1',
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/'
    ],
    transform: {
        // Use babel-jest to transpile tests with the next/babel preset
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
    },
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '^.+\\.module\\.(css|sass|scss)$'
    ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 