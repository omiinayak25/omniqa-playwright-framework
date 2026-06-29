/**
 * --------------------------------------------------------
 * File: file.util.ts
 * Module: Utilities
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Filesystem & data-file utilities — JSON / CSV / Excel read+write,
 * directory management, and existence/deletion helpers.
 *
 * Responsibilities:
 * - `ensureDir`, `fileExists`, `deleteFile` for path management.
 * - `readJson`/`writeJson`, `readCsv`/`writeCsv`, `readExcel`/`writeExcel`.
 *
 * Used By:
 * Test Data Management layer (factories/builders read fixtures) and
 * download/upload verification.
 *
 * Dependencies:
 * node:fs, node:path, csv-parse/sync, exceljs
 *
 * Last Updated: 2026-06-27
 * Notes:
 * WHY: a single typed surface over the three data formats keeps fixtures
 * and I/O consistent and creates parent dirs automatically on write.
 * WHEN: use to load/save fixtures and verify downloaded artifacts.
 * LIMITATIONS: CSV values are read as strings (callers map to typed models);
 * Excel helpers are async (exceljs); CSV/Excel assume a single header row;
 * all paths are resolved relative to the process CWD.
 * --------------------------------------------------------
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseCsvSync } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

/**
 * Ensure a directory exists (recursive). Returns the absolute path.
 *
 * @param dirPath - Directory path (relative paths resolved against CWD).
 * @returns The absolute path to the (now existing) directory.
 */
export function ensureDir(dirPath: string): string {
  const abs = path.resolve(dirPath);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(abs, { recursive: true });
  }
  return abs;
}

/**
 * @param filePath - Path to check (resolved against CWD).
 * @returns `true` if the path exists on disk.
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

/**
 * Delete a file if it exists (no-op when absent).
 * @param filePath - Path to delete (resolved against CWD).
 */
export function deleteFile(filePath: string): void {
  const abs = path.resolve(filePath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
}

// ---------------------------------------------------------------------- JSON

/**
 * Read and parse a JSON file into a typed value.
 *
 * @typeParam T - Expected shape of the parsed JSON.
 * @param filePath - Path to the JSON file.
 * @returns The parsed value cast to `T`.
 * @throws {SyntaxError} If the file is not valid JSON.
 */
export function readJson<T>(filePath: string): T {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Pretty-write a value as JSON, creating parent dirs as needed.
 *
 * @param filePath - Destination path (parent dirs created automatically).
 * @param data - Any JSON-serializable value.
 */
export function writeJson(filePath: string, data: unknown): void {
  const abs = path.resolve(filePath);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), 'utf-8');
}

// ----------------------------------------------------------------------- CSV

/**
 * Read a CSV file into an array of objects keyed by the header row.
 * Returns `Record<string, string>[]` — callers map to typed models.
 *
 * @param filePath - Path to the CSV file (first row treated as headers).
 * @returns One object per data row, values as trimmed strings.
 * @example
 *   const rows = readCsv('data/users.csv');
 *   const first = rows[0]?.['email'];
 */
export function readCsv(filePath: string): ReadonlyArray<Record<string, string>> {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return parseCsvSync(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
}

/**
 * Write rows (array of flat objects) to a CSV file with a header row.
 * Headers are taken from the first row's keys; values containing
 * `"`, `,`, or newlines are quoted/escaped. Empty input writes an empty file.
 *
 * @param filePath - Destination path (parent dirs created automatically).
 * @param rows - Flat objects sharing the same keys.
 */
export function writeCsv(filePath: string, rows: ReadonlyArray<Record<string, unknown>>): void {
  const abs = path.resolve(filePath);
  ensureDir(path.dirname(abs));
  if (rows.length === 0) {
    fs.writeFileSync(abs, '', 'utf-8');
    return;
  }
  const headers = Object.keys(rows[0] ?? {});
  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];
  fs.writeFileSync(abs, lines.join('\n'), 'utf-8');
}

// --------------------------------------------------------------------- Excel

/**
 * Read the first (or named) worksheet into an array of objects keyed by header.
 *
 * @param filePath - Path to the `.xlsx` file.
 * @param sheetName - Optional worksheet name; defaults to the first sheet.
 * @returns One object per data row (row 1 is treated as the header).
 * @throws {Error} If the named worksheet is not found.
 * @example
 *   const rows = await readExcel('data/bookings.xlsx', 'Bookings');
 */
export async function readExcel(
  filePath: string,
  sheetName?: string,
): Promise<ReadonlyArray<Record<string, unknown>>> {
  const abs = path.resolve(filePath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(abs);

  const worksheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];
  if (worksheet === undefined) {
    throw new Error(`[excel] Worksheet not found: ${sheetName ?? '(first sheet)'}`);
  }

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, col) => {
    headers[col] = String(cell.value ?? `col${col}`);
  });

  const rows: Array<Record<string, unknown>> = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const record: Record<string, unknown> = {};
    row.eachCell((cell, col) => {
      const key = headers[col];
      if (key !== undefined) record[key] = cell.value;
    });
    rows.push(record);
  });
  return rows;
}

/**
 * Write rows to an .xlsx file (one sheet) with a bold header row.
 *
 * @param filePath - Destination path (parent dirs created automatically).
 * @param rows - Flat objects sharing the same keys (keys become columns).
 * @param sheetName - Worksheet name (default `Sheet1`).
 * @returns A promise that resolves once the workbook is written.
 */
export async function writeExcel(
  filePath: string,
  rows: ReadonlyArray<Record<string, unknown>>,
  sheetName = 'Sheet1',
): Promise<void> {
  const abs = path.resolve(filePath);
  ensureDir(path.dirname(abs));
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (rows.length > 0) {
    const headers = Object.keys(rows[0] ?? {});
    worksheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));
    worksheet.getRow(1).font = { bold: true };
    rows.forEach((row) => worksheet.addRow(row));
  }
  await workbook.xlsx.writeFile(abs);
}
