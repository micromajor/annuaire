/**
 * Transforme un nom (commune, etc.) en slug URL-safe.
 * "Saint-Sébastien-sur-Loire" → "saint-sebastien-sur-loire"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
