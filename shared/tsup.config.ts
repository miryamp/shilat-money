import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'entities/**/*.ts',
    'utils/**/*.ts',
    'index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  skipNodeModulesBundle: true,
  target: 'es2020',
  esExtension: true, // Emit .mjs for ESM, .cjs for CJS
});
