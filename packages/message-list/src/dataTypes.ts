/**
 * Core data shapes, scroll location, and scroll modifier types.
 * Mirrors the behaviour documented in the vendored commercial reference,
 * authored from scratch as the original public contract.
 */

/**
 * A function that describes the easing curve for a scroll animation.
 */
export type BezierFunction = (x: number) => number

/**
 * The scroll behavior to use when scrolling to a location.
 * Pass a function to supply a custom easing curve and frame count based on
 * the current and target scroll positions.
 *
 * Named `ScrollBehavior` at the public boundary; defined here with a distinct
 * internal name to avoid shadowing the DOM lib's `ScrollBehavior` global.
 */
export type ScrollBehavior = 'smooth' | 'auto' | 'instant' | ScrollBehaviorFunction

export type ScrollBehaviorFunction = (
  currentTop: number,
  targetTop: number
) => {
  animationFrameCount: number
  easing: BezierFunction
}

/**
 * A location in the list to scroll to. Passing a number scrolls instantly to
 * the item at the specified index, aligned to the top.
 */
export type ItemLocation = number | ItemLocationWithAlign

export interface ItemLocationWithAlign {
  /** The index of the item to scroll to. Use `'LAST'` for the last item. */
  index: number | 'LAST'
  /** How to align the item in the viewport. */
  align?: 'start' | 'center' | 'end' | 'start-no-overflow'
  /** Set to `'smooth'` for an animated transition to the location. */
  behavior?: ScrollBehavior
  /** Additional positive or negative adjustment of the position, in pixels. */
  offset?: number
  /** Invoked once the scroll completes. */
  done?: () => void
}

/**
 * Describes the location of the list relative to the viewport and scroll element.
 */
export interface ListScrollLocation {
  /**
   * Distance between the list top edge and the viewport top edge.
   * Negative when the list is above the viewport (scrolled down); `0` at the top.
   */
  listOffset: number
  /** Height of the visible portion of the list, excluding headers and footers. */
  visibleListHeight: number
  /** Scroll height of the scroller wrapper. */
  scrollHeight: number
  /**
   * Distance between the scroller element bottom edge and the viewport bottom edge.
   * `0` means the list is at the bottom.
   */
  bottomOffset: number
  /** Whether the list is at the bottom, or currently scrolling toward it. */
  isAtBottom: boolean
  /** Index of the bottom-most item visible in the viewport. */
  lastVisibleItemIndex: number
  /**
   * Pixel distance from the bottom edge of the last visible item to the viewport
   * bottom edge. `0` means the item's bottom is flush with the viewport bottom.
   */
  lastItemBottomOffset: number
}

/**
 * Specifies whether a data or rendered-item size change should scroll to the
 * bottom. `false`/`undefined` preserves the viewport; `true` is `'auto'`; a
 * `ScrollBehavior` applies only when already at the bottom. The callback form
 * receives the pre-change state and may return `false`, a `ScrollBehavior`, or
 * an `ItemLocation`.
 */
export type AutoscrollToBottom<Data = unknown, Context = unknown> =
  | ItemLocationCallback<Data, Context>
  | NonNullable<ScrollToOptions['behavior']>
  | boolean

export interface ItemLocationCallbackParams<Data = unknown, Context = unknown> {
  scrollLocation: ListScrollLocation
  scrollInProgress: boolean
  atBottom: boolean
  /**
   * Data supplied by the triggering operation: added items for append/insert,
   * the next array for declarative updates, current list data for
   * `notifyItemsChanged`.
   */
  data: Data[]
  context: Context
}

export type ItemLocationCallback<Data = unknown, Context = unknown> = (
  params: ItemLocationCallbackParams<Data, Context>
) => ScrollBehavior | boolean | ItemLocation

/**
 * Options for `notifyItemsChanged`: signals that rendered item content may
 * have resized without a data change, and how to respond.
 */
export interface NotifyItemsChangedOptions<Data = unknown, Context = unknown> {
  scrollToBottom: AutoscrollToBottom<Data, Context>
}

/**
 * Parameters passed to callbacks when data changes in the list.
 */
export interface DataChangeParams<Data = unknown> {
  newData: Data
  autoscrollToBottomBehavior?: ScrollBehavior | { location: () => ItemLocation | null | undefined }
}

/**
 * Predefined scroll modifier options for common data operations.
 */
export const ScrollModifierOption = {
  prepend: 'prepend',
  removeFromStart: 'remove-from-start',
  removeFromEnd: 'remove-from-end',
} as const

export type ScrollModifierOptionType = typeof ScrollModifierOption
export type ScrollModifierOptionValue = ScrollModifierOptionType[keyof ScrollModifierOptionType]

/**
 * Describes the scroll modification to perform when the list data is updated.
 */
export type ScrollModifier =
  | null
  | undefined
  | { type: 'item-location'; location: ItemLocation; purgeItemSizes?: boolean }
  | { type: 'auto-scroll-to-bottom'; autoScroll: AutoscrollToBottom }
  | {
      type: 'items-change'
      behavior: ScrollBehavior | { location: () => ItemLocation | null | undefined }
    }
  | ScrollModifierOptionValue

/**
 * The shape of the message list `data` prop: the data to render plus any scroll
 * position modification to apply when the data changes.
 */
export interface DataWithScrollModifier<Data> {
  data: Data[] | null | undefined
  scrollModifier?: ScrollModifier
}

/**
 * Methods for manipulating the data in the list, available on the imperative
 * handle and via `useVirtuosoMethods`.
 */
export interface DataMethods<Data = any, Context = any> {
  /** Prepend items while preserving scroll position. */
  prepend: (data: Data[]) => void
  /** Append items, optionally scrolling to the bottom. */
  append: (data: Data[], scrollToBottom?: AutoscrollToBottom<Data, Context>) => void
  /** Map each item, optionally scrolling to the bottom if the change displaces the list. */
  map: (
    callbackfn: (data: Data, index: number) => Data,
    autoscrollToBottomBehavior?: ScrollBehavior | { location: () => ItemLocation | null | undefined }
  ) => void
  /** Map each item while keeping the specified item anchored in the viewport. */
  mapWithAnchor: (callbackfn: (data: Data, index: number) => Data, anchorItemIndex: number) => void
  /** Delete items matching the predicate. */
  findAndDelete: (predicate: (item: Data, index: number) => boolean) => void
  /** Index of the first item matching the predicate, or -1. */
  findIndex: (predicate: (item: Data, index: number, data: Data[]) => boolean) => number
  /** First item matching the predicate, or undefined. */
  find: (predicate: (item: Data, index: number, data: Data[]) => boolean) => Data | undefined
  /** Replace the data, optionally specifying a scroll location and size-cache handling. */
  replace: (
    data: Data[],
    options?: {
      initialLocation?: ItemLocation
      purgeItemSizes?: boolean
      suppressItemMeasure?: boolean
    }
  ) => void
  /** Insert data at the given offset, optionally scrolling to the bottom. */
  insert: (data: Data[], offset: number, scrollToBottom?: AutoscrollToBottom<Data, Context>) => void
  /** Delete a range of items starting at `offset`. */
  deleteRange: (offset: number, count: number) => void
  /** Batch the operations in `callback` into a single render cycle. */
  batch: (callback: () => void, scrollToBottom?: AutoscrollToBottom<Data, Context>) => void
  /** Shallow copy of the current data. */
  get: () => Data[]
  /** The currently rendered data items. */
  getCurrentlyRendered: () => Data[]
  /** Remove the specified number of items from the start of the list. */
  removeFromStart: (count: number) => void
}

/**
 * The imperative API of the message list component.
 */
export interface VirtuosoMessageListMethods<Data = any, Context = any> {
  data: DataMethods<Data, Context>
  scrollToItem: (location: ItemLocation) => void
  scrollIntoView: (location: ItemLocation) => void
  scrollerElement: () => HTMLDivElement | null
  getScrollLocation: () => ListScrollLocation
  cancelSmoothScroll: () => void
  notifyItemsChanged: (options: NotifyItemsChangedOptions<Data, Context>) => void
  height: (item: Data) => number
}
