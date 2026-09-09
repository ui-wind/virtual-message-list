import * as React from 'react'

import { Realm } from '@virtuoso.dev/gurx'

import { DEFAULT_ITEM_HEIGHT } from '../constants'
import { SystemProvider } from '../system-to-component'
import { data$ } from '../systems/data-system'
import { scrollerElement$ } from '../systems/dom-system'
import { customScrollParent$, useWindowScroll$ } from '../systems/dom-system'
import { listScrollLocation$ } from '../systems/scroll-location-system'
import { itemCount$, defaultItemSize$ } from '../systems/size-system'
import { increaseViewportBy$ } from '../systems/viewport-system'
import { ListRenderProvider } from './list-context'
import { Scroller } from './scroller'

import type { VirtuosoMessageListMethods } from '../dataTypes'
import type { VirtuosoMessageListProps } from '../types'

function VirtuosoMessageListInner<Data, Context>(
  props: VirtuosoMessageListProps<Data, Context>,
  ref: React.ForwardedRef<VirtuosoMessageListMethods<Data, Context>>
) {
  const {
    initialData,
    context,
    computeItemKey,
    ItemContent,
    ScrollElement,
    onRenderedDataChange,
    increaseViewportBy,
    useWindowScroll: useWindowScrollProp,
    customScrollParent,
    data: controlledData,
    className,
    style,
    ...scrollerRest
  } = props as VirtuosoMessageListProps<Data, Context> & Record<string, unknown>

  const realm = React.useMemo(() => {
    const initData = (controlledData as { data?: Data[] | null } | null | undefined)?.data ?? initialData ?? []
    const arr = (Array.isArray(initData) ? initData : []) as unknown[]
    return new Realm({
      [data$ as unknown as symbol]: arr,
      [itemCount$ as unknown as symbol]: arr.length,
      [defaultItemSize$ as unknown as symbol]: DEFAULT_ITEM_HEIGHT,
      [increaseViewportBy$ as unknown as symbol]: increaseViewportBy ?? 0,
      [useWindowScroll$ as unknown as symbol]: Boolean(useWindowScrollProp),
      [customScrollParent$ as unknown as symbol]: (customScrollParent as HTMLElement | null) ?? null,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- one realm per mount

  const updates = React.useMemo<Record<symbol, unknown>>(() => {
    const out: Record<symbol, unknown> = {}
    if (controlledData !== undefined) {
      const arr = (controlledData as { data?: Data[] | null } | null | undefined)?.data
      const normalized = Array.isArray(arr) ? (arr as unknown[]) : []
      out[data$ as unknown as symbol] = normalized
      out[itemCount$ as unknown as symbol] = normalized.length
    }
    if (increaseViewportBy !== undefined) out[increaseViewportBy$ as unknown as symbol] = increaseViewportBy
    if (useWindowScrollProp !== undefined) out[useWindowScroll$ as unknown as symbol] = Boolean(useWindowScrollProp)
    if (customScrollParent !== undefined) out[customScrollParent$ as unknown as symbol] = (customScrollParent as HTMLElement | null) ?? null
    return out
  }, [controlledData, increaseViewportBy, useWindowScrollProp, customScrollParent])

  React.useImperativeHandle(
    ref as React.ForwardedRef<VirtuosoMessageListMethods<unknown, unknown>>,
    () => ({
      data: {
        prepend: () => {},
        append: () => {},
        map: () => {},
        mapWithAnchor: () => {},
        findAndDelete: () => {},
        findIndex: () => -1,
        find: () => undefined,
        replace: () => {},
        insert: () => {},
        deleteRange: () => {},
        batch: (cb: () => void) => cb(),
        get: () => [...(realm.getValue(data$ as unknown as import('@virtuoso.dev/gurx').NodeRef<unknown[]>) as unknown[])],
        getCurrentlyRendered: () => [],
        removeFromStart: () => {},
      } as unknown as import('../dataTypes').DataMethods<unknown, unknown>,
      scrollToItem: () => {},
      scrollIntoView: () => {},
      scrollerElement: () =>
        realm.getValue(scrollerElement$ as unknown as import('@virtuoso.dev/gurx').NodeRef<HTMLElement | null>) as HTMLDivElement | null,
      getScrollLocation: () => realm.getValue(listScrollLocation$),
      cancelSmoothScroll: () => {},
      notifyItemsChanged: () => {},
      height: () => 0,
    }),
    [realm]
  )

  const renderConfig = React.useMemo(
    () => ({
      context: context as Context,
      ItemContent: ItemContent as VirtuosoMessageListProps<Data, Context>['ItemContent'],
      computeItemKey: computeItemKey as VirtuosoMessageListProps<Data, Context>['computeItemKey'],
      onRenderedDataChange: onRenderedDataChange as VirtuosoMessageListProps<Data, Context>['onRenderedDataChange'],
      ScrollElement: ScrollElement as VirtuosoMessageListProps<Data, Context>['ScrollElement'],
      scrollerProps: { className, style, ...scrollerRest } as Record<string, unknown>,
    }),
    [context, ItemContent, computeItemKey, onRenderedDataChange, ScrollElement, className, style, scrollerRest]
  )

  return (
    <SystemProvider realm={realm} updates={updates}>
      <ListRenderProvider value={renderConfig as never}>
        <Scroller />
      </ListRenderProvider>
    </SystemProvider>
  )
}

export const VirtuosoMessageList = React.forwardRef(VirtuosoMessageListInner) as <Data, Context = unknown>(
  props: VirtuosoMessageListProps<Data, Context> & { ref?: React.Ref<VirtuosoMessageListMethods<Data, Context>> }
) => React.ReactElement | null
