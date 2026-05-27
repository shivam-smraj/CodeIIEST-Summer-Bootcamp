/**
 * Email Parser — extracts institutional data from IIEST G-Suite email.
 *
 * Email format: {YEAR}{DEPT_CODE}{ROLL_NUM}.{NAME}@students.iiests.ac.in
 * Example: 2024eeb109.shivam@students.iiests.ac.in
 *
 * Parsed:
 *   rollId:     "2024EEB109"
 *   entryYear:  2024
 *   batch:      2028   (entryYear + 4)
 *   department: "Electrical Engineering"
 */

import { DEPARTMENT_MAP } from './constants';

export interface ParsedEmailData {
  rollId: string;
  entryYear: number;
  batch: number;         // graduation year = entryYear + 4
  department: string;    // full department name
  deptCode: string;      // raw department code (e.g. "EEB")
  displayName: string;   // cleaned name from email
}

/**
 * Extracts institutional data from an IIEST student G-Suite email.
 * Returns null if the email doesn't match the expected format.
 */
export function parseIIESTEmail(email: string): ParsedEmailData | null {
  if (!email) return null;

  const lower = email.toLowerCase().trim();

  // Must end with @students.iiests.ac.in
  if (!lower.endsWith('@students.iiests.ac.in')) return null;

  const localPart = lower.split('@')[0]; // e.g. "2024eeb109.shivam"

  // Split on the first dot to separate roll from name
  const dotIndex = localPart.indexOf('.');
  if (dotIndex === -1) return null;

  const rollPart = localPart.substring(0, dotIndex).toUpperCase(); // "2024EEB109"
  const namePart = localPart.substring(dotIndex + 1);               // "shivam"

  // Roll format: {4-digit year}{dept code}{roll number}
  // Examples: 2024EEB109, 2023CS001, 2025ME042
  const rollMatch = rollPart.match(/^(\d{4})([A-Z]+)(\d+)$/);
  if (!rollMatch) return null;

  const entryYear = parseInt(rollMatch[1], 10);
  const deptCode = rollMatch[2];
  const batch = entryYear + 4; // 4-year UG program (MCA is 3 years — handle separately)

  // Resolve department name
  const department = DEPARTMENT_MAP[deptCode] ?? deptCode;

  // Clean up display name
  const displayName = namePart
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    rollId: rollPart,
    entryYear,
    batch,
    department,
    deptCode,
    displayName,
  };
}

/**
 * Validates that an email belongs to IIEST Shibpur student domain.
 */
export function isValidInstituteEmail(email: string): boolean {
  return email?.toLowerCase().endsWith('@students.iiests.ac.in') ?? false;
}
