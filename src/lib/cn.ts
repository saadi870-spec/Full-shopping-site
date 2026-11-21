type ClassValue = string | number | null | undefined | false;

/** Tiny classname helper — filters falsy values and joins the rest. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
