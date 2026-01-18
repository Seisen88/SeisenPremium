import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API configuration
// {SAME}
export function getApiUrl() {
  // Use environment variable if set, otherwise default to empty string for relative paths
  return process.env.NEXT_PUBLIC_API_URL || '';
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
