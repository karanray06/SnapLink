import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import UAParser from "ua-parser-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// URL validation schema
export const urlSchema = z.object({
  longUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(2048, "URL is too long"),
  customAlias: z
    .string()
    .max(50, "Custom alias must be 50 characters or less")
    .regex(/^[a-zA-Z0-9_-]*$/, "Custom alias can only contain alphanumeric characters, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  expiryDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),
});

export type ShortenUrlInput = z.infer<typeof urlSchema>;

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Parse user agent to get device type
export function getDeviceType(userAgent: string): string {
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;
  
  if (deviceType === "mobile") return "Mobile";
  if (deviceType === "tablet") return "Tablet";
  return "Desktop";
}

// Get IP address from headers
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "unknown";
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Calculate days since date
export function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
