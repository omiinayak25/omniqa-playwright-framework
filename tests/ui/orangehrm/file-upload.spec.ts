/**
 * --------------------------------------------------------
 * File: file-upload.spec.ts
 * Module: UI Tests · File Upload
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM employee photo upload.
 * Business Scenario: HR can attach a profile photo; a valid image replaces the
 *                    default placeholder, an invalid type is rejected.
 * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
 * Test Strategy: setInputFiles with in-memory buffers (no disk fixture) and
 *                assert the rendered image / validation response.
 * Expected Outcome: A PNG is accepted (image changes); a .txt is rejected.
 * Priority: Medium
 * Tags: @ui @regression @upload
 *
 * Last Updated: 2026-06-28
 * Notes: Heavy SPA — test.slow().
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';

test.use({ storageState: ORANGE_AUTH_FILE });

// A minimal valid 1×1 PNG, decoded from base64 — no on-disk fixture needed.
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('OrangeHRM · Employee photo upload @ui @regression @upload', () => {
  test.beforeEach(async ({ orangeAddEmployeePage }) => {
    test.slow(); // heavy SPA
    await orangeAddEmployeePage.open();
    expect(await orangeAddEmployeePage.isLoaded()).toBe(true);
  });

  test('@smoke a valid PNG replaces the default employee photo', async ({
    orangeAddEmployeePage,
  }) => {
    const before = await orangeAddEmployeePage.photoSource();
    await orangeAddEmployeePage.uploadPhoto({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    });
    // The preview swaps the placeholder for the uploaded image (data/blob URL).
    await expect
      .poll(async () => orangeAddEmployeePage.photoSource(), { timeout: 10_000 })
      .not.toBe(before);
  });

  test('an invalid file type is rejected with a validation error', async ({
    orangeAddEmployeePage,
  }) => {
    await orangeAddEmployeePage.uploadPhoto({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    });
    // OrangeHRM rejects non-image attachments with an inline field error.
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThan(0);
  });
});
