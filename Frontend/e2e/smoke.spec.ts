import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ─── Login ────────────────────────────────────────────────────────────────────
test('login as admin and reach dashboard', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await expect(page.getByText('HawkEye')).toBeVisible();

  // Fill credentials
  await page.getByPlaceholder('you@example.com').fill('admin@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Should redirect to admin dashboard
  await expect(page).toHaveURL(/admin\/dashboard/);
  await expect(page.getByText('Admin Dashboard')).toBeVisible();
});

test('login as customer and reach customer dashboard', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill('customer@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/customer\/dashboard/);
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
});

// ─── Send Money ───────────────────────────────────────────────────────────────
test('customer can navigate to send money page', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill('customer@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/customer\/dashboard/);

  await page.getByRole('button', { name: /send money/i }).click();
  await expect(page).toHaveURL(/customer\/send-money/);
  await expect(page.getByText('Send Money')).toBeVisible();
});

// ─── Create Rule ──────────────────────────────────────────────────────────────
test('admin can navigate to create rule page', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill('admin@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto(`${BASE}/admin/rules`);
  await expect(page.getByText('Rule Management')).toBeVisible();

  await page.getByRole('button', { name: /create rule/i }).click();
  await expect(page).toHaveURL(/admin\/rules\/new/);
  await expect(page.getByText('Create Rule')).toBeVisible();
});

// ─── Alert status ─────────────────────────────────────────────────────────────
test('analyst can view alerts list', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill('analyst@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/alerts/);
  await expect(page.getByText('Alert Management')).toBeVisible();
});

// ─── Unauthorized ─────────────────────────────────────────────────────────────
test('customer cannot access admin rules', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill('customer@hawkeye.com');
  await page.getByPlaceholder('••••••••').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto(`${BASE}/admin/rules`);
  await expect(page).toHaveURL(/unauthorized|customer/);
});

