export const PUBLIC_AUTHOR_NAME = "Admin Lanyard Jakarta";
export const PUBLIC_AUTHOR_ROLE = "Tim Editorial Lanyard Jakarta";

export function getPublicAuthorName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed || trimmed.includes("@")) {
    return PUBLIC_AUTHOR_NAME;
  }

  return trimmed;
}
