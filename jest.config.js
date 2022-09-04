const testRoot = '<rootDir>/__tests__';
const singleTestMatch = '*.test.ts';
const integrationTestsFolderName = 'integration';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  roots: [
    testRoot,
  ],
  testMatch: [
    `${testRoot}/${integrationTestsFolderName}/**/${singleTestMatch}`,
  ],
  maxWorkers: 1,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  rootDir: '.',
  verbose: false,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  // An array of regexp pattern strings used to skip coverage collection
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "package.json",
    "pnpm-lock.yaml",
    ".eslintrc.js",
  ]
};
