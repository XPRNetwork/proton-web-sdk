import {createRequire} from 'module'
import fs from 'fs'
import dts from 'rollup-plugin-dts'
import {babel} from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import nodePolyfills from 'rollup-plugin-polyfill-node'

const pkg = createRequire(import.meta.url)('./package.json')

const production = !process.env.ROLLUP_WATCH

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * EOSIO Signing Request v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const extensions = ['.js', '.mjs', '.ts']

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
        plugins: [typescript({target: 'es6', sourceMap: !production})],
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
        plugins: [typescript({target: 'es6', sourceMap: !production})],
        external: Object.keys({...pkg.dependencies, ...pkg.peerDependencies}),
        onwarn,
    },
    {
        input: 'src/index.ts',
        output: {banner, file: pkg.types, format: 'esm'},
        onwarn,
        plugins: [dts()],
    },
    {
        input: 'src/index.ts',
        output: {
            globals: {'@proton/link': 'ProtonLink'},
            banner,
            name: 'ProtonSigningRequest',
            file: pkg.unpkg,
            format: 'iife',
            sourcemap: !production,
            exports: 'named',
        },
        plugins: [
            nodePolyfills(),
            replaceVersion,
            resolve({extensions}),
            commonjs(),
            json(),
            babel({
                extensions,
                babelHelpers: 'bundled',
                include: ['src/**/*'],
                exclude: /node_modules\/core-js.*/,
                presets: [
                    '@babel/preset-typescript',
                    [
                        '@babel/preset-env',
                        {
                            targets: '>0.25%, not dead',
                            useBuiltIns: 'usage',
                            corejs: '3',
                            loose: true,
                        },
                    ],
                ],
                plugins: [
                    ['@babel/plugin-proposal-decorators', {legacy: true}],
                    ['@babel/plugin-transform-class-properties', {loose: true}],
                ],
                sourceMaps: !production,
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
