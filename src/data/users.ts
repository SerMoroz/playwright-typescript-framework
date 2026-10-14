import { env } from '../config/env';

export interface User {
  username: string;
  password: string;
}

/** Built-in Sauce Demo accounts. Each one triggers a different login outcome. */
export const users = {
  standard: { username: 'standard_user', password: env.SAUCE_PASSWORD },
  lockedOut: { username: 'locked_out_user', password: env.SAUCE_PASSWORD },
} as const satisfies Record<string, User>;
