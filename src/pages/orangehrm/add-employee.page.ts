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
import type { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { config } from '@config/config';
import { ORANGEHRM_ROUTES } from '@constants/ui-routes.constants';

/** Name parts for the Add Employee form. */
export interface EmployeeName {
  readonly firstName: string;
  readonly middleName?: string;
  readonly lastName: string;
}

/** Login-detail credentials for the optional "Create Login Details" sub-form. */
export interface LoginDetails {
  readonly username: string;
  readonly password: string;
  readonly confirmPassword: string;
}

/** An in-memory file payload for an upload (no disk fixture required). */
export interface UploadFile {
  readonly name: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
}

/**
 * OrangeAddEmployeePage encapsulates the Add Employee form so tests drive it
 * through intention-revealing methods rather than brittle raw selectors.
 */
export class OrangeAddEmployeePage extends BasePage {
  protected readonly baseUrl = config.ui.orangeHrm.baseUrl;
  protected readonly path = ORANGEHRM_ROUTES.ADD_EMPLOYEE;

  private readonly firstNameInput: Locator;
  private readonly middleNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly employeeIdInput: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;
  private readonly requiredErrors: Locator;
  private readonly toast: Locator;
  private readonly loginSwitch: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInputs: Locator;
  private readonly photoInput: Locator;
  private readonly employeeImage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    // Employee Id and Username inputs have no `name` — locate by their label group.
    this.employeeIdInput = this.byLabel(page, 'Employee Id');
    this.usernameInput = this.byLabel(page, 'Username');
    this.saveButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button', { hasText: 'Cancel' });
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
    this.toast = page.locator('.oxd-toast');
    this.loginSwitch = page.locator('.oxd-switch-input');
    this.passwordInputs = page.locator('input[type="password"]');
    this.photoInput = page.locator('input[type="file"]');
    this.employeeImage = page.locator('img.employee-image');
  }

  /** Locate the input within the input-group whose label matches `label`. */
  private byLabel(page: Page, label: string): Locator {
    return page
      .locator('.oxd-input-group', { has: page.locator('label', { hasText: label }) })
      .locator('input');
  }

  /**
   * Purpose: Confirm the Add Employee form rendered.
   * @returns Promise resolving to true once the first-name field is visible.
   */
  public async isLoaded(): Promise<boolean> {
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
    return this.firstNameInput.isVisible();
  }

  /**
   * Purpose: Fill the employee name fields. Does NOT assert.
   * @param name - First (required), optional middle, and last (required) names.
   * @returns Promise that resolves once the name fields are filled.
   */
  public async fillName(name: EmployeeName): Promise<void> {
    await this.type(this.firstNameInput, name.firstName, 'first name');
    if (name.middleName !== undefined) {
      await this.type(this.middleNameInput, name.middleName, 'middle name');
    }
    await this.type(this.lastNameInput, name.lastName, 'last name');
  }

  /**
   * Purpose: Read the auto-generated (or entered) employee id value.
   * @returns Promise resolving to the employee id input's value.
   */
  public async employeeId(): Promise<string> {
    return this.employeeIdInput.inputValue();
  }

  /**
   * Purpose: Submit the form. Does NOT assert.
   * @returns Promise that resolves once Save is clicked.
   */
  public async save(): Promise<void> {
    await this.click(this.saveButton, 'save');
  }

  /**
   * Purpose: Cancel the form (returns to the employee list). Does NOT assert.
   * @returns Promise that resolves once Cancel is clicked.
   */
  public async cancel(): Promise<void> {
    await this.click(this.cancelButton, 'cancel');
  }

  /**
   * Purpose: Count the inline required-field validation messages.
   * @returns Promise resolving to the number of visible field errors.
   */
  public async requiredErrorCount(): Promise<number> {
    await this.requiredErrors
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => undefined);
    return this.requiredErrors.count();
  }

  /**
   * Purpose: Read the success-toast text shown after a successful save.
   * @returns Promise resolving to the toast text, or '' if none appears.
   */
  public async successToast(): Promise<string> {
    await this.toast.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);
    if (!(await this.toast.isVisible())) return '';
    return (await this.toast.textContent())?.trim() ?? '';
  }

  /**
   * Purpose: Toggle the "Create Login Details" switch to reveal the credential
   * sub-form. Does NOT assert.
   * @returns Promise that resolves once the switch is clicked.
   */
  public async enableLoginDetails(): Promise<void> {
    await this.click(this.loginSwitch, 'create login details toggle');
  }

  /**
   * Purpose: Report whether the username field (login sub-form) is visible.
   * @returns Promise resolving to true once the username field is shown.
   */
  public async isUsernameFieldVisible(): Promise<boolean> {
    await this.usernameInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);
    return this.usernameInput.isVisible();
  }

  /**
   * Purpose: Fill the login-details credential sub-form. Does NOT assert.
   * @param creds - Username, password, and confirm password.
   * @returns Promise that resolves once the credential fields are filled.
   */
  public async fillLoginDetails(creds: LoginDetails): Promise<void> {
    await this.type(this.usernameInput, creds.username, 'username');
    await this.type(this.passwordInputs.nth(0), creds.password, 'password');
    await this.type(this.passwordInputs.nth(1), creds.confirmPassword, 'confirm password');
  }

  /**
   * Purpose: Read the current employee photo image source, so tests can detect
   * that an upload replaced the default placeholder.
   * @returns Promise resolving to the image src ('' when absent).
   */
  public async photoSource(): Promise<string> {
    return (await this.employeeImage.getAttribute('src')) ?? '';
  }

  /**
   * Purpose: Upload an employee photo from an in-memory buffer (no disk fixture).
   * @param file - Name, MIME type, and buffer of the image to attach.
   * @returns Promise that resolves once the file is set on the input.
   */
  public async uploadPhoto(file: UploadFile): Promise<void> {
    this.log.info(`Uploading photo "${file.name}" (${file.mimeType})`);
    await this.photoInput.setInputFiles({
      name: file.name,
      mimeType: file.mimeType,
      buffer: file.buffer,
    });
  }
}
