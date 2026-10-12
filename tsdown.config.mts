import { defineConfig } from 'tsdown';

export default defineConfig({
  workspace: {
    include: ['packages/*'],
  },
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  deps: {
    neverBundle: true,
  },
  // Keep .js/.mjs/.d.ts output names (packages have no "type" field, so .js is
  // CommonJS) instead of tsdown's node-platform default of .cjs/.mjs.
  fixedExtension: false,
  // Node always resolves the CommonJS build and bundlers the ESM build (via the
  // `module` condition). Mapping `import`/`require` to different files would let
  // one process load two copies of a package and break `instanceof` checks.
  exports: {
    customExports(exports) {
      return Object.fromEntries(
        Object.entries(exports).map(([key, value]) =>
          value && typeof value === 'object' && 'import' in value && 'require' in value
            ? [key, { module: value.import, default: value.require }]
            : [key, value],
        ),
      );
    },
  },
  outDir: 'build',
  tsconfig: 'tsconfig.compile.json',
  attw: {
    level: 'error',
    profile: "node16",
  },
});
