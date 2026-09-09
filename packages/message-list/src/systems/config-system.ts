import { Cell } from '@virtuoso.dev/gurx'

/**
 * Config system: reactive values that are neither data nor DOM but are read by
 * scroll policy — currently only the list `context`, surfaced to the
 * `auto-scroll-to-bottom` callback params. Kept as its own leaf so the autoscroll
 * system can read it without importing the data system (avoids a realm cycle).
 */

/** The consumer-supplied `context`, passed through to autoscroll callbacks. */
export const context$ = Cell<unknown>(undefined)
