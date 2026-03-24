/**
 * Public storage URLs — safe for client components (only NEXT_PUBLIC_SUPABASE_URL).
 */
export function getPublicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  }
  const trimmedBase = base.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return encodeURI(
    `${trimmedBase}/storage/v1/object/public/${bucket}/${cleanPath}`
  );
}
