import { Cell } from '@virtuoso.dev/gurx'

import { DEFAULT_OVERSCAN, DEFAULT_VIEWPORT_HEIGHT } from '../constants'

/**
 * Viewport system: the height of the visible area and the overscan margin added
 * around the rendered range. The component publishes the measured viewport height;
 * `increaseViewportBy$` is driven directly from the prop.
 */

/** Height of the scrollable viewport, in pixels. */
export const viewportHeight$ = Cell<number>(DEFAULT_VIEWPORT_HEIGHT)

/** Extra pixels rendered above and below the visible range. */
export const increaseViewportBy$ = Cell<number>(DEFAULT_OVERSCAN)
