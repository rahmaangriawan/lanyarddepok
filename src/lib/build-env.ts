export function shouldSkipDbDuringBuild() {
  return (
    process.env.SKIP_DB_DURING_BUILD === "true" &&
    process.env.npm_lifecycle_event === "build"
  );
}
