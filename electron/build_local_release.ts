import { build, } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';


async function buildProject() {
    console.log("building...")
    const res = await build({
        entryPoints: ['./local/src/main.ts','./local/src/preload.ts'],
        bundle: true,
        minify: true,
        platform: "node",
        target: "es2022",
        sourcemap: false,
        tsconfig: './tsconfig.json',
        external: ['electron','openvino-node'],
        outdir: './release/local/build',
        plugins: [
            copy({
                resolveFrom: 'cwd',
                assets: {
                    from: ['local/src/**/*.html'],
                    to: ['release/local/build'],
                },
            }),
        ],
    });
}

buildProject();