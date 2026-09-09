import { test, expect } from '@playwright/test';

test('single-scene hero moves, pauses, respects reduced motion and adds a pick', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const hero = page.locator('.daily-hero');
  const photo = hero.locator('.daily-hero-photo');
  await expect(page.locator('h1')).toContainText('Bring home');
  await expect(photo).toBeVisible();
  await expect(hero.locator('canvas, .reveal-button, .paint-cursor')).toHaveCount(0);
  await photo.evaluate(async (image: HTMLImageElement) => image.decode());
  const before = await photo.evaluate(node => getComputedStyle(node).transform);
  await expect.poll(() => photo.evaluate(node => getComputedStyle(node).transform)).not.toBe(before);
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect(photo).toHaveCSS('animation-play-state', 'paused');
  const paused = await photo.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(300);
  expect(await photo.evaluate(node => getComputedStyle(node).transform)).toBe(paused);
  await page.getByRole('button', { name: 'Play animation' }).click();
  const pick = hero.locator('.daily-pick').first();
  const title = await pick.locator('a span').innerText();
  await pick.getByRole('button').click();
  await expect(page.getByRole('button', { name: 'Open basket, 1 items' })).toBeVisible();
  await page.getByRole('button', { name: 'Open basket, 1 items' }).click();
  await expect(page.getByRole('dialog', { name: 'Your basket' })).toContainText(title);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(photo).toHaveCSS('animation-name', 'none');
  await expect(hero.locator('.daily-motion')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('configured WhatsApp number is used by contact and basket actions', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.daily-contact')).toHaveAttribute('href', /^https:\/\/wa\.me\/17373075495\?text=/);
  await page.evaluate(() => {
    (window as unknown as { capturedURL: string }).capturedURL = '';
    window.open = ((url?: string | URL) => { (window as unknown as { capturedURL: string }).capturedURL = String(url); return null; }) as typeof window.open;
  });
  await page.getByRole('button', { name: 'Contact us on WhatsApp' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { capturedURL: string }).capturedURL)).toContain('https://wa.me/17373075495?text=');
  await page.locator('.daily-pick').first().getByRole('button').click();
  await page.getByRole('button', { name: /Open basket,/ }).click();
  await page.getByRole('button', { name: 'Send order enquiry on WhatsApp' }).click();
  const url = await page.evaluate(() => (window as unknown as { capturedURL: string }).capturedURL);
  expect(new URL(url).pathname).toBe('/17373075495');
  expect(new URL(url).searchParams.get('text')).toContain('Qty: 1');
  await expect(page.locator('.cart-item')).toHaveCount(1);
});
