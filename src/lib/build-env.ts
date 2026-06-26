export function shouldSkipDbDuringBuild() {
  return process.env.SKIP_DB_DURING_BUILD === "true";
}
