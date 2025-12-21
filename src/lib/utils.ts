import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a simple unique ID.
 * Combines timestamp with a random string.
 * Example: "id-1678886400000-a1b2c3d4"
 */
export function generateUniqueId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
