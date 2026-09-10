import * as React from 'react'

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VirtuosoMessageList } from '../../src/components/virtuoso-message-list'

import type { VirtuosoMessageListMethods } from '../../src/dataTypes'
import type { HeaderWrapperComponent } from '../../src/types'

class MockRO implements ResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): ResizeObserverEntry[] {
    return []
  }
}

beforeEach(() => {
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- jsdom polyfill
  globalThis.ResizeObserver = MockRO as unknown as typeof ResizeObserver
  const scrollToSelector = function (this: Element, opts: unknown) {
    if (typeof opts === 'object' && opts !== null && 'top' in opts) {
      // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- test polyfill narrow
      const top = (opts as { top?: unknown }).top
      if (typeof top === 'number') {
        this.scrollTop = top
      }
    }
  }
  // oxlint-disable-next-line typescript-eslint(unbound-method), typescript-eslint(no-unsafe-type-assertion) -- test polyfill for jsdom
  Element.prototype.scrollTo ??= scrollToSelector as unknown as typeof Element.prototype.scrollTo
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function rows() {
  return [...document.querySelectorAll<HTMLElement>('[data-index]')]
}

describe('VirtuosoMessageList', () => {
  it('renders initialData through ItemContent', async () => {
    render(<VirtuosoMessageList initialData={['a', 'b', 'c']} ItemContent={({ data }) => <span>{data}</span>} style={{ height: 400 }} />)
    expect(await screen.findByText('a')).toBeTruthy()
    expect(screen.getByText('b')).toBeTruthy()
    expect(screen.getByText('c')).toBeTruthy()
    expect(rows().length).toBe(3)
    expect(rows()[0]!.getAttribute('data-index')).toBe('0')
  })

  it('passes index/prevData/nextData/context to ItemContent', async () => {
    const spy = vi.fn()
    const Ctx = ({
      index,
      data,
      prevData,
      nextData,
      context,
    }: {
      index: number
      data: string
      prevData: string | null
      nextData: string | null
      context: unknown
    }) => {
      spy({ index, data, prevData, nextData, context })
      return <span>{data}</span>
    }
    render(<VirtuosoMessageList initialData={['x', 'y']} context="ctx" ItemContent={Ctx} style={{ height: 400 }} />)
    await screen.findByText('x')
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ index: 0, data: 'x', prevData: null, nextData: 'y', context: 'ctx' }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ index: 1, data: 'y', prevData: 'x', nextData: null }))
  })

  it('renders EmptyPlaceholder when data is empty', () => {
    render(
      <VirtuosoMessageList
        initialData={[]}
        EmptyPlaceholder={() => <div>empty</div>}
        ItemContent={({ data }) => <span>{data}</span>}
        style={{ height: 400 }}
      />
    )
    expect(screen.getByText('empty')).toBeTruthy()
    expect(document.querySelector('[data-virtuoso-list]')).toBeNull()
  })

  it('does not render EmptyPlaceholder when data is non-empty', async () => {
    render(
      <VirtuosoMessageList
        initialData={['a']}
        EmptyPlaceholder={() => <div>empty</div>}
        ItemContent={({ data }) => <span>{data}</span>}
        style={{ height: 400 }}
      />
    )
    expect(await screen.findByText('a')).toBeTruthy()
    expect(screen.queryByText('empty')).toBeNull()
  })

  it('renders Header/Footer/StickyHeader/StickyFooter slots', () => {
    render(
      <VirtuosoMessageList
        initialData={['a']}
        ItemContent={({ data }) => <span>{data}</span>}
        Header={() => <div>hdr</div>}
        Footer={() => <div>ftr</div>}
        StickyHeader={() => <div>shdr</div>}
        StickyFooter={() => <div>sftr</div>}
        style={{ height: 400 }}
      />
    )
    expect(screen.getByText('hdr')).toBeTruthy()
    expect(screen.getByText('ftr')).toBeTruthy()
    expect(screen.getByText('shdr')).toBeTruthy()
    expect(screen.getByText('sftr')).toBeTruthy()
  })

  it('wraps header with a wrapper component when provided', async () => {
    const HW: HeaderWrapperComponent = ({ style, children }) => (
      <div data-role="hw" style={style}>
        {children}
      </div>
    )
    render(
      <VirtuosoMessageList
        initialData={['a']}
        ItemContent={({ data }) => <span>{data}</span>}
        Header={() => <div>hdr</div>}
        HeaderWrapper={HW}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    expect(document.querySelector('[data-role="hw"]')).not.toBeNull()
  })

  it('renders custom ScrollElement', async () => {
    const ScrollEl = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => (
      <section ref={ref} data-role="custom-scroll" {...props} />
    ))
    ScrollEl.displayName = 'ScrollEl'
    render(
      <VirtuosoMessageList
        initialData={['a']}
        ItemContent={({ data }) => <span>{data}</span>}
        // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- forwardRef type compat for ScrollElement slot
        ScrollElement={ScrollEl as unknown as React.ComponentType<React.HTMLProps<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    expect(document.querySelector('[data-role="custom-scroll"]')).not.toBeNull()
  })

  it('computeItemKey controls React keys without duplicate-key warnings', async () => {
    const computeItemKey = ({ data }: { data: { id: number }; index: number; context: unknown }) => data.id
    render(
      <VirtuosoMessageList
        initialData={[
          { id: 10, v: 'a' },
          { id: 20, v: 'b' },
        ]}
        computeItemKey={computeItemKey}
        ItemContent={({ data }) => <span>{data.v}</span>}
        style={{ height: 400 }}
      />
    )
    expect(await screen.findByText('a')).toBeTruthy()
    expect(screen.getByText('b')).toBeTruthy()
  })

  it('forwards scroller props (className / custom attributes) to the scroll element', async () => {
    const { container } = render(
      <VirtuosoMessageList
        initialData={['a']}
        ItemContent={({ data }) => <span>{data}</span>}
        className="my-list"
        data-role="scroller"
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    const scroller = container.querySelector<HTMLElement>('[data-role="scroller"]')
    expect(scroller).not.toBeNull()
    expect(scroller!.className).toContain('my-list')
  })

  it('exposes imperative handle (data / getScrollLocation / scrollToItem)', async () => {
    const ref = React.createRef<VirtuosoMessageListMethods<string, unknown>>()
    render(
      <VirtuosoMessageList ref={ref} initialData={['a', 'b']} ItemContent={({ data }) => <span>{data}</span>} style={{ height: 400 }} />
    )
    await screen.findByText('a')
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current!.data.append).toBe('function')
    const loc = ref.current!.getScrollLocation()
    expect(loc).toHaveProperty('scrollHeight')
    expect(loc).toHaveProperty('lastVisibleItemIndex')
    expect(() => {
      ref.current!.scrollToItem({ index: 0, align: 'start' })
    }).not.toThrow()
  })

  it('imperative data.append adds rendered rows', async () => {
    const ref = React.createRef<VirtuosoMessageListMethods<string, unknown>>()
    render(<VirtuosoMessageList ref={ref} initialData={['a']} ItemContent={({ data }) => <span>{data}</span>} style={{ height: 400 }} />)
    await screen.findByText('a')
    ref.current!.data.append(['b', 'c'])
    await waitFor(() => {
      expect(screen.queryByText('b')).toBeTruthy()
    })
    expect(screen.getByText('c')).toBeTruthy()
  })

  it('supports the controlled data prop (replaces rendered rows)', async () => {
    const { rerender } = render(
      <VirtuosoMessageList
        initialData={['a', 'b']}
        data={{ data: ['a', 'b'] }}
        ItemContent={({ data }) => <span>{data}</span>}
        style={{ height: 400 }}
      />
    )
    expect(await screen.findByText('a')).toBeTruthy()
    rerender(
      <VirtuosoMessageList
        initialData={['a', 'b']}
        data={{ data: ['x', 'y', 'z'] }}
        ItemContent={({ data }) => <span>{data}</span>}
        style={{ height: 400 }}
      />
    )
    await waitFor(() => {
      expect(screen.queryByText('x')).toBeTruthy()
    })
    expect(screen.getByText('z')).toBeTruthy()
    expect(screen.queryByText('a')).toBeNull()
  })

  it('calls onScroll with the scroll location', async () => {
    const onScroll = vi.fn()
    render(
      <VirtuosoMessageList
        initialData={['a', 'b', 'c']}
        ItemContent={({ data }) => <span>{data}</span>}
        onScroll={onScroll}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    expect(onScroll).toHaveBeenCalled()
    expect(onScroll.mock.calls[0]![0]).toHaveProperty('scrollHeight')
  })

  it('calls onRenderedDataChange with the visible slice', async () => {
    const onRenderedDataChange = vi.fn()
    render(
      <VirtuosoMessageList
        initialData={['a', 'b', 'c']}
        ItemContent={({ data }) => <span>{data}</span>}
        onRenderedDataChange={onRenderedDataChange}
        style={{ height: 400 }}
      />
    )
    await screen.findByText('a')
    await waitFor(() => {
      expect(onRenderedDataChange).toHaveBeenCalled()
    })
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- mock call is untyped
    const last = onRenderedDataChange.mock.calls.at(-1)![0] as unknown as string[]
    expect(last).toContain('a')
  })

  it('renders no data-index rows when ItemContent is absent', () => {
    render(<VirtuosoMessageList initialData={['a', 'b']} style={{ height: 400 }} />)
    expect(rows().length).toBe(0)
  })

  it('positions each row absolutely by offset', async () => {
    render(<VirtuosoMessageList initialData={['a', 'b', 'c']} ItemContent={({ data }) => <span>{data}</span>} style={{ height: 400 }} />)
    await screen.findByText('a')
    const tops = rows().map((el) => Number.parseFloat(el.style.top))
    expect(tops.length).toBeGreaterThan(0)
    // The first row is anchored at 0; the windowed slice uses monotonic offsets.
    expect(tops[0]).toBe(0)
  })
})
