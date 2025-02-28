import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/test/**',
        '!src/lambda.ts',
        '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true
};

export default config;