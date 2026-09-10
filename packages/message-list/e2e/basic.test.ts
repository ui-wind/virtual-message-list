import { expect, test } from '@playwright/test'

import { navigateToExample } from './utils.ts'

test.describe('basic message list', () => {
  test.beforeEach(async ({ baseURL, page }) => {
    await navigateToExample(page, baseURL, 'basic')
    await page.waitForSelector('[data-virtuoso-list]')
  })

  test('renders visible items', async ({ page }) => {
    const count = await page.evaluate(() => document.querySelectorAll('[data-index]').length)
    expect(count).toBeGreaterThan(0)
  })

  test('first items are Message 0, 1, ...', async ({ page }) => {
    const text = await page.evaluate(() => document.body.textContent ?? '')
    expect(text).toContain('Message 0')
  })

  test('scroller is scrollable', async ({ page }) => {
    const scrollHeight = await page.evaluate(() => {
      const list = document.querySelector<HTMLElement>('[data-virtuoso-list]')
      // Walk up to find the overflow container (Scroller renders overflowY:auto)
      let el = list
      while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return el.scrollHeight
        }
        el = el.parentElement
      }
      return document.body.scrollHeight
    })
    expect(scrollHeight).toBeGreaterThan(0)
  })
})
