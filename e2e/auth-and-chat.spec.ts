import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo-password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('h1')).toContainText('Sign In');
  });
});

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo-password');
    await page.click('button[type="submit"]');
    await page.goto('/chat');
  });

  test('should display chat interface', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Assistant');
  });

  test('should send a message and receive response', async ({ page }) => {
    await page.fill('input[placeholder="Ask me anything..."]', 'Hello');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Hello')).toBeVisible();
    
    await expect(page.locator('text=Thinking...')).toBeVisible({ timeout: 5000 });
  });
});
