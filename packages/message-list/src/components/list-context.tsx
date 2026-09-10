import * as React from 'react'

import type { ItemContent, VirtuosoMessageListProps } from '../types'

export interface ListRenderConfig<Data, Context> {
  context: Context | undefined
  ItemContent: ItemContent<Data, Context> | undefined
  computeItemKey: VirtuosoMessageListProps<Data, Context>['computeItemKey']
  onRenderedDataChange: VirtuosoMessageListProps<Data, Context>['onRenderedDataChange']
  ScrollElement: VirtuosoMessageListProps<Data, Context>['ScrollElement']
  Header: VirtuosoMessageListProps<Data, Context>['Header']
  StickyHeader: VirtuosoMessageListProps<Data, Context>['StickyHeader']
  Footer: VirtuosoMessageListProps<Data, Context>['Footer']
  StickyFooter: VirtuosoMessageListProps<Data, Context>['StickyFooter']
  EmptyPlaceholder: VirtuosoMessageListProps<Data, Context>['EmptyPlaceholder']
  HeaderWrapper: VirtuosoMessageListProps<Data, Context>['HeaderWrapper']
  StickyHeaderWrapper: VirtuosoMessageListProps<Data, Context>['StickyHeaderWrapper']
  FooterWrapper: VirtuosoMessageListProps<Data, Context>['FooterWrapper']
  StickyFooterWrapper: VirtuosoMessageListProps<Data, Context>['StickyFooterWrapper']
  shortSizeAlign: VirtuosoMessageListProps<Data, Context>['shortSizeAlign']
  enforceStickyFooterAtBottom: VirtuosoMessageListProps<Data, Context>['enforceStickyFooterAtBottom']
  scrollerProps: Record<string, unknown>
}

const ListRenderContext = React.createContext<ListRenderConfig<unknown, unknown> | null>(null)

export function useListRenderConfig<Data, Context>(): ListRenderConfig<Data, Context> {
  // The context stores the erased `ListRenderConfig<unknown, unknown>`; consumers
  // re-narrow to their own Data/Context. The value is only ever written by the
  // matching ListRenderProvider, so this round-trip is type-safe in practice.
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic context boundary (erasure → consumer type)
  const value = React.useContext(ListRenderContext) as ListRenderConfig<Data, Context> | null
  if (!value) {
    throw new Error('useListRenderConfig must be used within VirtuosoMessageList')
  }
  return value
}

export function ListRenderProvider<Data, Context>({
  value,
  children,
}: {
  value: ListRenderConfig<Data, Context>
  children: React.ReactNode
}) {
  // `ListRenderConfig` is invariant in Data/Context, so the typed value is not
  // structurally assignable to the erased `unknown, unknown` slot the context holds.
  // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic context boundary (consumer type → erasure)
  return <ListRenderContext.Provider value={value as unknown as ListRenderConfig<unknown, unknown>}>{children}</ListRenderContext.Provider>
}

export const ItemObserverContext = React.createContext<ResizeObserver | null>(null)

export function useItemObserver(): ResizeObserver | null {
  return React.useContext(ItemObserverContext)
}
