/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageDirectory: ".coverage/",
  collectCoverageFrom:[
    "src/**/*.{ts,tsx,js,jsx}",
    "!**/node_modules/**"
  ]
};