"use client";

/**
 * Suppresses AG Grid Enterprise unlicensed trial console error banner.
 * Next.js 15/16 captures console.error calls during dev rendering and flags
 * each line of AG Grid's 14-line ASCII trial warning box as an issue in the dev overlay.
 */
if (typeof window !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args: any[]) {
    const text = args
      .map((a) => (typeof a === "string" ? a : typeof a === "object" ? JSON.stringify(a) : String(a)))
      .join(" ");

    if (
      text.includes("AG Grid Enterprise License") ||
      text.includes("License Key Not Found") ||
      text.includes("unlocked for trial") ||
      text.includes("info@ag-grid.com") ||
      text.includes("ag-grid.com") ||
      (text.includes("AG Grid") && text.toLowerCase().includes("license")) ||
      /^\s*\*+\s*$/.test(text) ||
      text.includes("********************")
    ) {
      // Suppress AG Grid trial banner from triggering Next.js dev overlay issues
      return;
    }
    return originalError.apply(console, args);
  };

  console.warn = function (...args: any[]) {
    const text = args
      .map((a) => (typeof a === "string" ? a : typeof a === "object" ? JSON.stringify(a) : String(a)))
      .join(" ");

    if (
      text.includes("AG Grid Enterprise License") ||
      text.includes("License Key Not Found") ||
      text.includes("ag-grid.com") ||
      (text.includes("AG Grid") && text.toLowerCase().includes("license"))
    ) {
      return;
    }
    return originalWarn.apply(console, args);
  };
}

export {};
