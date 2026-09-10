import { describe, expect, it } from 'vitest'

import { clamp, easeInOutCubic, lerp, offsetForAlign } from '../../src/utils/math'

describe('clamp', () => {
  it('returns value within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when min equals max', () => {
    expect(clamp(5, 3, 3)).toBe(3)
  })
})

describe('lerp', () => {
  it('interpolates at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10)
  })

  it('interpolates at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20)
  })

  it('interpolates at t=0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0)
  })
})

describe('easeInOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeInOutCubic(0)).toBe(0)
  })

  it('returns 1 at t=1', () => {
    expect(easeInOutCubic(1)).toBeCloseTo(1)
  })

  it('returns 0.5 at t=0.5', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5)
  })

  it('is monotonically increasing', () => {
    let prev = 0
    for (let t = 0.1; t <= 1; t += 0.1) {
      const cur = easeInOutCubic(t)
      expect(cur).toBeGreaterThanOrEqual(prev)
      prev = cur
    }
  })
})

describe('offsetForAlign', () => {
  const scrollSize = 1000
  const viewport = 200
  const itemSize = 50

  it('start returns itemOffset', () => {
    expect(offsetForAlign('start', 300, itemSize, viewport, scrollSize)).toBe(300)
  })

  it('undefined defaults to start', () => {
    expect(offsetForAlign(undefined, 300, itemSize, viewport, scrollSize)).toBe(300)
  })

  it('center centers the item', () => {
    // itemOffset - (viewport - itemSize)/2 = 300 - 75 = 225
    expect(offsetForAlign('center', 300, itemSize, viewport, scrollSize)).toBe(225)
  })

  it('end aligns item to viewport bottom', () => {
    // 300 - (200-50) = 150
    expect(offsetForAlign('end', 300, itemSize, viewport, scrollSize)).toBe(150)
  })

  it('clamps center to 0 when item near top', () => {
    expect(offsetForAlign('center', 10, itemSize, viewport, scrollSize)).toBe(0)
  })

  it('clamps end to max scroll when item near bottom', () => {
    // max scroll = 800
    expect(offsetForAlign('center', 900, itemSize, viewport, scrollSize)).toBe(800)
  })

  it('start-no-overflow returns itemOffset when item fits', () => {
    expect(offsetForAlign('start-no-overflow', 100, itemSize, viewport, scrollSize)).toBe(100)
  })

  it('start-no-overflow returns scrollSize - viewport when item overflows', () => {
    // item end = 960 + 50 = 1010 > scrollSize 1000
    expect(offsetForAlign('start-no-overflow', 960, itemSize, viewport, scrollSize)).toBe(800)
  })
})
