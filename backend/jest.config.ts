import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('../tsconfig.base.json');

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  moduleDirectories: ['node_modules', 'src'], // resolves from backend/src
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/../../'
  }),
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
};
