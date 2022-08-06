import fs from 'fs'
import dts from 'rollup-plugin-dts'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'

import pkg from './package.json'

const license = fs.readFileSync('LICENSE').toString('utf-8').trim()
const banner = `
/**
 * Proton Link v${pkg.version}
 * ${pkg.homepage}
 *
 * @license
 * ${license.replace(/\n/g, '\n * ')}
 */
`.trim()

const exportFix = `
(function () {
    var pkg = ProtonLink;
    ProtonLink = pkg.default;
    for (var key in pkg) {
        if (key === 'default') continue;
        ProtonLink[key] = pkg[key];
    }
})()
`

const replaceVersion = replace({
    preventAssignment: true,
    __ver: pkg.version,
})

export default [
    {
        input: 'src/index-bundle.ts',
        output: {
            banner,
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'default',
        },
        plugins: [replaceVersion, typescript({ target: 'es6' })],
        external: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
        onwarn,
    },
    {
        input: 'src/index.ts',
        output: {
            banner,
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
        },
        plugins: [replaceVersion, typescript({ target: 'es2020' })],
        external: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
        onwarn,
    },
    {
        input: 'src/index.ts',
        output: { banner, file: pkg.types, format: 'esm' },
        onwarn,
        plugins: [dts()],
    },
    {
        input: pkg.module,
        output: {
            banner,
            footer: exportFix,
            name: 'ProtonLink',
            file: pkg.unpkg,
            format: 'iife',
            sourcemap: true,
            exports: 'named',
        },
        plugins: [
            replaceVersion,
            resolve({ browser: true }),
            commonjs(),
            typescript({
                target: 'es2020'
            }),
            json(),
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
