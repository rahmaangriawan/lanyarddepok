export const AUTH_COOKIE_NAME = "token";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function authCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge,
    path: "/",
  };
}
