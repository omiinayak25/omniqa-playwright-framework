/**
 * --------------------------------------------------------
 * File: add-employee.spec.ts
 * Module: UI Tests · Forms
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: OrangeHRM PIM "Add Employee" form.
 * Business Scenario: HR creates employees; required fields are enforced, optional
 *                    login details validate, and saved employees are searchable.
 * Preconditions: Stored OrangeHRM Admin auth (.auth/orangehrm.json).
 * Test Strategy: Required-field validation + happy-path create + login sub-form
 *                + security (no script execution), data-driven where natural.
 * Expected Outcome: Valid saves succeed & are searchable; gaps are flagged.
 * Priority: High
 * Tags: @ui @regression @forms
 *
 * Last Updated: 2026-06-28
 * Notes:
 * Heavy SPA — test.slow(). The OrangeHRM backend is external (not our Postgres),
 * so DB-verify rows stay catalogued as Planned; here we verify via UI search.
 * --------------------------------------------------------
 */
import { test, expect } from '@fixtures/index';
import { ORANGE_AUTH_FILE } from '@constants/paths.constants';
import { EdgeInputFactory } from '@factories/index';

test.use({ storageState: ORANGE_AUTH_FILE });

test.describe('OrangeHRM · Add Employee form @ui @regression @forms', () => {
  test.beforeEach(async ({ orangeAddEmployeePage }) => {
    test.slow(); // heavy SPA — grant 3x the default timeout
    await orangeAddEmployeePage.open();
    expect(await orangeAddEmployeePage.isLoaded()).toBe(true);
  });

  test('@smoke creates an employee with first and last name', async ({
    orangeAddEmployeePage,
    data,
    page,
  }) => {
    await orangeAddEmployeePage.fillName({
      firstName: data.firstName(),
      lastName: data.lastName(),
    });
    await orangeAddEmployeePage.save();
    // A successful save redirects to the new employee's Personal Details page.
    await expect(page).toHaveURL(/viewPersonalDetails/);
  });

  test('the employee id is auto-populated', async ({ orangeAddEmployeePage }) => {
    expect((await orangeAddEmployeePage.employeeId()).length).toBeGreaterThan(0);
  });

  test('saving with an empty first name is blocked', async ({ orangeAddEmployeePage, data }) => {
    await orangeAddEmployeePage.fillName({ firstName: '', lastName: data.lastName() });
    await orangeAddEmployeePage.save();
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThan(0);
  });

  test('saving with an empty last name is blocked', async ({ orangeAddEmployeePage, data }) => {
    await orangeAddEmployeePage.fillName({ firstName: data.firstName(), lastName: '' });
    await orangeAddEmployeePage.save();
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThan(0);
  });

  test('saving an empty form flags both name fields as required', async ({
    orangeAddEmployeePage,
  }) => {
    await orangeAddEmployeePage.save();
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThanOrEqual(2);
  });

  test('creates an employee with a middle name', async ({ orangeAddEmployeePage, data, page }) => {
    await orangeAddEmployeePage.fillName({
      firstName: data.firstName(),
      middleName: data.firstName(),
      lastName: data.lastName(),
    });
    await orangeAddEmployeePage.save();
    await expect(page).toHaveURL(/viewPersonalDetails/);
  });

  test('cancel returns to the employee list', async ({ orangeAddEmployeePage, page }) => {
    await orangeAddEmployeePage.cancel();
    await expect(page).toHaveURL(/viewEmployeeList/);
  });

  test('a saved employee is searchable in the PIM list', async ({
    orangeAddEmployeePage,
    orangePimPage,
    data,
    page,
  }) => {
    const firstName = data.firstName();
    const lastName = data.lastName();
    await orangeAddEmployeePage.fillName({ firstName, lastName });
    await orangeAddEmployeePage.save();
    await expect(page).toHaveURL(/viewPersonalDetails/);

    await orangePimPage.open();
    await orangePimPage.waitForLoaded();
    await orangePimPage.searchByName(`${firstName} ${lastName}`);
    expect(await orangePimPage.recordsFoundCount()).toBeGreaterThan(0);
  });

  test('data-driven: multiple distinct employees can be created', async ({
    orangeAddEmployeePage,
    data,
    page,
  }) => {
    for (let i = 0; i < 2; i += 1) {
      await orangeAddEmployeePage.open();
      expect(await orangeAddEmployeePage.isLoaded()).toBe(true);
      await orangeAddEmployeePage.fillName({
        firstName: data.firstName(),
        lastName: data.lastName(),
      });
      await orangeAddEmployeePage.save();
      await expect(page).toHaveURL(/viewPersonalDetails/);
    }
  });

  test('enabling "Create Login Details" reveals the username field', async ({
    orangeAddEmployeePage,
    data,
  }) => {
    await orangeAddEmployeePage.fillName({
      firstName: data.firstName(),
      lastName: data.lastName(),
    });
    await orangeAddEmployeePage.enableLoginDetails();
    expect(await orangeAddEmployeePage.isUsernameFieldVisible()).toBe(true);
  });

  test('login details require a username and password', async ({ orangeAddEmployeePage, data }) => {
    await orangeAddEmployeePage.fillName({
      firstName: data.firstName(),
      lastName: data.lastName(),
    });
    await orangeAddEmployeePage.enableLoginDetails();
    expect(await orangeAddEmployeePage.isUsernameFieldVisible()).toBe(true);
    await orangeAddEmployeePage.save();
    // Username + password (+ confirm) become required once login is enabled.
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThanOrEqual(2);
  });

  test('mismatched login passwords are rejected', async ({ orangeAddEmployeePage, data }) => {
    await orangeAddEmployeePage.fillName({
      firstName: data.firstName(),
      lastName: data.lastName(),
    });
    await orangeAddEmployeePage.enableLoginDetails();
    await orangeAddEmployeePage.fillLoginDetails({
      username: `qa_${Date.now()}`,
      password: 'Str0ngP@ss1',
      confirmPassword: 'Different1@',
    });
    await orangeAddEmployeePage.save();
    expect(await orangeAddEmployeePage.requiredErrorCount()).toBeGreaterThan(0);
  });

  test('an XSS payload in the name field does not execute a script', async ({
    orangeAddEmployeePage,
    data,
    page,
  }) => {
    let dialogFired = false;
    page.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    const xss = EdgeInputFactory.xss()[0]!;
    await orangeAddEmployeePage.fillName({ firstName: xss.value, lastName: data.lastName() });
    await orangeAddEmployeePage.save();

    // Whether OrangeHRM accepts or rejects the value, no script must execute.
    expect(dialogFired).toBe(false);
  });
});
