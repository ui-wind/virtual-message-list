import * as React from 'react'

import { useRealm } from '@virtuoso.dev/gurx'

import { customScrollParent$, listElement$, scrollerElement$, scrollTo$, scrollTop$ } from '../systems/dom-system'
import { createItemObserver, createViewportObserver } from '../systems/measurement-system'
import { List } from './list'
import { ItemObserverContext, useListRenderConfig } from './list-context'

/**
 * Scroll container + measurement wiring. Owns the scroller/list element refs,
 * subscribes to scroll → scrollTop$, scrollTo$ → scroll, and publishes both
 * element refs and observer callbacks via context.
 */
export function Scroller() {
  const realm = useRealm()
  const { ScrollElement, scrollerProps } = useListRenderConfig<unknown, unknown>()

  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const itemObserver = React.useMemo(() => createItemObserver(realm), [realm])
  const viewportObserver = React.useMemo(() => createViewportObserver(realm), [realm])

  React.useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    realm.pub(scrollerElement$, el)
    viewportObserver.observe(el)
    return () => {
      viewportObserver.unobserve(el)
      viewportObserver.disconnect()
    }
  }, [realm, viewportObserver])

  React.useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    realm.pub(listElement$, el)
    return () => realm.pub(listElement$, null)
  }, [realm])

  React.useLayoutEffect(
    () => () => {
      itemObserver.disconnect()
    },
    [itemObserver]
  )

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const top = el.scrollTop
      realm.pub(scrollTop$, top)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [realm])

  React.useEffect(() => {
    const unsub = realm.sub(scrollTo$, ({ top, behavior }) => {
      const target = realm.getValue(customScrollParent$) ?? scrollerRef.current
      if (!target) return
      const el = target as HTMLElement
      if (behavior === 'smooth') el.scrollTo({ top, behavior: 'smooth' })
      else el.scrollTo({ top, behavior: 'auto' })
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

  const inner = (
    <div ref={listRef}>
      <ItemObserverContext.Provider value={itemObserver}>
        <List />
      </ItemObserverContext.Provider>
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
