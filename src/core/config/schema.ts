import { z } from 'zod';

const base = z.object({
  // runtime environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // port: accept string or number, coerce to number with a default of 3000
  PORT: z.preprocess((val) => {
    if (val === undefined) return 3000;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }, z.number().int().positive()),

  // feature flag: coerce common truthy strings to boolean
  AUTH_ENABLED: z.preprocess((val) => {
    if (val === undefined) return false;
    if (typeof val === 'boolean') return val;
    return String(val).toLowerCase() === 'true';
  }, z.boolean()).default(false)
});

// DATABASE_URL is required in production; optional elsewhere to ease local development.
export const envSchema = process.env.NODE_ENV === 'production'
  ? base.extend({ DATABASE_URL: z.string().nonempty() })
  : base.extend({ DATABASE_URL: z.string().optional() });

export type Env = z.infer<typeof envSchema>;