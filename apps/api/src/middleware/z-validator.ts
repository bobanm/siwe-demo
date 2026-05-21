import { zValidator as zv } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import type { ValidationTargets } from 'hono'
import type { z } from 'zod'

/**
 * Wraps `@hono/zod-validator`'s `zValidator` with a custom error hook.
 *
 * By default, `zValidator` returns raw Zod error responses (`{ success: false, error: ... }`)
 * with status 400. This wrapper intercepts validation failures and throws `HTTPException(422)`
 * with a user-friendly message, keeping all API errors consistent with the`{ error: string }`
 * format defined in the global `onError` handler.
 */
export const zValidator = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
    zv(target, schema, (result) => {
        if (!result.success) {
            const message = result.error.issues
                .map(issue => `[${issue.path.join('.')}]: ${issue.message}`)
                .join('. ')

            throw new HTTPException(422, { message })
        }
    })
