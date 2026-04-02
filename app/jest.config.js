module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/auth$": "<rootDir>/test/auth.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/test/server-only.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
}
