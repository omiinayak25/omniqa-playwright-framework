/**
 * --------------------------------------------------------
 * File: add-employee.page.ts
 * Module: Page Objects
 * Project: OMINQA Playwright Framework
 *
 * Purpose:
 * Page object for the OrangeHRM PIM "Add Employee" form. Fills the name fields,
 * reads the auto-generated employee id, optionally creates login details, and
 * saves — with helpers for required-field validation and the success toast.
 *
 * Responsibilities:
 * - Fill first/middle/last name and read the employee id
 * - Save / cancel; read the success toast and required-field error count
 * - Toggle "Create Login Details" and fill the credential sub-form
 *
 * Used By:
 * tests/ui/orangehrm/add-employee.spec.ts; page.fixtures.ts
 *
 * Dependencies:
 * Playwright, BasePage (@pages/base.page), config, ORANGEHRM_ROUTES
 *
 * Last Updated: 2026-06-28
 * Notes:
 * OrangeHRM is an Angular SPA with unlabelled inputs; fields without a `name`
 * attribute (employee id, username) are located by their input-group label for
 * resilience.
 * --------------------------------------------------------
 */
// Import Playwright's page and element-handle types (type-only).
import type { Page, Locator } from '@playwright/test';
// Import the shared BasePage (navigation + logged helpers).
import { BasePage } from '@pages/base.page';
// Import the config singleton for the OrangeHRM base URL.
import { config } from '@config/config';
// Import the OrangeHRM route paths.
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/** Name parts for the Add Employee form. */
// Contract for the employee name fields (middle name optional).
export interface EmployeeName {
  // Required first name.
  readonly firstName: string;
  // Optional middle name.
  readonly middleName?: string;
  // Required last name.
  readonly lastName: string;
}

/** Login-detail credentials for the optional "Create Login Details" sub-form. */
// Contract for the optional login-details credentials.
export interface LoginDetails {
  // Desired username.
  readonly username: string;
  // Desired password.
  readonly password: string;
  // Password confirmation (must match password).
  readonly confirmPassword: string;
}

/** An in-memory file payload for an upload (no disk fixture required). */
// Contract for an in-memory upload (avoids needing a file on disk).
export interface UploadFile {
  // Suggested file name.
  readonly name: string;
  // MIME type (e.g. image/png).
  readonly mimeType: string;
  // Raw file bytes.
  readonly buffer: Buffer;
}

/**
 * OrangeAddEmployeePage encapsulates the Add Employee form so tests drive it
 * through intention-revealing methods rather than brittle raw selectors.
 */
// Declare the Add Employee form page object, extending BasePage.
export class OrangeAddEmployeePage extends BasePage {
  // Supply the OrangeHRM base URL required by BasePage.
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  // Supply the add-employee route path required by BasePage.
  protected readonly path = ORANGEHRM_ROUTES.ADD_EMPLOYEE;

  // Locator for the first-name input.
  private readonly firstNameInput: Locator;
  // Locator for the middle-name input.
  private readonly middleNameInput: Locator;
  // Locator for the last-name input.
  private readonly lastNameInput: Locator;
  // Locator for the (label-anchored) employee id input.
  private readonly employeeIdInput: Locator;
  // Locator for the Save button.
  private readonly saveButton: Locator;
  // Locator for the Cancel button.
  private readonly cancelButton: Locator;
  // Locator for inline required-field error messages.
  private readonly requiredErrors: Locator;
  // Locator for the success toast.
  private readonly toast: Locator;
  // Locator for the "Create Login Details" switch.
  private readonly loginSwitch: Locator;
  // Locator for the (label-anchored) username input.
  private readonly usernameInput: Locator;
  // Locator for the password + confirm-password inputs.
  private readonly passwordInputs: Locator;
  // Locator for the photo file input.
  private readonly photoInput: Locator;
  // Locator for the employee photo preview image.
  private readonly employeeImage: Locator;

  // Build the page object and resolve its locators.
  constructor(page: Page) {
    // Initialise BasePage (stores page + logger).
    super(page);
    // Resolve the first-name field by its name attribute.
    this.firstNameInput = page.locator('input[name="firstName"]');
    // Resolve the middle-name field by its name attribute.
    this.middleNameInput = page.locator('input[name="middleName"]');
    // Resolve the last-name field by its name attribute.
    this.lastNameInput = page.locator('input[name="lastName"]');
    // Employee Id and Username inputs have no `name` — locate by their label group.
    this.employeeIdInput = this.byLabel(page, 'Employee Id');
    // Resolve the username input by its label group.
    this.usernameInput = this.byLabel(page, 'Username');
    // Resolve the Save (submit) button.
    this.saveButton = page.locator('button[type="submit"]');
    // Resolve the Cancel button by its text.
    this.cancelButton = page.locator('button', { hasText: 'Cancel' });
    // Resolve the inline required-field error messages.
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
    // Resolve the toast container.
    this.toast = page.locator('.oxd-toast');
    // Resolve the login-details switch.
    this.loginSwitch = page.locator('.oxd-switch-input');
    // Resolve the password fields (password + confirm).
    this.passwordInputs = page.locator('input[type="password"]');
    // Resolve the photo file input.
    this.photoInput = page.locator('input[type="file"]');
    // Resolve the employee photo preview image.
    this.employeeImage = page.locator('img.employee-image');
  }

  /** Locate the input within the input-group whose label matches `label`. */
  // Helper: find the input inside the input-group carrying the given label.
  private byLabel(page: Page, label: string): Locator {
    // Narrow to the input-group containing a matching label, then its input.
    return page
      .locator('.oxd-input-group', { has: page.locator('label', { hasText: label }) })
      .locator('input');
  }

  /**
   * Purpose: Confirm the Add Employee form rendered.
   * @returns Promise resolving to true once the first-name field is visible.
   */
  // Report whether the Add Employee form rendered (first-name visible).
  public async isLoaded(): Promise<boolean> {
    // Wait briefly for the first-name field; swallow timeouts.
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    // Return its visibility.
    return this.firstNameInput.isVisible();
  }

  /**
   * Purpose: Fill the employee name fields. Does NOT assert.
   * @param name - First (required), optional middle, and last (required) names.
   * @returns Promise that resolves once the name fields are filled.
   */
  // Fill the employee name fields (middle name optional).
  public async fillName(name: EmployeeName): Promise<void> {
    // Type the first name.
    await this.type(this.firstNameInput, name.firstName, 'first name');
    // Only fill the middle name when one was provided.
    if (name.middleName !== undefined) {
      // Type the middle name.
      await this.type(this.middleNameInput, name.middleName, 'middle name');
    }
    // Type the last name.
    await this.type(this.lastNameInput, name.lastName, 'last name');
  }

  /**
   * Purpose: Read the auto-generated (or entered) employee id value.
   * @returns Promise resolving to the employee id input's value.
   */
  // Read the (auto-generated) employee id field value.
  public async employeeId(): Promise<string> {
    // Return the current input value.
    return this.employeeIdInput.inputValue();
  }

  /**
   * Purpose: Submit the form. Does NOT assert.
   * @returns Promise that resolves once Save is clicked.
   */
  // Submit (save) the form.
  public async save(): Promise<void> {
    // Click the Save button.
    await this.click(this.saveButton, 'save');
  }

  /**
   * Purpose: Cancel the form (returns to the employee list). Does NOT assert.
   * @returns Promise that resolves once Cancel is clicked.
   */
  // Cancel out of the form (back to the employee list).
  public async cancel(): Promise<void> {
    // Click the Cancel button.
    await this.click(this.cancelButton, 'cancel');
  }

  /**
   * Purpose: Count the inline required-field validation messages.
   * @returns Promise resolving to the number of visible field errors.
   */
  // Count the inline required-field validation messages.
  public async requiredErrorCount(): Promise<number> {
    // Wait briefly for the first error; swallow timeouts.
    await this.requiredErrors
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    // Return the count of error messages.
    return this.requiredErrors.count();
  }

  /**
   * Purpose: Read the success-toast text shown after a successful save.
   * @returns Promise resolving to the toast text, or '' if none appears.
   */
  // Read the success-toast text after a save (empty when none appears).
  public async successToast(): Promise<string> {
    // Wait briefly for the toast; swallow timeouts.
    await this.toast.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    // Short-circuit to '' when no toast is visible.
    if (!(await this.toast.isVisible())) return '';
    // Otherwise return the trimmed toast text.
    return (await this.toast.textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Toggle the "Create Login Details" switch to reveal the credential
   * sub-form. Does NOT assert.
   * @returns Promise that resolves once the switch is clicked.
   */
  // Toggle the "Create Login Details" switch to reveal the credential sub-form.
  public async enableLoginDetails(): Promise<void> {
    // Click the switch.
    await this.click(this.loginSwitch, 'create login details toggle');
  }

  /**
   * Purpose: Report whether the username field (login sub-form) is visible.
   * @returns Promise resolving to true once the username field is shown.
   */
  // Report whether the username field (login sub-form) is visible.
  public async isUsernameFieldVisible(): Promise<boolean> {
    // Wait briefly for the username field; swallow timeouts.
    await this.usernameInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
    // Return its visibility.
    return this.usernameInput.isVisible();
  }

  /**
   * Purpose: Fill the login-details credential sub-form. Does NOT assert.
   * @param creds - Username, password, and confirm password.
   * @returns Promise that resolves once the credential fields are filled.
   */
  // Fill the login-details credential sub-form.
  public async fillLoginDetails(creds: LoginDetails): Promise<void> {
    // Type the username.
    await this.type(this.usernameInput, creds.username, 'username');
    // Type the password (first password field).
    await this.type(this.passwordInputs.nth(0), creds.password, 'password');
    // Type the confirmation (second password field).
    await this.type(this.passwordInputs.nth(1), creds.confirmPassword, 'confirm password');
  }

  /**
   * Purpose: Read the current employee photo image source, so tests can detect
   * that an upload replaced the default placeholder.
   * @returns Promise resolving to the image src ('' when absent).
   */
  // Read the current employee photo src (to detect an upload changed it).
  public async photoSource(): Promise<string> {
    // Return the image src, defaulting to '' when absent.
    return (await this.employeeImage.getAttribute('src')) ?? '';
  }

  /**
   * Purpose: Upload an employee photo from an in-memory buffer (no disk fixture).
   * @param file - Name, MIME type, and buffer of the image to attach.
   * @returns Promise that resolves once the file is set on the input.
   */
  // Upload an employee photo from an in-memory buffer.
  public async uploadPhoto(file: UploadFile): Promise<void> {
    // Trace the upload.
    this.log.info(`Uploading photo "${file.name}" (${file.mimeType})`);
    // Set the file directly on the input from the in-memory payload.
    await this.photoInput.setInputFiles({
      // File name presented to the page.
      name: file.name,
      // MIME type of the file.
      mimeType: file.mimeType,
      // Raw bytes of the file.
      buffer: file.buffer,
    });
  }
}
