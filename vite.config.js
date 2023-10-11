import browserslistToEsbuild from 'browserslist-to-esbuild';
import path from 'path';
import { defineConfig } from 'vite';

export default ({ command }) => defineConfig({
    build: {
        target: browserslistToEsbuild(),
        sourcemap: command === 'build',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'ListElixr',
            fileName: 'ListElixr',
        }
    }
});