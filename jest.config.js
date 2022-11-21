module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    },
  },
  roots: ['<rootDir>/src'],
  cacheDirectory: '<rootDir>/.jest-cache'
};
