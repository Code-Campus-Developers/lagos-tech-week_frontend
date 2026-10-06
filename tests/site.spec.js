import { test, expect } from '@playwright/test';

test('page is responsive, navigation works and signup succeeds', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (!process.env.E2E_BACKEND_URL) {
    await page.route('**/api/subscribe', async route => {
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toEqual({ email: `browser-${testInfo.project.name}@example.com`, consent: true, website: '' });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Your interest is registered.' }) });
    });
  }
  await page.goto('/');
  await expect(page).toHaveTitle('Lagos Tech Week — Coming soon');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tech Week');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('landing-page.png'), fullPage: true });
  await page.getByRole('link', { name: /What’s coming/ }).click();
  await expect(page).toHaveURL(/#updates$/);
  await page.getByLabel('Your email address', { exact: true }).fill(`browser-${testInfo.project.name}@example.com`);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.getByRole('status')).toContainText('You’re on the list.');
  await page.getByRole('button', { name: 'Register another email' }).click();
  await expect(page.getByLabel('Your email address', { exact: true })).toBeEmpty();
  expect(errors).toEqual([]);
});

test('failed requests show an error and preserve the email for retry', async ({ page }) => {
  await page.goto('/');
  await page.route('**/api/subscribe', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Temporarily unavailable. Please try again.' }) }));
  await page.getByLabel('Your email address', { exact: true }).fill('retry@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.getByRole('alert')).toContainText('Temporarily unavailable');
  await expect(page.getByLabel('Your email address', { exact: true })).toHaveValue('retry@example.com');
  await expect(page.getByRole('button', { name: 'Notify me' })).toBeEnabled();
});

test('empty successful responses show confirmation and a spinner while submitting', async ({ page }) => {
  let releaseResponse;
  let signalRequest;
  const requestIntercepted = new Promise(resolve => { signalRequest = resolve; });
  await page.route('**/api/subscribe', route => new Promise(resolve => {
    releaseResponse = async () => {
      await route.fulfill({ status: 204 });
      resolve();
    };
    signalRequest();
  }));
  await page.goto('/');
  await page.getByLabel('Your email address', { exact: true }).fill('empty-response@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Notify me' }).click();
  await requestIntercepted;
  const submitButton = page.getByRole('button', { name: 'Notify me' });
  await expect(submitButton).toHaveAttribute('aria-busy', 'true');
  await expect(submitButton.locator('.subscribe-spinner')).toBeVisible();
  await releaseResponse();
  await expect(page.getByRole('status')).toContainText('You’re on the list.');
});
