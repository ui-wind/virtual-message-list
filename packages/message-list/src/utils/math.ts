export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function offsetForAlign(
  align: 'start' | 'center' | 'end' | 'start-no-overflow' | undefined,
  itemOffset: number,
  itemSize: number,
  viewportSize: number,
  scrollSize: number
): number {
  switch (align) {
    case 'center':
      return clamp(itemOffset - (viewportSize - itemSize) / 2, 0, Math.max(0, scrollSize - viewportSize))
    case 'end':
      return clamp(itemOffset - (viewportSize - itemSize), 0, Math.max(0, scrollSize - viewportSize))
    case 'start-no-overflow': {
      const end = itemOffset + itemSize
      return end > scrollSize ? scrollSize - viewportSize : itemOffset
    }
    case 'start':
    case undefined:
    default:
      return itemOffset
  }
}
