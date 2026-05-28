import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'

export default defineConfig({
    plugins: [
        cloudflareTest(async () => {
            const migrationsPath = path.join(import.meta.dirname, 'drizzle')
            const migrations = await readD1Migrations(migrationsPath)
            return {
                wrangler: {
                    configPath: './wrangler.toml',
                },
                miniflare: {
                    bindings: { TEST_MIGRATIONS: migrations },
                },
            }
        }),
    ],
    test: {
        globals: true,
        setupFiles: ['./test/setup.ts'],
        reporters: 'dot',
        silent: true,  // suppresses all console.log/warn/error output
    },
})
