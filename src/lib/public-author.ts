export const PUBLIC_AUTHOR_NAME = "Admin Lanyard Bogor";
export const PUBLIC_AUTHOR_ROLE = "Tim Editorial Lanyard Bogor";

export function getPublicAuthorName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed || trimmed.includes("@")) {
    return PUBLIC_AUTHOR_NAME;
  }

  return trimmed;
}
