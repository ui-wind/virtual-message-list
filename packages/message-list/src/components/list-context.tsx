import * as React from 'react'

import type { ItemContent, VirtuosoMessageListProps } from '../types'

export interface ListRenderConfig<Data, Context> {
  context: Context
  ItemContent: ItemContent<Data, Context> | undefined
  computeItemKey: VirtuosoMessageListProps<Data, Context>['computeItemKey']
  onRenderedDataChange: VirtuosoMessageListProps<Data, Context>['onRenderedDataChange']
  ScrollElement: VirtuosoMessageListProps<Data, Context>['ScrollElement']
  scrollerProps: Record<string, unknown>
}

const ListRenderContext = React.createContext<ListRenderConfig<unknown, unknown> | null>(null)

export function useListRenderConfig<Data, Context>(): ListRenderConfig<Data, Context> {
  const value = React.useContext(ListRenderContext) as ListRenderConfig<Data, Context> | null
  if (!value) throw new Error('useListRenderConfig must be used within VirtuosoMessageList')
  return value
}

export function ListRenderProvider<Data, Context>({
  value,
  children,
}: {
  value: ListRenderConfig<Data, Context>
  children: React.ReactNode
}) {
  return <ListRenderContext.Provider value={value as unknown as ListRenderConfig<unknown, unknown>}>{children}</ListRenderContext.Provider>
}

export const ItemObserverContext = React.createContext<ResizeObserver | null>(null)

export function useItemObserver(): ResizeObserver | null {
  return React.useContext(ItemObserverContext)
}
