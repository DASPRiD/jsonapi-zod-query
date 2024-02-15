import { resolve } from "path";
import {defineConfig} from 'vitest/config';
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts(),
    ],
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: ["zod"],
        },
    },
    test: {
        coverage: {
            all: false,
        },
    },
});
