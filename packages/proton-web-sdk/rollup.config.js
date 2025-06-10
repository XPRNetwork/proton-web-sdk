import { createRequire } from "module";
import fs from 'fs'
import dts from 'rollup-plugin-dts'
import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import {sveltePreprocess} from 'svelte-preprocess';

const pkg = createRequire(import.meta.url)("./package.json");

const production = false;

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * Proton Web SDK v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const exportFix = `
(function () {
    var pkg = ProtonWebSDK;
    ProtonWebSDK = pkg.default;
    for (var key in pkg) {
        if (key === 'default') continue;
        ProtonWebSDK[key] = pkg[key];
    }
})()
`

const replaceVersion = replace({
  preventAssignment: true,
  __ver: pkg.version,
})

const svelteOnWarn = (warning, handler) => {
    if (['a11y-click-events-have-key-events', 'a11y-interactive-supports-focus'].includes(warning.code)) return;
    // let Rollup handle all other warnings normally
    handler(warning);
}

export default [
  {
    input: 'src/index.ts',
    output: {
      banner,
      file: pkg.main,
      format: 'cjs',
      sourcemap: !production,
      exports: 'default',
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production
        },
        emitCss: false,
        onwarn: svelteOnWarn,
      }),
      replaceVersion,
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6'
      })
    ],
    external: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      banner,
      file: pkg.module,
      format: 'esm',
      sourcemap: !production,
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production
        },
        emitCss: false,
        onwarn: svelteOnWarn,
      }),
      replaceVersion,
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6',
      })
    ],
    external: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      banner,
      file: pkg.types,
      format: 'esm'
    },
    onwarn,
    plugins: [dts()],
  },
  {
    input: pkg.module,
    output: {
      banner,
      footer: exportFix,
      globals: { '@proton/link': 'ProtonLink' },
      name: 'ProtonWebSDK',
      file: pkg.unpkg,
      format: 'iife',
      sourcemap: !production,
      exports: 'named',
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production
        },
        emitCss: false,
        onwarn: svelteOnWarn,
      }),
      replaceVersion,
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      // ,
      json(),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6',
      }),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production')
        }
      }),
      terser({
        format: {
          comments(_, comment) {
            return comment.type === 'comment2' && /@license/.test(comment.value)
          },
          max_line_len: 500,
        },
      }),
    ],
    external: Object.keys({ ...pkg.peerDependencies }),
    onwarn,
  },
]

function onwarn(warning, rollupWarn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    // unnecessary warning
    return
  }
  if (
    warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
    warning.source === 'tslib' &&
    warning.names[0] === '__read'
  ) {
    // when using ts with importHelpers: true rollup complains about this
    // seems safe to ignore since __read is not actually imported or used anywhere in the resulting bundles
    return
  }
  rollupWarn(warning)
}
