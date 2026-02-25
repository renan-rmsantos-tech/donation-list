/**
 * Generates a description for an imported item using a simple template pattern.
 * Pattern: "{name} para doação. Categoria: {category}"
 * If category is empty, returns: "{name} para doação."
 */
export function generateDescription(name: string, category: string): string {
  const trimmedName = name.trim();
  const trimmedCategory = category.trim();

  if (!trimmedCategory) {
    return `${trimmedName} para doação.`;
  }

  return `${trimmedName} para doação. Categoria: ${trimmedCategory}`;
}
