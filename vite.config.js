import browserslistToEsbuild from 'browserslist-to-esbuild';
import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default ({ command }) => defineConfig({
    plugins: [
        solidPlugin(),
    ],
    build: {
        target: browserslistToEsbuild(),
        sourcemap: command === 'build',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'ListElixr',
            fileName: (format) => `ListElixr.${format}.js`,
        }
    }
});