import * as React from 'react'

import { Realm } from '@virtuoso.dev/gurx'

import { applyControlledData, createDataMethods, createListMethods } from '../data-ops'
import { MethodsProvider } from '../hooks'
import { SystemProvider } from '../system-to-component'
import { connectAutoscrollSystem } from '../systems/autoscroll-system'
import { context$ } from '../systems/config-system'
import { connectDataSystem, data$, itemIdentity$ } from '../systems/data-system'
import { customScrollParent$, scrollTop$, useWindowScroll$ } from '../systems/dom-system'
import { visibleRange$ } from '../systems/range-system'
import { listScrollLocation$ } from '../systems/scroll-location-system'
import { defaultItemSize$, itemCount$, listHeight$, offsetTree$, resetSizes$ } from '../systems/size-system'
import { connectSmoothScrollSystem, prependAnchor$, scrollToLocation$ } from '../systems/smooth-scroll-system'
import { increaseViewportBy$ } from '../systems/viewport-system'
import { ListRenderProvider } from './list-context'
import { Scroller } from './scroller'

import type { ScrollModifier, VirtuosoMessageListMethods } from '../dataTypes'
import type { VirtuosoMessageListProps } from '../types'
import type { ListRenderConfig } from './list-context'

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
    Header,
    StickyHeader,
    Footer,
    StickyFooter,
    EmptyPlaceholder,
    HeaderWrapper,
    StickyHeaderWrapper,
    FooterWrapper,
    StickyFooterWrapper,
    onRenderedDataChange,
    onScroll,
    initialLocation,
    increaseViewportBy,
    useWindowScroll: useWindowScrollProp,
    customScrollParent,
    data: controlledData,
    itemIdentity,
    shortSizeAlign,
    enforceStickyFooterAtBottom,
    className,
    style,
    ...scrollerRest
  } = props

  const realm = React.useMemo(() => {
    const raw = controlledData?.data ?? initialData ?? []
    const arr: unknown[] = Array.isArray(raw) ? raw : []
    // `itemIdentity` is `(item: Data) => unknown`; the realm cell erases Data to
    // `unknown`. Data items always flow in as `unknown`, so the identity callback
    // only ever receives values of the original Data type at runtime.
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic boundary (Data identity → erased unknown)
    const identity = (itemIdentity as ((item: unknown) => unknown) | undefined) ?? null
    const r = new Realm({
      [data$]: arr,
      [increaseViewportBy$]: increaseViewportBy ?? 0,
      [useWindowScroll$]: useWindowScrollProp === true,
      [customScrollParent$]: customScrollParent ?? null,
      [context$]: context,
      [itemIdentity$]: identity,
    })
    connectDataSystem(r, {
      itemCount$,
      resetSizes$,
      scrollTop$,
      defaultItemSize$,
      prependAnchor$,
    })
    connectAutoscrollSystem(r)
    connectSmoothScrollSystem(r)
    return r
    // oxlint-disable-next-line eslint-plugin-react-hooks(exhaustive-deps) -- one realm per mount
  }, [])

  const updates = React.useMemo<Record<symbol, unknown>>(() => {
    const out: Record<symbol, unknown> = {}
    if (increaseViewportBy !== undefined) {
      out[increaseViewportBy$] = increaseViewportBy
    }
    if (useWindowScrollProp !== undefined) {
      out[useWindowScroll$] = useWindowScrollProp
    }
    if (customScrollParent !== undefined) {
      out[customScrollParent$] = customScrollParent ?? null
    }
    out[context$] = context
    // See the realm-construction note: Data identity is only ever invoked on
    // values of the original Data type, so erasing to `unknown` is runtime-safe.
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic boundary (Data identity → erased unknown)
    out[itemIdentity$] = (itemIdentity as ((item: unknown) => unknown) | undefined) ?? null
    return out
  }, [increaseViewportBy, useWindowScrollProp, customScrollParent, context, itemIdentity])

  const prevControlledRef = React.useRef<unknown[] | null>(null)
  const initialControlledApplied = React.useRef(false)

  React.useLayoutEffect(() => {
    if (controlledData === undefined || controlledData === null) {
      prevControlledRef.current = null
      initialControlledApplied.current = false
      return
    }
    const raw = controlledData.data
    const nextData: unknown[] = Array.isArray(raw) ? raw : []
    const modifier: ScrollModifier | undefined = controlledData.scrollModifier

    if (!initialControlledApplied.current) {
      const current: unknown[] = realm.getValue(data$)
      const sameRef = current === nextData
      const sameContent = !sameRef && current.length === nextData.length && current.every((v, i) => v === nextData[i])
      initialControlledApplied.current = true
      prevControlledRef.current = [...nextData]
      if (sameRef || sameContent) {
        return
      }
    }

    const prevData = prevControlledRef.current
    if (prevData !== null) {
      const sameRef = prevData === nextData
      const sameContent = !sameRef && prevData.length === nextData.length && prevData.every((v, i) => v === nextData[i])
      if (sameRef || sameContent) {
        return
      }
      applyControlledData(realm, prevData, nextData, modifier)
    }
    prevControlledRef.current = [...nextData]
  }, [controlledData, realm])

  React.useEffect(() => {
    if (!onScroll) {
      return
    }
    return realm.sub(listScrollLocation$, (location) => {
      onScroll(location)
    })
  }, [realm, onScroll])

  React.useEffect(() => {
    if (initialLocation === undefined) {
      return
    }
    realm.pub(scrollToLocation$, { location: initialLocation })
  }, [realm, initialLocation])

  // gurx constructor-seeded values never trigger a recomputation cycle, so
  // `itemCount$` cannot live in the realm constructor above: the layout
  // `combine` chain (`offsetTree$`/`listHeight$`/`visibleRange$`/
  // `listScrollLocation$`) would never fire and only a single row would render.
  // Publish it in a mount effect AFTER the subscription effects above (and after
  // React has registered the child `useCellValues` cells), so the initial layout
  // is computed and `onScroll` observes the resulting location emission.
  React.useEffect(() => {
    const count: number = Array.isArray(controlledData?.data ?? initialData ?? []) ? (controlledData?.data ?? initialData ?? []).length : 0
    realm.getValue(visibleRange$)
    realm.getValue(offsetTree$)
    realm.getValue(listHeight$)
    realm.getValue(listScrollLocation$)
    realm.pub(itemCount$, count)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; data flow is handled by the controlled-data effect
  }, [realm])

  const dataMethods = React.useMemo(() => createDataMethods(realm), [realm])
  const methods = React.useMemo(() => createListMethods(realm, dataMethods), [realm, dataMethods])

  // `VirtuosoMessageListInner` is generic in Data/Context but `useImperativeHandle`'s
  // ref param is bivariant in those generics; the runtime value is always created
  // for the same Data/Context the caller supplied via props.
  React.useImperativeHandle(
    // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic forwardRef boundary
    ref as React.ForwardedRef<VirtuosoMessageListMethods<unknown, unknown>>,
    () =>
      // Same erasure: `methods` is typed `unknown, unknown` but at runtime it carries
      // the caller's Data/Context.
      // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- generic forwardRef boundary
      methods as unknown as VirtuosoMessageListMethods<unknown, unknown>,
    [methods]
  )

  const renderConfig: ListRenderConfig<Data, Context> = React.useMemo(
    () => ({
      context,
      ItemContent,
      computeItemKey,
      onRenderedDataChange,
      ScrollElement,
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
      scrollerProps: { className, style, ...scrollerRest } as Record<string, unknown>,
    }),
    [
      context,
      ItemContent,
      computeItemKey,
      onRenderedDataChange,
      ScrollElement,
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
      className,
      style,
      scrollerRest,
    ]
  )

  return (
    <SystemProvider realm={realm} updates={updates}>
      <ListRenderProvider value={renderConfig}>
        <MethodsProvider methods={methods}>
          <Scroller />
        </MethodsProvider>
      </ListRenderProvider>
    </SystemProvider>
  )
}

// `React.forwardRef` is bivariant-typed as `ForwardedRef<unknown>`; re-casting to
// the public generic API is the standard pattern (react-virtuoso does the same).
// oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- public-API generic forwardRef pattern
export const VirtuosoMessageList = React.forwardRef(VirtuosoMessageListInner) as <Data, Context = unknown>(
  props: VirtuosoMessageListProps<Data, Context> & { ref?: React.Ref<VirtuosoMessageListMethods<Data, Context>> }
) => React.ReactElement | null
