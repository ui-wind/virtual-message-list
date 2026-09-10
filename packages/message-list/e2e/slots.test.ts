import { expect, test } from '@playwright/test'

import { navigateToExample } from './utils.ts'

test.describe('slots', () => {
  test.beforeEach(async ({ baseURL, page }) => {
    await navigateToExample(page, baseURL, 'slots')
    await page.waitForSelector('[data-virtuoso-list]')
  })

  test('header and footer are visible', async ({ page }) => {
    await expect(page.locator('text=section header/footer').first()).toBeVisible()
  })
})
