/**
 * Dynamic API Base URL configuration for PactPay frontend.
 * Evaluates NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL fallback),
 * defaulting to local development server http://localhost:8000.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
