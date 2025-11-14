import {createRequire} from 'module'
import fs from 'fs'
import dts from 'rollup-plugin-dts'
import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import {sveltePreprocess} from 'svelte-preprocess'

const pkg = createRequire(import.meta.url)('./package.json')

const production = !process.env.ROLLUP_WATCH

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * Proton Browser Transport v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const replaceVersion = replace({
  preventAssignment: true,
  __ver: `${pkg.version}`,
})

const svelteOnWarn = (warning, handler) => {
  if (
    ['a11y-click-events-have-key-events', 'a11y-interactive-supports-focus'].includes(warning.code)
  )
    return
  // let Rollup handle all other warnings normally
  handler(warning)
}

const getCssHash = ({hash, css, filename}) => {
  return `pbt-${hash(filename + css)}`
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
        preprocess: sveltePreprocess({sourceMap: !production}),
        compilerOptions: {
          cssHash: getCssHash,
          // enable run-time checks when not in production
          dev: !production,
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
        dedupe: ['svelte'],
      }),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6',
      }),
    ],
    external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
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
        preprocess: sveltePreprocess({sourceMap: !production}),
        compilerOptions: {
          cssHash: getCssHash,
          // enable run-time checks when not in production
          dev: !production,
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
        dedupe: ['svelte'],
      }),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6',
      }),
    ],
    external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      banner,
      file: pkg.types,
      format: 'esm',
    },
    onwarn,
    plugins: [dts()],
  },
  {
    input: 'src/index.ts',
    output: {
      globals: {'@proton/link': 'ProtonLink'},
      banner,
      name: 'ProtonBrowserTransport',
      file: pkg.unpkg,
      format: 'iife',
      sourcemap: !production,
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({sourceMap: !production}),
        compilerOptions: {
          cssHash: getCssHash,
          // enable run-time checks when not in production
          dev: !production,
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
        dedupe: ['svelte'],
      }),
      json(),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        target: 'es6',
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
    external: Object.keys({...pkg.peerDependencies}),
    onwarn,
  },
]

function onwarn(warning, rollupWarn) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    rollupWarn(warning)
  }
}
