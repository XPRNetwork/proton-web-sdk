import {createRequire} from 'module'
import fs from 'fs'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

const pkg = createRequire(import.meta.url)('./package.json')
const production = !process.env.ROLLUP_WATCH

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * Proton React Native SDK v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const replaceVersion = replace({
  preventAssignment: true,
  __ver: pkg.version,
})

export default [
  {
    input: 'src/index.ts',
    output: {
      banner,
      file: pkg.main,
      format: 'cjs',
      sourcemap: !production,
      exports: 'named',
    },
    plugins: [
      replaceVersion,
      typescript({
        sourceMap: !production,
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
      replaceVersion,
      typescript({
        sourceMap: !production,
        target: 'es6',
      }),
    ],
    external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
    onwarn,
  },

  {
    input: 'src/index.ts',
    output: {banner, file: pkg.types, format: 'esm'},
    onwarn,
    plugins: [dts()],
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
