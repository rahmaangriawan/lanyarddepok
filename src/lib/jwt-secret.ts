import { shouldSkipDbDuringBuild } from "@/lib/build-env";

const BUILD_ONLY_JWT_SECRET = "build-only-secret-not-used-at-runtime";
const DEV_JWT_SECRET = "local-dev-secret-change-me";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (shouldSkipDbDuringBuild()) {
    return BUILD_ONLY_JWT_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_JWT_SECRET;
  }

  throw new Error("JWT_SECRET is required in production");
}
