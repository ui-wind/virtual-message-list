import * as React from 'react'

import { useCellValues, useRealm } from '@virtuoso.dev/gurx'

import { data$ } from '../systems/data-system'
import { customScrollParent$, listElement$, scrollerElement$, scrollTo$, scrollTop$ } from '../systems/dom-system'
import { createItemObserver, createViewportObserver } from '../systems/measurement-system'
import { defaultItemSize$ } from '../systems/size-system'
import { viewportHeight$ } from '../systems/viewport-system'
import { List } from './list'
import { ItemObserverContext, useListRenderConfig } from './list-context'
import { useTestingContext } from './testing-context'

import type { ContextAwareComponent } from '../types'

/** Render a context-aware slot wrapped in an optional wrapper component. */
function Slot({
  Component,
  Wrapper,
  context,
  style,
}: {
  Component?: ContextAwareComponent | undefined
  Wrapper?: React.ComponentType<{ style: React.CSSProperties; children: React.ReactNode }> | undefined
  context: unknown
  style: React.CSSProperties
}) {
  if (!Component) {
    return null
  }
  const content = <Component context={context} />
  if (Wrapper) {
    const W = Wrapper
    return <W style={style}>{content}</W>
  }
  return <div style={style}>{content}</div>
}

/**
 * Scroll container + measurement wiring. Owns the scroller/list element refs,
 * subscribes to scroll → scrollTop$, scrollTo$ → scroll, and publishes both
 * element refs and observer callbacks via context. Renders the Header / Footer /
 * StickyHeader / StickyFooter slots around the windowed list and swaps in the
 * EmptyPlaceholder when there is no data.
 */
export function Scroller() {
  const realm = useRealm()
  const {
    ScrollElement,
    scrollerProps,
    context,
    Header,
    StickyHeader,
    Footer,
    StickyFooter,
    EmptyPlaceholder,
    HeaderWrapper,
    StickyHeaderWrapper,
    FooterWrapper,
    StickyFooterWrapper,
    shortSizeAlign,
    enforceStickyFooterAtBottom,
  } = useListRenderConfig<unknown, unknown>()

  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const [items] = useCellValues(data$)
  const isEmpty = items.length === 0
  const testing = useTestingContext()
  const simulated = testing !== undefined

  const itemObserver = React.useMemo(() => (simulated ? null : createItemObserver(realm)), [realm, simulated])
  const viewportObserver = React.useMemo(() => (simulated ? null : createViewportObserver(realm)), [realm, simulated])

  React.useLayoutEffect(() => {
    if (!testing) {
      return
    }
    realm.pub(viewportHeight$, testing.viewportHeight)
    realm.pub(defaultItemSize$, testing.itemHeight)
  }, [realm, testing])

  React.useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) {
      return
    }
    realm.pub(scrollerElement$, el)
  }, [realm])

  React.useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el || !viewportObserver) {
      return
    }
    viewportObserver.observe(el)
    return () => {
      viewportObserver.unobserve(el)
      viewportObserver.disconnect()
    }
  }, [realm, viewportObserver])

  React.useLayoutEffect(() => {
    const el = listRef.current
    if (!el) {
      return
    }
    realm.pub(listElement$, el)
    return () => {
      realm.pub(listElement$, null)
    }
  }, [realm])

  React.useLayoutEffect(
    () => () => {
      itemObserver?.disconnect()
    },
    [itemObserver]
  )

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) {
      return
    }
    const onScroll = () => {
      const top = el.scrollTop
      realm.pub(scrollTop$, top)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
    }
  }, [realm])

  React.useEffect(() => {
    const unsub = realm.sub(scrollTo$, ({ top, behavior }) => {
      const target = realm.getValue(customScrollParent$) ?? scrollerRef.current
      if (!target) {
        return
      }
      if (behavior === 'smooth') {
        target.scrollTo({ top, behavior: 'smooth' })
      } else {
        target.scrollTo({ top, behavior: 'auto' })
      }
    })
    return unsub
  }, [realm])

  const scrollElementProps = {
    ...((scrollerProps as object) ?? {}),
    style: {
      overflowY: 'auto',
      height: '100%',
      width: '100%',
      ...((scrollerProps as { style?: React.CSSProperties }).style ?? {}),
    } as React.CSSProperties,
  } as React.ComponentProps<'div'>

  const bottomAlign = shortSizeAlign === 'bottom' || shortSizeAlign === 'bottom-smooth'
  const listContent =
    isEmpty && EmptyPlaceholder ? (
      <EmptyPlaceholder context={context} />
    ) : (
      <div ref={listRef}>
        <ItemObserverContext.Provider value={itemObserver}>
          <List />
        </ItemObserverContext.Provider>
      </div>
    )

  const spacer = { flex: '1 1 auto', minHeight: 0 } as const

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {bottomAlign && <div style={spacer} />}
      <Slot Component={StickyHeader} Wrapper={StickyHeaderWrapper} context={context} style={{ position: 'sticky', top: 0, zIndex: 2 }} />
      <Slot Component={Header} Wrapper={HeaderWrapper} context={context} style={{}} />
      {listContent}
      {enforceStickyFooterAtBottom === true && <div style={spacer} />}
      <Slot Component={Footer} Wrapper={FooterWrapper} context={context} style={{}} />
      <Slot Component={StickyFooter} Wrapper={StickyFooterWrapper} context={context} style={{ position: 'sticky', bottom: 0, zIndex: 2 }} />
    </div>
  )

  if (ScrollElement) {
    const Cmp = ScrollElement
    return (
      <Cmp ref={scrollerRef} {...scrollElementProps}>
        {inner}
      </Cmp>
    )
  }

  return (
    <div ref={scrollerRef} {...scrollElementProps}>
      {inner}
    </div>
  )
}
