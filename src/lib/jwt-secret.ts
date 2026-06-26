import { shouldSkipDbDuringBuild } from "@/lib/build-env";

const BUILD_ONLY_JWT_SECRET = "build-only-secret-not-used-at-runtime";
const DEV_JWT_SECRET = "local-dev-secret-change-me";
const LEGACY_PRODUCTION_FALLBACK = "fallback-secret-key-for-local-dev-123456";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (shouldSkipDbDuringBuild()) {
    return BUILD_ONLY_JWT_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_JWT_SECRET;
  }

  console.error("JWT_SECRET is missing in production. Using legacy fallback temporarily; set JWT_SECRET in hosting env.");
  return LEGACY_PRODUCTION_FALLBACK;
}
