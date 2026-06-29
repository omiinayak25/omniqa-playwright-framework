/**
 * --------------------------------------------------------
 * File: reporting-allure.spec.ts
 * Module: API Tests
 * Project: OMINQA Playwright Framework
 *
 * Feature Under Test: Allure reporting integration (labels, steps, attachments).
 * Business Scenario: Test runs must produce rich, BDD-labelled Allure reports.
 * Preconditions: Network access to DummyJSON; Allure utility available.
 * Test Strategy: Reporting showcase with annotated steps and attachments.
 * Expected Outcome: Product fetch passes and emits Allure labels/steps/attachment.
 * Priority: Low
 * Tags: @api @reporting
 *
 * Last Updated: 2026-06-27
 * --------------------------------------------------------
 *
 * Demonstrates rich Allure reporting: BDD-style labels (epic/feature/story),
 * severity, owner, named steps, and attachments. Tagged @api @reporting.
 */
import { test, expect } from '@fixtures/index';
import { Allure, Severity } from '@utils/allure.util';
import { HttpStatus } from '@constants/index';

test.describe('Allure reporting showcase @api @reporting', () => {
  test('product fetch is annotated with labels, steps & attachments', async ({ productApi }) => {
    await Allure.epic('Catalog');
    await Allure.feature('Product API');
    await Allure.story('Fetch product by id');
    await Allure.severity(Severity.CRITICAL);
    await Allure.owner('qa-automation');

    const product = await Allure.step('GET /products/1', async () => {
      const res = await productApi.getById(1);
      expect(res.status).toBe(HttpStatus.OK);
      return res.body;
    });

    await Allure.step('Validate the product shape', async () => {
      expect(product.id).toBe(1);
      expect(product.price).toBeGreaterThan(0);
    });

    await Allure.attach('product.json', JSON.stringify(product, null, 2), 'application/json');
  });
});
