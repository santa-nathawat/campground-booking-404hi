import type { CookieOptions } from 'express';
import type { Config } from '../../config/env.js';

export type AuthConfig = Pick<Config, 'JWT_SECRET' | 'NODE_ENV'>;
export const AUTH_COOKIE_NAME = 'token';
export const TOKEN_TTL_SECONDS = 3600;

export function authCookieOptions(environment: Config['NODE_ENV']): CookieOptions {
  return {
    httpOnly: true,
    secure: environment === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  };
}
