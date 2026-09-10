import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VirtuosoMessageListLicense } from '../../src/components/license'
import { VirtuosoMessageListTestingContext } from '../../src/components/testing-context'
import { VirtuosoMessageList } from '../../src/components/virtuoso-message-list'
import { useCurrentlyRenderedData, useVirtuosoLocation, useVirtuosoMethods } from '../../src/hooks'

let observeCalls = 0

class MockRO implements ResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    observeCalls += 1
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): ResizeObserverEntry[] {
    return []
  }
}

beforeEach(() => {
  observeCalls = 0
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- jsdom polyfill
  globalThis.ResizeObserver = MockRO as unknown as typeof ResizeObserver
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function rows() {
  return [...document.querySelectorAll<HTMLElement>('[data-index]')]
}

const simulatedSizes = { viewportHeight: 200, itemHeight: 40 }

describe('descendant hooks', () => {
  it('useVirtuosoMethods returns the imperative handle from a child', async () => {
    function Probe() {
      const methods = useVirtuosoMethods<string>()
      return <div data-role="has-methods">{typeof methods.data.append === 'function' ? 'yes' : 'no'}</div>
    }
    render(
      <VirtuosoMessageList initialData={['a']} ItemContent={({ data }) => <span>{data}</span>} Header={Probe} style={{ height: 400 }} />
    )
    await screen.findByText('a')
    expect(screen.getByText('yes')).toBeTruthy()
  })

  it('useVirtuosoLocation exposes the scroll location to a child', async () => {
    function Probe() {
      const location = useVirtuosoLocation()
      return <div data-role="loc">{location.scrollHeight}</div>
    }
    render(
      <VirtuosoMessageList
        initialData={['a', 'b']}
        ItemContent={({ data }) => <span>{data}</span>}
        Header={Probe}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    const loc = document.querySelector('[data-role="loc"]')
    expect(loc).not.toBeNull()
    expect(Number(loc?.textContent)).toBeGreaterThan(0)
  })

  it('useCurrentlyRenderedData returns the windowed data slice', async () => {
    function Probe() {
      const rendered = useCurrentlyRenderedData<string>()
      return <div data-role="rendered">{rendered.join('|')}</div>
    }
    render(
      <VirtuosoMessageList
        initialData={['a', 'b', 'c']}
        ItemContent={({ data }) => <span>{data}</span>}
        Header={Probe}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    expect(document.querySelector('[data-role="rendered"]')?.textContent).toContain('a')
  })
})

describe('VirtuosoMessageListTestingContext', () => {
  it('uses simulated sizes and skips ResizeObserver', async () => {
    render(
      <VirtuosoMessageListTestingContext.Provider value={simulatedSizes}>
        <VirtuosoMessageList
          initialData={Array.from({ length: 20 }, (_, i) => `m${i}`)}
          ItemContent={({ data }) => <span>{data}</span>}
          style={{ height: 200 }}
        />
      </VirtuosoMessageListTestingContext.Provider>
    )
    await screen.findByText('m0')
    // The simulated path never touches the ResizeObserver polyfill.
    expect(observeCalls).toBe(0)
    // The list height reflects 20 items at the simulated 40px each.
    const list = document.querySelector<HTMLElement>('[data-virtuoso-list]')
    expect(list?.style.height).toBe('800px')
    // Only a windowed subset renders — not all 20 rows.
    expect(rows().length).toBeGreaterThan(0)
    expect(rows().length).toBeLessThan(20)
  })
})

describe('VirtuosoMessageListLicense', () => {
  it('renders nested message lists', async () => {
    render(
      <VirtuosoMessageListLicense licenseKey="trial">
        <VirtuosoMessageList initialData={['a']} ItemContent={({ data }) => <span>{data}</span>} style={{ height: 400 }} />
      </VirtuosoMessageListLicense>
    )
    await screen.findByText('a')
    expect(rows().length).toBe(1)
  })
})
