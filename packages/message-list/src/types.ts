import type { ComponentType, CSSProperties, HTMLProps, ReactNode, RefAttributes } from 'react'

import type { DataWithScrollModifier, ItemLocation, ListScrollLocation } from './dataTypes'

// ---------------------------------------------------------------------------
// Slot component types
// ---------------------------------------------------------------------------

export type ContextAwareComponent<Context = unknown> = ComponentType<{
  context: Context
}>

export type ItemContent<Data = unknown, Context = unknown> = ComponentType<{
  index: number
  data: Data
  prevData: Data | null
  nextData: Data | null
  context: Context
}>

export type ScrollElementComponent<Context = unknown> = ComponentType<
  HTMLProps<HTMLDivElement> & { context?: Context } & RefAttributes<HTMLDivElement>
>

export type HeaderWrapperComponent = ComponentType<{ style: CSSProperties; children: ReactNode } & RefAttributes<HTMLDivElement>>

export type StickyHeaderWrapperComponent = ComponentType<{ style: CSSProperties; children: ReactNode } & RefAttributes<HTMLDivElement>>

export type FooterWrapperComponent = ComponentType<{ style: CSSProperties; children: ReactNode } & RefAttributes<HTMLDivElement>>

export type StickyFooterWrapperComponent = ComponentType<{ style: CSSProperties; children: ReactNode } & RefAttributes<HTMLDivElement>>

export type ShortSizeAlign = 'top' | 'bottom' | 'bottom-smooth'

export type ScrollerProps = Omit<HTMLProps<HTMLDivElement>, 'ref' | 'data' | 'onScroll'>

// ---------------------------------------------------------------------------
// Testing
// ---------------------------------------------------------------------------

export interface VirtuosoMessageListTestingContextValue {
  viewportHeight: number
  itemHeight: number
}

// ---------------------------------------------------------------------------
// VirtuosoMessageListProps
// ---------------------------------------------------------------------------

export interface VirtuosoMessageListProps<Data, Context> extends ScrollerProps {
  initialData?: Data[]
  context?: Context
  initialLocation?: ItemLocation
  computeItemKey?: (params: { data: Data; index: number; context: Context }) => React.Key
  ItemContent?: ItemContent<Data, Context>
  Header?: ContextAwareComponent<Context>
  StickyHeader?: ContextAwareComponent<Context>
  Footer?: ContextAwareComponent<Context>
  StickyFooter?: ContextAwareComponent<Context>
  EmptyPlaceholder?: ContextAwareComponent<Context>
  ScrollElement?: ScrollElementComponent<Context>
  onScroll?: (location: ListScrollLocation) => void
  onRenderedDataChange?: (range: Data[]) => void
  HeaderWrapper?: HeaderWrapperComponent
  StickyHeaderWrapper?: StickyHeaderWrapperComponent
  FooterWrapper?: FooterWrapperComponent
  StickyFooterWrapper?: StickyFooterWrapperComponent
  shortSizeAlign?: ShortSizeAlign
  useWindowScroll?: boolean
  customScrollParent?: HTMLElement | undefined | null
  increaseViewportBy?: number
  data?: DataWithScrollModifier<Data> | null | undefined
  itemIdentity?: (item: Data) => unknown
  enforceStickyFooterAtBottom?: boolean
}
