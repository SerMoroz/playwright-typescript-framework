import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

/**
 * Single source of truth for runtime configuration.
 *
 * Every value can be overridden through environment variables (or a local `.env` file),
 * which lets the same suite run against different environments without code changes.
 * The schema fails fast on start-up if a value is malformed, instead of failing deep inside a test.
 */
const EnvSchema = z.object({
  BASE_URL: z.url().default('https://www.saucedemo.com'),
  API_BASE_URL: z.url().default('https://restful-booker.herokuapp.com'),
  // Public demo credentials published on the Sauce Demo login page.
  SAUCE_PASSWORD: z.string().min(1).default('secret_sauce'),
  // Public demo credentials published in the Restful Booker API docs.
  API_USERNAME: z.string().min(1).default('admin'),
  API_PASSWORD: z.string().min(1).default('password123'),
});

export const env = EnvSchema.parse(process.env);
