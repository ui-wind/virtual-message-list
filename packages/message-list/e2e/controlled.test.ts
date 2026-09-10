import { expect, test } from '@playwright/test'

import { navigateToExample } from './utils.ts'

test.describe('controlled data', () => {
  test.beforeEach(async ({ baseURL, page }) => {
    await navigateToExample(page, baseURL, 'controlled')
    await page.waitForSelector('[data-virtuoso-list]')
  })

  test('replacing via controlled prop re-renders the list', async ({ page }) => {
    await expect(page.locator('text=Item 0')).toBeVisible()

    await page.locator('[data-testid="replace"]').click()
    await expect(page.locator('text=New 0')).toBeVisible({ timeout: 2_000 })
    await expect(page.locator('text=Item 0')).toHaveCount(0)
  })
})
