import h, { useEffect as $n, useLayoutEffect as Ho } from 'react'

import {
  Cell as c,
  Signal as y,
  map as g,
  filter as v,
  withLatestFrom as x,
  scan as ae,
  debounceTime as Ae,
  mapTo as K,
  throttleTime as rn,
  delayWithMicrotask as it,
  onNext as wn,
  Action as un,
  useCellValue as C,
  useRealm as _e,
  Realm as Oo,
  RealmContext as Do,
  useCellValues as Bo,
  usePublisher as No,
} from '@virtuoso.dev/gurx'
import { jsx as w, jsxs as Ln } from 'react/jsx-runtime'
function Pe(e, t) {
  const n = c(e, (o) => {
    o.link(t(o), n)
  })
  return n
}
const Ue = { lvl: 0 }
function Rn(e, t, n, o = Ue, i = Ue) {
  return { k: e, l: o, lvl: n, r: i, v: t }
}
function E(e) {
  return e === Ue
}
function We() {
  return Ue
}
function Kt(e, t) {
  if (E(e)) return Ue
  const { k: n, l: o, r: i } = e
  if (t === n) {
    if (E(o)) return i
    if (E(i)) return o
    const [s, l] = Mn(o)
    return vt(O(e, { k: s, l: An(o), v: l }))
  }
  return t < n ? vt(O(e, { l: Kt(o, t) })) : vt(O(e, { r: Kt(i, t) }))
}
function be(e, t, n = 'k') {
  if (E(e)) return [Number.NEGATIVE_INFINITY, void 0]
  if (e[n] === t) return [e.k, e.v]
  if (e[n] < t) {
    const o = be(e.r, t, n)
    return o[0] === Number.NEGATIVE_INFINITY ? [e.k, e.v] : o
  }
  return be(e.l, t, n)
}
function U(e, t, n) {
  return E(e) ? Rn(t, n, 1) : t === e.k ? O(e, { k: t, v: n }) : t < e.k ? xn(O(e, { l: U(e.l, t, n) })) : xn(O(e, { r: U(e.r, t, n) }))
}
function Ut(e, t, n) {
  if (E(e)) return []
  const { k: o, v: i, l: s, r: l } = e
  let r = []
  return (o > t && (r = r.concat(Ut(s, t, n))), o >= t && o <= n && r.push({ k: o, v: i }), o <= n && (r = r.concat(Ut(l, t, n))), r)
}
function Fo(e, t, n, o) {
  if (E(e)) return Ue
  let i = We()
  for (const { k: s, v: l } of Ie(e)) s > t && s <= n ? (i = U(i, ...o(s, l))) : (i = U(i, s, l))
  return i
}
function _o(e, t, n) {
  let o = We(),
    i = -1
  for (const { start: s, end: l, value: r } of Po(e))
    s < t ? ((o = U(o, s, r)), (i = r)) : s > t + n ? (o = U(o, s - n, r)) : l >= t + n && i !== r && (o = U(o, t, r))
  return o
}
function Ie(e) {
  return E(e) ? [] : [...Ie(e.l), { k: e.k, v: e.v }, ...Ie(e.r)]
}
function Mn(e) {
  return E(e.r) ? [e.k, e.v] : Mn(e.r)
}
function An(e) {
  return E(e.r) ? e.l : vt(O(e, { r: An(e.r) }))
}
function O(e, t) {
  return Rn(t.k ?? e.k, t.v ?? e.v, t.lvl ?? e.lvl, t.l ?? e.l, t.r ?? e.r)
}
function zt(e) {
  return E(e) || e.lvl > e.r.lvl
}
function xn(e) {
  return qt(Dn(e))
}
function vt(e) {
  const { l: t, r: n, lvl: o } = e
  if (n.lvl >= o - 1 && t.lvl >= o - 1) return e
  if (o > n.lvl + 1) {
    if (zt(t)) return Dn(O(e, { lvl: o - 1 }))
    if (!E(t) && !E(t.r))
      return O(t.r, {
        l: O(t, { r: t.r.l }),
        lvl: o,
        r: O(e, {
          l: t.r.r,
          lvl: o - 1,
        }),
      })
    throw new Error('Unexpected empty nodes')
  }
  if (zt(e)) return qt(O(e, { lvl: o - 1 }))
  if (!E(n) && !E(n.l)) {
    const i = n.l,
      s = zt(i) ? n.lvl - 1 : n.lvl
    return O(i, {
      l: O(e, {
        lvl: o - 1,
        r: i.l,
      }),
      lvl: i.lvl + 1,
      r: qt(O(n, { l: i.r, lvl: s })),
    })
  }
  throw new Error('Unexpected empty nodes')
}
function Po(e) {
  return On(Ie(e))
}
function Cn(e, t, n) {
  if (E(e)) return []
  const o = be(e, t)[0]
  return On(Ut(e, o, n))
}
function Vn(e, t) {
  const n = e.length
  if (n === 0) return []
  let { index: o, value: i } = t(e[0])
  const s = []
  for (let l = 1; l < n; l++) {
    const { index: r, value: u } = t(e[l])
    ;(s.push({ end: r - 1, start: o, value: i }), (o = r), (i = u))
  }
  return (s.push({ end: Number.POSITIVE_INFINITY, start: o, value: i }), s)
}
function On(e) {
  return Vn(e, ({ k: t, v: n }) => ({ index: t, value: n }))
}
function qt(e) {
  const { r: t, lvl: n } = e
  return !E(t) && !E(t.r) && t.lvl === n && t.r.lvl === n ? O(t, { l: O(e, { r: t.l }), lvl: n + 1 }) : e
}
function Dn(e) {
  const { l: t } = e
  return !E(t) && t.lvl === e.lvl ? O(t, { r: O(e, { l: t.r }) }) : e
}
function $t(e, t, n, o = 0) {
  let i = e.length - 1
  for (; o <= i; ) {
    const s = Math.floor((o + i) / 2),
      l = e[s],
      r = n(l, t)
    if (r === 0) return s
    if (r === -1) {
      if (i - o < 2) return s - 1
      i = s - 1
    } else {
      if (i === o) return s
      o = s + 1
    }
  }
  throw new Error(`Failed binary finding record in array - ${e.join(',')}, searched for ${t}`)
}
function Bn(e, t, n) {
  return e[$t(e, t, n)]
}
function Wo(e, t, n, o) {
  const i = $t(e, t, o),
    s = $t(e, n, o, i)
  return e.slice(i, s + 1)
}
function cn({ index: e }, t) {
  return t === e ? 0 : t < e ? -1 : 1
}
function zo({ offset: e }, t) {
  return t === e ? 0 : t < e ? -1 : 1
}
function Yo(e) {
  return { index: e.index, value: e }
}
function Nn(e, t, n, o = 0) {
  return (o > 0 && (t = Math.max(t, Bn(e, o, cn).offset)), (t = Math.max(0, t)), Vn(Wo(e, t, n, zo), Yo))
}
const qe = [[], 0, 0, 0]
function jo(e, [t, n]) {
  let o = 0,
    i = 0,
    s = 0,
    l = 0
  if (n !== 0) {
    ;((l = $t(e, n - 1, cn)), (s = e[l].offset))
    const u = be(t, n - 1)
    ;((o = u[0]), (i = u[1]), e.length && e[l].height === be(t, n)[1] && (l -= 1), (e = e.slice(0, l + 1)))
  } else e = []
  for (const { start: r, value: u } of Cn(t, n, Number.POSITIVE_INFINITY)) {
    const a = (r - o) * i + s
    ;(e.push({ height: u, index: r, offset: a }), (o = r), (s = a), (i = u))
  }
  return [e, i, s, o]
}
function Ko(e) {
  const { size: t, startIndex: n, endIndex: o } = e
  return (i) => i.start === n && (i.end === o || i.end === Number.POSITIVE_INFINITY) && i.value === t
}
function Uo(e, t) {
  let n = E(e) ? 0 : Number.POSITIVE_INFINITY
  for (const o of t) {
    const { size: i, startIndex: s, endIndex: l } = o
    if (((n = Math.min(n, s)), E(e))) {
      e = U(e, 0, i)
      continue
    }
    const r = Cn(e, s - 1, l + 1)
    if (r.some(Ko(o))) continue
    let u = !1,
      a = !1
    for (const { start: I, end: f, value: p } of r)
      (u ? (l >= I || i === p) && (e = Kt(e, I)) : ((a = p !== i), (u = !0)), f > l && l >= I && p !== i && (e = U(e, l + 1, p)))
    a && (e = U(e, s, i))
  }
  return [e, n]
}
const Ge = [We(), 0]
function qo(e, [t, n]) {
  if (n.length > 0 && E(e) && t.length === 2) {
    const o = t[0].size,
      i = t[1].size
    return [n.reduce((s, l) => U(U(s, l, o), l + 1, i), We()), 0]
  }
  return Uo(e, t)
}
const me = y()
c([])
c([])
c(0)
c(null)
c(Number.NaN)
const Ce = c(!1),
  ee = c(Ge, (e) => {
    e.link(
      e.pipe(
        me,
        v((t) => t.length > 0),
        x(ne),
        g(([t, n]) => qo(n, [t, []]))
      ),
      ee
    )
  }),
  ne = c(Ge[0], (e) => {
    e.link(
      e.pipe(
        ee,
        g(([t]) => t)
      ),
      ne
    )
  }),
  Hn = c(Ge[1], (e) => {
    e.link(
      e.pipe(
        ee,
        g(([, t]) => t)
      ),
      Hn
    )
  }),
  Ve = c(qe[1]),
  le = c(qe[0]),
  tt = c(qe, (e) => {
    ;(e.link(
      e.pipe(
        ne,
        x(Hn),
        ae(([t], [n, o]) => jo(t, [n, o]), qe)
      ),
      tt
    ),
      e.link(
        e.pipe(
          tt,
          g(([, t]) => t)
        ),
        Ve
      ),
      e.link(
        e.pipe(
          tt,
          g(([t]) => t)
        ),
        le
      ))
  }),
  Fn = c(qe[2], (e) => {
    e.link(
      e.pipe(
        tt,
        g(([, , t]) => t)
      ),
      Fn
    )
  }),
  _n = c(qe[3], (e) => {
    e.link(
      e.pipe(
        tt,
        g(([, , , t]) => t)
      ),
      _n
    )
  }),
  Xe = c(0, (e) => {
    e.link(
      e.pipe(
        e.combine(Se, _n, Fn, Ve),
        g(([t, n, o, i]) => o + (t - n) * i)
      ),
      Xe
    )
  }),
  Go = 3,
  Zo = 5
function Lt(e, t) {
  const n = Xo() ? Zo : Go
  return Math.abs(e - t) <= n
}
function Pn() {
  return typeof navigator > 'u'
    ? !1
    : (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
        (/iP(ad|od|hone)/i.test(navigator.userAgent) && /WebKit/i.test(navigator.userAgent))
}
function Xo() {
  return typeof navigator > 'u'
    ? !1
    : /Safari/i.test(navigator.userAgent) &&
        /Apple Computer/i.test(navigator.vendor) &&
        !/(Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Opera|Android)/i.test(navigator.userAgent)
}
function Qo(e) {
  return !e
}
function Jo(e) {
  return e === 1 ? 1 : 1 - 2 ** (-10 * e)
}
function Ot(e = 1) {
  return (t, n) => {
    const o = n.signalInstance()
    return (
      n.sub(t, (i) => {
        let s = e
        function l() {
          s > 0 ? (s--, requestAnimationFrame(l)) : n.pub(o, i)
        }
        l()
      }),
      o
    )
  }
}
const Gt = 'up',
  Yt = 'down',
  ei = 'none',
  ti = {
    atBottom: !1,
    notAtBottomBecause: 'NOT_SHOWING_LAST_ITEM',
    state: {
      offsetBottom: 0,
      scrollTop: 0,
      viewportHeight: 0,
      viewportWidth: 0,
      scrollHeight: 0,
    },
  },
  ni = 0,
  oi = 4
function Sn(e) {
  return (t, n) => {
    const o = n.signalInstance()
    return (
      n.sub(t, (i) => {
        e > 0 ? e-- : n.pub(o, i)
      }),
      o
    )
  }
}
c(!1)
const Wn = c(!0)
y()
const ye = c(!1),
  ii = y((e) => {
    e.link(e.pipe(Wn, rn(50)), ii)
  }),
  zn = c(oi),
  si = c(ni, (e) => {
    e.link(
      e.pipe(
        e.combine(L, si),
        g(([t, n]) => t <= n)
      ),
      Wn
    )
  }),
  st = c(!1, (e) => {
    ;(e.link(e.pipe(L, Sn(1), K(!0)), st), e.link(e.pipe(L, Sn(1), K(!1), Ae(100)), st))
  }),
  Zt = c(!1, (e) => {
    ;(e.link(e.pipe(te, K(!0)), Zt), e.link(e.pipe(te, K(!1), Ae(200)), Zt))
  }),
  an = c(!1),
  xt = c(
    null,
    (e) => {
      ;(e.link(
        e.pipe(
          e.combine(F, L, oe, yt, zn, Vt, Bt, ne),
          v(([, , , , , , , t]) => !E(t)),
          ae((t, [n, o, i, s, l, r]) => {
            const a = o + i - n + r > -l,
              I = {
                viewportWidth: s,
                viewportHeight: i,
                scrollTop: o,
                scrollHeight: n,
                listMarginTop: r,
              }
            if (a) {
              let p, b
              return (
                o > t.state.scrollTop
                  ? ((p = 'SCROLLED_DOWN'), (b = t.state.scrollTop - o))
                  : ((p = n === i ? 'LIST_TOO_SHORT' : 'SIZE_DECREASED'), (b = t.state.scrollTop - o || t.scrollTopDelta)),
                {
                  atBottom: !0,
                  state: I,
                  atBottomBecause: p,
                  scrollTopDelta: b,
                }
              )
            }
            let f
            return (
              i < t.state.viewportHeight
                ? (f = 'VIEWPORT_HEIGHT_DECREASING')
                : s < t.state.viewportWidth
                  ? (f = 'VIEWPORT_WIDTH_DECREASING')
                  : o < t.state.scrollTop
                    ? (f = 'SCROLLING_UPWARDS')
                    : I.scrollHeight > t.state.scrollHeight || I.listMarginTop < t.state.listMarginTop
                      ? t.atBottom
                        ? (f = 'SIZE_INCREASED')
                        : (f = t.notAtBottomBecause)
                      : t.atBottom
                        ? (f = 'NOT_FULLY_SCROLLED_TO_LAST_ITEM_BOTTOM')
                        : (f = t.notAtBottomBecause),
              {
                atBottom: !1,
                notAtBottomBecause: f,
                state: I,
              }
            )
          }, ti)
        ),
        xt
      ),
        e.link(
          e.pipe(
            xt,
            ae(
              ({ prev: t }, n) => {
                const o = !!(t && n && t.atBottom && !n.atBottom && n.notAtBottomBecause === 'SIZE_INCREASED')
                return {
                  prev: n,
                  shouldScroll: o,
                }
              },
              { prev: null, shouldScroll: !1 }
            ),
            g(({ shouldScroll: t }) => t)
          ),
          an
        ),
        e.sub(
          e.pipe(
            oe,
            x(xt, dn, lt),
            v(([, , t, n]) => !t && !n),
            ae(
              (t, [n, o]) => {
                let i = 0
                return (
                  t.viewportHeight > n &&
                    o &&
                    !o.atBottom &&
                    o.notAtBottomBecause === 'VIEWPORT_HEIGHT_DECREASING' &&
                    (i = t.viewportHeight - n),
                  { viewportHeight: n, delta: i }
                )
              },
              { viewportHeight: 0, delta: 0 }
            )
          ),
          (t) => {
            t.delta && e.pub(te, t.delta)
          }
        ))
    },
    (e, t) =>
      !e || e.atBottom !== (t == null ? void 0 : t.atBottom)
        ? !1
        : !e.atBottom && !t.atBottom
          ? e.notAtBottomBecause === t.notAtBottomBecause
          : !0
  ),
  Yn = c(0, (e) => {
    e.link(
      e.pipe(
        e.combine(L, F, oe),
        ae(
          (t, [n, o, i]) => {
            if (!Lt(t.scrollHeight, o)) {
              const s = o - (n + i) < 1
              return t.scrollTop !== n && s
                ? {
                    scrollHeight: o,
                    scrollTop: n,
                    jump: t.scrollTop - n,
                    changed: !0,
                  }
                : {
                    scrollHeight: o,
                    scrollTop: n,
                    jump: 0,
                    changed: !0,
                  }
            }
            return {
              scrollTop: n,
              scrollHeight: o,
              jump: 0,
              changed: !1,
            }
          },
          { scrollHeight: 0, jump: 0, scrollTop: 0, changed: !1 }
        ),
        v((t) => t.changed),
        g((t) => t.jump)
      ),
      Yn
    )
  }),
  Rt = c(Yt, (e) => {
    ;(e.link(
      e.pipe(
        L,
        ae(
          (t, n) => {
            if (n < 0) return { direction: Gt, prevScrollTop: 0 }
            if (e.getValue(Zt)) return { direction: t.direction, prevScrollTop: n }
            const i = n === t.prevScrollTop && n === 0
            return {
              direction: n < t.prevScrollTop || i ? Gt : Yt,
              prevScrollTop: n,
            }
          },
          { direction: Yt, prevScrollTop: 0 }
        ),
        g((t) => t.direction)
      ),
      Rt
    ),
      e.link(e.pipe(L, Ae(100), K(ei)), Rt))
  }),
  kn = c(0, (e) => {
    ;(e.link(e.pipe(st, v(Qo), K(0)), kn),
      e.link(
        e.pipe(
          L,
          rn(100),
          x(st),
          v(([, t]) => !!t),
          ae(([, t], [n]) => [t, n], [0, 0]),
          g(([t, n]) => n - t)
        ),
        kn
      ))
  }),
  ie = c(!1),
  Le = c(!1),
  Xt = y((e) => {
    e.link(
      e.pipe(
        ve,
        g((n) => n.deviationDelta),
        v((n) => n !== 0)
      ),
      Xt
    )
    const t = e.pipe(
      Xt,
      x(Le),
      v(([, n]) => !n),
      g(([n]) => n)
    )
    Pn()
      ? (e.sub(e.pipe(t, x(J, L)), ([n, o]) => {
          e.pub(J, o - n)
        }),
        e.sub(e.pipe(e.combine(L, J, Ce, Le)), ([n, o, i, s]) => {
          i ||
            s ||
            (o > 0 && n < o
              ? (e.pub(ie, !0),
                e.pub(He, { top: 0, behavior: 'instant' }),
                setTimeout(() => {
                  e.pubIn({
                    [ie]: !1,
                    [J]: 0,
                  })
                }))
              : o < 0 &&
                n <= 0 &&
                (e.pubIn({
                  [ie]: !0,
                  [J]: 0,
                }),
                setTimeout(() => {
                  ;(e.pub(He, { top: 0, behavior: 'instant' }), e.pub(ie, !1))
                })))
        }),
        e.sub(
          e.pipe(
            e.combine(st, J, ie, Ce, Le),
            v(([n, o, i, s, l]) => !n && o !== 0 && !i && !s && !l),
            rn(100)
          ),
          ([, n]) => {
            ;(e.pub(ie, !0),
              n < 0
                ? requestAnimationFrame(() => {
                    ;(e.pub(te, -n),
                      e.pub(J, 0),
                      requestAnimationFrame(() => {
                        e.pub(ie, !1)
                      }))
                  })
                : requestAnimationFrame(() => {
                    ;(e.pub(te, -n),
                      e.pub(J, 0),
                      requestAnimationFrame(() => {
                        e.pub(ie, !1)
                      }))
                  }))
          }
        ))
      : e.link(t, te)
  })
function jn(e, t) {
  if (t.length === 0) return [0, 0]
  const { offset: n, index: o, height: i } = Bn(t, e, cn)
  return [i * (e - o) + n, i]
}
function Oe(e, t) {
  return jn(e, t)[0]
}
function fn(e, t) {
  if (typeof e == 'number')
    return {
      index: e,
      offset: 0,
      behavior: 'auto',
      align: 'start-no-overflow',
    }
  const n = {
    index: Number.NaN,
    align: e.align ?? 'start-no-overflow',
    behavior: e.behavior ?? 'auto',
    offset: e.offset ?? 0,
  }
  return (e.index === 'LAST' ? (n.index = t) : e.index < 0 ? (n.index = t + e.index) : (n.index = e.index), n)
}
function Kn({
  location: e,
  sizeTree: t,
  offsetTree: n,
  totalHeight: o,
  totalCount: i,
  viewportHeight: s,
  headerHeight: l,
  stickyHeaderHeight: r,
  stickyFooterHeight: u,
}) {
  const { align: a, behavior: I, offset: f, index: p } = fn(e, i - 1)
  function b() {
    const k = be(t, p)[1]
    if (k === void 0) throw new Error(`Item at index ${p} not found`)
    return k
  }
  s -= r + u
  let d = Oe(p, n) + l - r
  ;(a === 'end' ? (d = d - s + b()) : a === 'center' && (d = d - s / 2 + b() / 2), f && (d += f))
  let m = 0
  return (
    a === 'start' && (m = Math.max(0, Math.min(d - (o - s)))), (d = Math.max(0, d)), { top: d, behavior: I, align: a, forceBottomSpace: m }
  )
}
const et = c(null),
  li = c(!1),
  nt = c(!0),
  Qt = y((e) => {
    ;(e.link(
      e.pipe(
        Qt,
        g(() => !0)
      ),
      nt
    ),
      e.link(
        e.pipe(
          Qt,
          g(() => null)
        ),
        et
      ))
  }),
  Un = y((e) => {
    e.link(
      e.pipe(
        Un,
        x(Se, le, Fe),
        g(([t, n, o, i]) => {
          let { align: s, behavior: l, offset: r, index: u } = fn(t, n - 1)
          const a = typeof t != 'number' ? t.done : void 0,
            [I, f] = jn(u, o)
          return I < -i.listOffset
            ? ((typeof t == 'number' || t.align === void 0) && (s = 'start-no-overflow'),
              { index: u, align: s, behavior: l, offset: r, done: a })
            : I + f > -i.listOffset + i.visibleListHeight
              ? ((typeof t == 'number' || t.align === void 0) && (s = 'end'), { index: u, align: s, behavior: l, offset: r, done: a })
              : null
        }),
        v((t) => t !== null)
      ),
      // @ts-expect-error contra variance
      se
    )
  }),
  se = y((e) => {
    const t = e.pipe(
      se,
      x(ne, le, Se, oe, ft, Qe, at, Xe),
      g(([n, o, i, s, l, r, u, a, I]) => {
        try {
          return Kn({
            location: n,
            totalHeight: I,
            sizeTree: o,
            offsetTree: i,
            totalCount: s,
            viewportHeight: l,
            headerHeight: r,
            stickyHeaderHeight: u,
            stickyFooterHeight: a,
          })
        } catch {
          return null
        }
      }),
      v((n) => n !== null)
    )
    ;(e.link(se, et),
      e.link(t, He),
      e.link(
        e.pipe(
          se,
          v((n) => typeof n != 'number' && n.index === 'LAST'),
          K(!0)
        ),
        ye
      ),
      e.link(e.pipe(t, K(!1)), nt),
      e.link(e.pipe(t, K(!1)), li),
      e.link(
        e.pipe(
          ne,
          // wait for the list to render with the specified sizeTree, so that enough space is available to scroll by
          Ae(0),
          x(nt, et),
          v(([, n, o]) => !n && o !== null),
          g(([, , n]) => n)
        ),
        se
      ),
      e.sub(e.pipe(Me, Ae(10)), () => {
        const n = e.getValue(et)
        ;(n !== null && typeof n != 'number' && n.done !== void 0 && n.done(),
          e.pubIn({
            [et]: null,
            [nt]: !0,
          }))
      }),
      e.link(
        e.pipe(
          wt,
          // wait for the list to render with the specified scrollOffset, so that enough space is available to scroll by
          it(),
          v((n) => n !== 0)
        ),
        te
      ),
      e.link(
        e.pipe(
          wt,
          wn(L),
          g(() => 0)
        ),
        wt
      ))
  }),
  Re = c(null),
  De = c(
    null,
    (e) => {
      e.link(
        e.pipe(
          De,
          v((n) => n !== null)
        ),
        Re
      )
      const t = e.pipe(
        e.combine(De, ne),
        x(Re),
        v(([[n, o], i]) => n !== null && !E(o) && i !== null),
        g(([[n]]) => n)
      )
      ;(e.link(e.pipe(t, it()), se),
        e.link(
          e.pipe(
            t,
            wn(
              e.pipe(
                nt,
                v((n) => n)
              )
            ),
            K(null)
            // unset the location after the scroll completes
          ),
          Re
        ))
    },
    !1
  )
function ri(e, t) {
  return [
    {
      data: t == null ? void 0 : t[e],
      prevData: (t == null ? void 0 : t[e - 1]) ?? null,
      nextData: (t == null ? void 0 : t[e + 1]) ?? null,
      height: 0,
      index: e,
      offset: 0,
      type: 'flat',
    },
  ]
}
const ui = [],
  we = {
    items: ui,
    listBottom: 0,
    listTop: 0,
    offsetTree: [],
    paddingBottom: 0,
    paddingTop: 0,
    totalCount: 0,
    totalHeight: 0,
    deviationDelta: 0,
    visibleListHeight: 0,
    data: null,
  },
  Jt = c(!1),
  ve = c(we, (e) => {
    e.link(
      e.pipe(
        e.combine(ai, Jn, ne, le, Se, Xe, S, wt, De, Re, ct, Qe, at, J, Jt, Ce, ie),
        v((t) => {
          const n = t.at(-1),
            o = t.at(-2),
            i = t.at(-3)
          return !o && !n && !i
        }),
        ae((t, [n, o, i, s, l, r, u, a, I, f, p, b, d, m]) => {
          var ke
          if ((u == null ? void 0 : u.length) === 0) return we
          if (E(i)) {
            let Q = 0
            return (I !== null && (Q = fn(I, l - 1).index), { ...we, items: ri(Q, u), offsetTree: s, totalCount: l, data: u })
          }
          let k = 0
          f !== null &&
            n === 0 &&
            (k =
              Kn({
                totalHeight: r,
                location: f,
                sizeTree: i,
                offsetTree: s,
                totalCount: l,
                viewportHeight: e.getValue(oe),
                headerHeight: e.getValue(ft),
                stickyHeaderHeight: b,
                stickyFooterHeight: d,
              }).top ?? 0)
          let D = 0
          e.getValue(L) !== 0 &&
            !e.getValue(Dt) &&
            e.getValue(Rt) === Gt &&
            t.totalCount === l &&
            t.items.length > 0 &&
            ((D = r - t.totalHeight), D !== 0 && (D += e.getValue(Yn)))
          const V = e.getValue(Zn),
            B = Math.min(Math.max(n + k + a - m - p + D - V, 0), r - o),
            _ = B + o + V * 2
          if (t.offsetTree === s && t.totalCount === l && t.data === u && B >= t.listTop && _ <= t.listBottom) return t
          const N = [],
            q = l - 1,
            G = 0,
            P = Nn(s, B, _, G)
          let R = 0,
            M = 0,
            X = !1
          for (const Q of P) {
            const {
              value: { offset: Ee, height: re },
            } = Q
            let ue = Q.start
            ;((R = Ee),
              Ee < B && ((ue += Math.floor((B - Ee) / re)), (R += (ue - Q.start) * re)),
              ue < G && ((R += (G - ue) * re), (ue = G)))
            const Ft = Math.min(Q.end, q)
            for (let pe = ue; pe <= Ft && !(R >= _); pe++) {
              if (Math.min(R + re, _) - Math.max(R, B) < 1) {
                R += re
                continue
              }
              const pt = {
                data: u == null ? void 0 : u[pe],
                prevData: (u == null ? void 0 : u[pe - 1]) ?? null,
                nextData: (u == null ? void 0 : u[pe + 1]) ?? null,
                height: re,
                index: pe,
                offset: R,
                type: 'flat',
              }
              ;(X || ((X = !0), (M = R)), N.push(pt), (R += re))
            }
          }
          if (N.length === 0) M = R = 0
          else {
            const Q = N[N.length - 1]
            R = Q.offset + Q.height
          }
          const A = r - R,
            fe = ((ke = N[0]) == null ? void 0 : ke.offset) || 0
          return {
            items: N,
            listBottom: R,
            listTop: M,
            offsetTree: s,
            paddingBottom: A,
            paddingTop: fe,
            totalCount: l,
            totalHeight: r,
            data: u,
            deviationDelta: D,
            visibleListHeight: o,
          }
        }, we)
      ),
      ve
    )
  }),
  Mt = Pe([], (e) =>
    e.pipe(
      e.combine(ve, L),
      g(([t, n]) => {
        const o = t.items.slice()
        for (; o.length > 0 && o[0].offset + o[0].height < n; ) o.shift()
        return o.map((i) => i.data)
      })
    )
  )
function ci(e, t) {
  var l, r
  const n = t.slice()
  let o = 0
  const i = []
  for (const { k: u, v: a } of Ie(e)) {
    for (; n.length && n[0] < u; ) (n.shift(), o++)
    const I = Math.max(0, u - o),
      f = ((l = i.at(-1)) == null ? void 0 : l.k) ?? -1
    I === f ? ((((r = i.at(-2)) == null ? void 0 : r.v) ?? -1) === a ? i.pop() : (i[i.length - 1].v = a)) : i.push({ k: I, v: a })
  }
  let s = We()
  for (const { k: u, v: a } of i) s = U(s, u, a)
  return s
}
const Se = c(0),
  Be = c(null),
  S = c(null, (e) => {
    e.link(
      e.pipe(
        S,
        v((t) => t !== null),
        g((t) => t.length)
      ),
      Se
    )
  }),
  St = c(null)
function En(e, t) {
  function n() {
    ;(e.pubIn({
      [J]: 0,
      [nn]: 0,
      [Jt]: !1,
      [Tt]: null,
    }),
      e.pub(Le, !1))
  }
  ;(e.pubIn({
    [Jt]: !0,
    [St]: null,
  }),
    requestAnimationFrame(() => {
      ;(e.pubIn({
        [te]: t,
        [nn]: t,
      }),
        requestAnimationFrame(n))
    }))
}
const ce = y((e) => {
    ;(e.link(
      e.pipe(
        ce,
        x(Ve),
        g(([t, n]) => -n * t.length)
      ),
      J
    ),
      e.link(e.pipe(ce, K(!0)), Le),
      e.link(e.pipe(ce, it()), St),
      e.sub(
        e.pipe(
          le,
          x(St),
          v(([, t]) => t !== null),
          g(([t, n]) => {
            if (n === null) throw new Error('Unexpected null items')
            return Oe(n.length, t)
          })
        ),
        (t) => {
          En(e, t)
        }
      ),
      e.sub(
        e.pipe(
          ce,
          Ot(2),
          x(le, St),
          v(([, , t]) => t !== null),
          g(([t, n]) => Oe(t.length, n))
        ),
        (t) => {
          En(e, t)
        }
      ),
      e.changeWith(S, ce, (t, n) => (t ? [...n, ...t] : n.slice())),
      e.link(
        e.pipe(
          ce,
          x(ne, Ve),
          g(([t, n, o]) => {
            const i = t.length,
              s = o
            return Ie(n).reduce(
              (r, { k: u, v: a }) => ({
                ranges: [...r.ranges, { startIndex: r.prevIndex, endIndex: u + i - 1, size: r.prevSize }],
                prevIndex: u + i,
                prevSize: a,
              }),
              {
                ranges: [],
                prevIndex: 0,
                prevSize: s,
              }
            ).ranges
          })
        ),
        me
      ))
  }),
  ut = y((e) => {
    const t = e.pipe(
      ut,
      x(Fe, $e, Be),
      g(([{ data: o, scrollToBottom: i, atBottom: s }, l, r, u]) => {
        if (i === !1 || i === void 0) return null
        let a = 'auto'
        const I = s ?? l.isAtBottom
        if (typeof i == 'function') {
          const f = i({ data: o, scrollLocation: l, scrollInProgress: r, context: u, atBottom: I })
          if (!f) return null
          if (typeof f == 'object') return f
          if (typeof f == 'number') return { index: f, align: 'end', behavior: 'auto' }
          a = f
        } else {
          if (!I) return null
          a = i
        }
        return (a === !0 && (a = 'auto'), { index: 'LAST', align: 'end', behavior: a })
      })
    )
    ;(e.link(
      e.pipe(
        t,
        v((o) => o !== null),
        g(() => !0)
      ),
      ye
    ),
      e.link(
        e.pipe(
          Me,
          x(ye),
          v(([o, i]) => i),
          g(() => !1)
        ),
        ye
      ))
    const n = e.pipe(
      gn,
      x(ye),
      v(([o, i]) => o === 'up' && i)
    )
    ;(e.link(
      e.pipe(
        n,
        g(() => !1)
      ),
      ye
    ),
      e.link(e.pipe(n, K(!0)), Qt),
      e.link(
        e.pipe(
          t,
          x(ne),
          v(([o, i]) => o !== null && E(i)),
          g(([o]) => o)
        ),
        De
      ),
      e.link(
        e.pipe(
          t,
          x(ne),
          v(([o, i]) => o !== null && !E(i)),
          g(([o]) => o),
          Ae(20)
        ),
        se
      ))
  }),
  At = y((e) => {
    ;(e.changeWith(S, At, (t, n) => (t ? [...t, ...n.data] : n.data.slice())), e.link(At, ut))
  }),
  kt = y((e) => {
    ;(e.changeWith(S, kt, (t, n) => (t ? [...t.slice(0, n.offset), ...n.data, ...t.slice(n.offset)] : n.data.slice())),
      e.changeWith(ee, kt, ([t], n) => {
        const i = be(t, n.offset, 'k')[0],
          s = n.data.length
        return [Fo(t, i, Number.POSITIVE_INFINITY, (r, u) => [r + s, u]), i]
      }),
      e.link(
        e.pipe(
          kt,
          g(({ data: t, scrollToBottom: n }) => ({ data: t, scrollToBottom: n }))
        ),
        ut
      ))
  }),
  en = y((e) => {
    ;(e.changeWith(S, en, (t, { offset: n, count: o }) => (t ? t.slice(0, n).concat(t.slice(n + o)) : [])),
      e.changeWith(ee, en, ([t], { offset: n, count: o }) => [_o(t, n, o), n]))
  }),
  jt = c(null),
  Ke = y((e) => {
    ;(e.sub(
      e.pipe(
        Ke,
        x(S),
        v(([{ data: t, purgeItemSizes: n }, o]) => t.length === 0 || !!n || o === null || o.length === 0)
      ),
      ([t, n]) => {
        n === null || n.length === 0
          ? e.pubIn({
              ...(t.initialLocation ? { [De]: t.initialLocation } : {}),
              [ot]: 0,
              ...(t.data.length === 0
                ? {
                    [ee]: Ge,
                    [ve]: we,
                  }
                : {}),
              [S]: t.data.slice(),
            })
          : e.pubIn({
              ...(t.initialLocation ? { [De]: t.initialLocation } : {}),
              [ot]: 0,
              [ee]: Ge,
              [ve]: we,
              [jt]: t.data.slice(),
            })
      }
    ),
      e.sub(
        e.pipe(
          no,
          x(jt),
          Ot(),
          v(([, t]) => t !== null)
        ),
        ([, t]) => {
          e.pubIn({
            [S]: t,
            [jt]: null,
          })
        }
      ),
      e.link(
        e.pipe(
          Ke,
          v(({ data: t, purgeItemSizes: n }) => t.length > 0 && !n),
          x(Ve),
          v(([, t]) => t > 0),
          g(([{ data: t }, n]) => [
            {
              size: n,
              startIndex: t.length,
              endIndex: Number.POSITIVE_INFINITY,
            },
          ])
        ),
        me
      ),
      e.sub(
        e.pipe(
          Ke,
          v(({ data: t, purgeItemSizes: n }) => t.length > 0 && !n)
        ),
        ({ data: t, initialLocation: n, suppressItemMeasure: o }) => {
          ;(e.pub(ot, 0),
            requestAnimationFrame(() => {
              ;(o || e.pub(to),
                requestAnimationFrame(() => {
                  n &&
                    e.pubIn({
                      [se]: n,
                    })
                }))
            }),
            e.pubIn({
              [S]: t.slice(),
            }))
        }
      ))
  }),
  Et = y((e) => {
    ;(e.link(
      e.pipe(
        Et,
        x(le),
        g(([t, n]) => -Oe(t, n))
      ),
      te
    ),
      e.changeWith(S, e.pipe(Et, it()), (t, n) => (t ? t.slice(n) : [])),
      e.changeWith(ee, e.pipe(Et, it()), ([t], n) => [Ie(t).reduce((i, { k: s, v: l }) => U(i, Math.max(0, s - n), l), We()), 0]))
  }),
  Tn = y((e) => {
    ;(e.changeWith(S, Tn, (t, n) => (t ? t.slice(0, t.length - n) : [])),
      e.link(
        e.pipe(
          Tn,
          x(Se, Ve),
          g(([, t, n]) => [
            {
              size: n,
              startIndex: t,
              endIndex: Number.POSITIVE_INFINITY,
            },
          ])
        ),
        me
      ))
  }),
  qn = y((e) => {
    const t = e.pipe(
      qn,
      x(S),
      g(([n, o]) => {
        if (!o) return []
        const i = []
        return (
          o.forEach((s, l) => {
            n(s, l) && i.push(l)
          }),
          i
        )
      })
    )
    ;(e.changeWith(S, t, (n, o) => (n ? n.filter((i, s) => !o.includes(s)) : [])), e.changeWith(ee, t, ([n], o) => [ci(n, o), 0]))
  }),
  Tt = c(null),
  je = y((e) => {
    ;(e.changeWith(S, je, (t, { mapper: n }) => (t ? t.map(n) : [])),
      e.link(
        e.pipe(
          je,
          v(({ anchorItemIndex: t }) => t !== void 0),
          K(!0)
        ),
        Le
      ),
      e.link(
        e.pipe(
          je,
          v(({ anchorItemIndex: t }) => t !== void 0),
          x(le),
          g(([{ anchorItemIndex: t }, n]) => {
            const o = t
            return {
              oldOffset: Oe(o, n),
              index: o,
            }
          })
        ),
        Tt
      ),
      e.sub(
        e.pipe(
          le,
          x(Tt),
          v(([, t]) => t !== null),
          g(([t, n]) => Oe(n.index, t) - n.oldOffset)
        ),
        (t) => {
          e.pubIn({
            [Le]: !1,
            [Tt]: null,
            [te]: t,
          })
        }
      ),
      e.link(
        e.pipe(
          je,
          Ot(3),
          x(an),
          v(([{ autoscrollToBottomBehavior: t }, n]) => n && !!t),
          g(([{ autoscrollToBottomBehavior: t }]) => (typeof t == 'object' ? t.location() : { index: 'LAST', align: 'end', behavior: t })),
          v((t) => !!t)
        ),
        se
      ))
  }),
  Ct = y((e) => {
    ;(e.changeWith(S, Ct, (t, { newData: n }) => n),
      e.link(
        e.pipe(
          Ct,
          Ot(3),
          x(an),
          v(([{ autoscrollToBottomBehavior: t }, n]) => n && !!t),
          g(([{ autoscrollToBottomBehavior: t }]) => (typeof t == 'object' ? t.location() : { index: 'LAST', align: 'end', behavior: t })),
          v((t) => !!t)
        ),
        se
      ))
  }),
  Dt = y(),
  $e = c(!1),
  Me = y((e) => {
    e.link(e.pipe(Me, K(!1)), Dt)
  }, !1),
  L = c(0),
  oe = c(0),
  yt = c(0),
  F = c(0),
  ai = L,
  wt = c(0),
  Qe = c(0),
  ct = c(0),
  at = c(0),
  pn = c(0),
  Ne = c(null),
  Gn = un(),
  Zn = c(0),
  Xn = c(!1),
  fi = Jo,
  pi = 50,
  ft = Pe(0, (e) =>
    e.pipe(
      e.combine(Qe, ct),
      g(([t, n]) => t + n)
    )
  ),
  Qn = Pe(0, (e) =>
    e.pipe(
      e.combine(at, pn),
      g(([t, n]) => t + n)
    )
  ),
  hi = Pe(0, (e) =>
    e.pipe(
      e.combine(Qe, ct, L),
      g(([t, n, o]) => t + Math.max(n - o, 0))
    )
  ),
  gi = Pe(0, (e) =>
    e.pipe(
      e.combine(at, pn, L, oe, F),
      g(([t, n, o, i, s]) => {
        o = Math.min(o, s - i)
        const l = Math.max(n - (s - (o + i)), 0)
        return t + l
      })
    )
  ),
  Jn = Pe(0, (e) =>
    e.pipe(
      e.combine(oe, hi, gi),
      g(([t, n, o]) => Math.max(0, t - n - o))
    )
  ),
  Bt = c(0),
  ot = c(0, (e) => {
    e.link(
      e.pipe(
        e.combine(ot, Xe, oe, ft, Qe),
        g(([t, n, o, i, s]) => (t === 0 ? 0 : Math.max(0, Math.min(t - (n + i + s - o)))))
      ),
      Bt
    )
  }),
  He = y((e) => {
    ;(e.link(
      e.pipe(
        He,
        g((t) => (t.align === 'start' ? (t.top ?? 0) : 0))
      ),
      ot
    ),
      e.link(
        e.pipe(
          He,
          x(L),
          v(([t, n]) => t.top !== n),
          K(!0)
        ),
        Dt
      ))
  }),
  hn = y((e) => {
    e.link(
      e.pipe(
        He,
        x(rt),
        g(([t, n]) => ('top' in t && typeof t.top < 'u' && (t = { ...t, top: t.top + n }), t))
      ),
      hn
    )
  }),
  Fe = Pe(
    {
      listOffset: 0,
      visibleListHeight: 0,
      scrollHeight: 0,
      bottomOffset: 0,
      isAtBottom: !1,
      lastVisibleItemIndex: 0,
      lastItemBottomOffset: 0,
    },
    (e) =>
      e.pipe(
        e.combine(L, ft, Qn, ct, Jn, F, Bt, Ce, Re, ie, ye),
        v(([, , , , , , , t, n, o]) => !t && n === null && !o),
        g(([t, n, o, i, s, l, r, u, a, I, f]) => {
          const p = e.getValue(zn),
            b = l - n - o,
            d = -t + i,
            m = b + Math.min(0, d) - s - r
          let k = 0,
            D = 0
          const V = e.getValue(le),
            B = e.getValue(Se)
          if (B > 0 && V.length > 0) {
            const _ = t - i + s,
              N = Nn(V, Math.max(0, _ - 1), _)
            if (N.length > 0) {
              const q = N[N.length - 1],
                { offset: G, height: P } = q.value,
                R = Math.min(q.start + Math.floor((_ - G) / P), q.end)
              k = Math.min(R, B - 1)
              const M = G + (R - q.start + 1) * P
              D = _ - M
            }
          }
          return {
            scrollHeight: b,
            listOffset: d,
            visibleListHeight: s,
            bottomOffset: m,
            isAtBottom: f || m <= p,
            lastVisibleItemIndex: k,
            lastItemBottomOffset: D,
          }
        })
      )
  ),
  tn = y((e) => {
    e.link(
      e.pipe(
        L,
        Ae(0),
        x(Fe, Re, Ce),
        v(([, t, n, o]) => t.scrollHeight > 0 && n == null && !o),
        g(([, t]) => t)
      ),
      tn
    )
  }),
  te = y(),
  J = c(0),
  nn = c(0),
  Vt = c(0),
  eo = c(''),
  gn = y(),
  to = un(),
  no = un(),
  dn = c(!1),
  lt = c(null)
c(0)
const rt = c(0, (e) => {
    e.link(
      e.pipe(
        e.combine(Ze, xe, rt),
        g(([t, n, o]) => t - Math.max(0, o - n))
      ),
      oe
    )
  }),
  xe = c(0, (e) => {
    e.link(
      e.pipe(
        e.combine(xe, rt),
        g(([t, n]) => Math.max(0, t - n))
      ),
      L
    )
  }),
  Ze = c(0)
function di(e, t, n) {
  if (n === !1 || n === void 0) return
  const o = e.getValue(Fe),
    i = o.isAtBottom,
    s = e.getValue($e),
    l = e.getValue(Be)
  let r
  if (typeof n == 'function') r = n({ atBottom: i, context: l, data: t, scrollInProgress: s, scrollLocation: o })
  else {
    if (!i) return
    r = n
  }
  if (r)
    return typeof r == 'object'
      ? { location: () => r }
      : typeof r == 'number'
        ? { location: () => ({ index: r, align: 'end', behavior: 'auto' }) }
        : r === !0
          ? 'auto'
          : r
}
function oo(e) {
  return {
    data: {
      prepend: (t) => {
        e.pub(ce, t)
      },
      append: (t, n) => {
        e.pub(At, {
          data: t,
          scrollToBottom: n,
        })
      },
      replace: (t, n) => {
        e.pub(Ke, {
          ...n,
          data: t,
        })
      },
      map: (t, n) => {
        e.pub(je, {
          mapper: t,
          autoscrollToBottomBehavior: n,
        })
      },
      mapWithAnchor: (t, n) => {
        e.pub(je, {
          mapper: t,
          anchorItemIndex: n,
        })
      },
      findAndDelete: (t) => {
        e.pub(qn, t)
      },
      findIndex: (t) => e.getValue(S).findIndex(t),
      find: (t) => e.getValue(S).find(t),
      insert: (t, n, o) => {
        e.pub(kt, {
          data: t,
          offset: n,
          scrollToBottom: o,
        })
      },
      deleteRange: (t, n) => {
        e.pub(en, {
          offset: t,
          count: n,
        })
      },
      batch: (t, n) => {
        const o = e.getValue(S),
          i = ((o == null ? void 0 : o.length) ?? 0) === 0 || e.getValue(Fe).isAtBottom
        ;(e.pub(Ce, !0), t(), e.pub(Ce, !1), e.pub(ut, { data: [], scrollToBottom: n, atBottom: i }))
      },
      get: () => e.getValue(S).slice(),
      getCurrentlyRendered: () => e.getValue(Mt),
      removeFromStart: (t) => {
        e.pub(Et, t)
      },
    },
    scrollToItem: (t) => {
      e.pub(se, t)
    },
    scrollIntoView: (t) => {
      e.pub(Un, t)
    },
    scrollerElement: () => e.getValue(Ne),
    getScrollLocation() {
      return e.getValue(Fe)
    },
    cancelSmoothScroll() {
      e.pub(Gn)
    },
    notifyItemsChanged({ scrollToBottom: t }) {
      const n = e.getValue(S) ?? []
      e.pub(Ct, {
        newData: n,
        autoscrollToBottomBehavior: di(e, n, t),
      })
    },
    height: (t) => {
      var i
      const n = ((i = e.getValue(S)) == null ? void 0 : i.indexOf(t)) ?? -1
      if (n === -1) return 0
      const o = e.getValue(ne)
      return be(o, n)[1] ?? 0
    },
  }
}
function Zi() {
  return C(Fe)
}
function Xi() {
  return C(Mt)
}
function Qi() {
  const e = _e()
  return h.useMemo(() => oo(e), [e])
}
const Ji = {
  prepend: 'prepend',
  removeFromStart: 'remove-from-start',
  removeFromEnd: 'remove-from-end',
}
function es({ atBottom: e, scrollInProgress: t }) {
  return e || t ? 'smooth' : !1
}
function ts({ atBottom: e, scrollInProgress: t }) {
  return {
    index: 'LAST',
    align: 'end',
    behavior: e || t ? 'smooth' : 'auto',
  }
}
const io = c(null),
  so = c(null),
  lo = c(null),
  ro = c(null),
  uo = c(null),
  co = c('div'),
  mi = {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  bt = {
    overflowAnchor: 'none',
  },
  bi = {
    position: 'sticky',
    bottom: 0,
  },
  ao = h.forwardRef((e, t) => /* @__PURE__ */ w('div', { style: { zIndex: 1 }, ...e, ref: t })),
  fo = h.forwardRef((e, t) => /* @__PURE__ */ w('div', { ...e, ref: t })),
  po = h.forwardRef(({ style: e, ...t }, n) => /* @__PURE__ */ w('div', { ...t, style: { ...mi, ...e }, ref: n })),
  ho = h.forwardRef(({ style: e, ...t }, n) => /* @__PURE__ */ w('div', { ...t, style: { ...bi, ...e }, ref: n })),
  go = c(ao),
  mo = c(po),
  bo = c(fo),
  Io = c(ho),
  vo = ({ index: e }) => /* @__PURE__ */ Ln('div', { children: ['Item ', e] }),
  xo = ({ index: e }) => e,
  on = c(vo),
  So = c(xo),
  ko = (e) => e,
  sn = c(ko),
  Eo = c(
    null,
    (e) => {
      e.sub(e.pipe(Eo, x(S, sn, le, ee)), ([t, n, o, i, s]) => {
        if (t === void 0) return
        if (!t || !t.data || !t.data.length) {
          e.pubIn({
            [S]: [],
            [ee]: Ge,
            [ve]: we,
          })
          return
        }
        const l = t.data,
          r = t.scrollModifier
        if (r === 'prepend') {
          if (n === null || !n.length) {
            e.pub(S, l)
            return
          }
          const u = n[0],
            a = l.findIndex((p) => o(p) === o(u)),
            I = a === -1 ? l : l.slice(0, a),
            f = a === -1 ? [] : l.slice(a)
          ;(e.pubIn({
            [S]: f,
          }),
            e.pubIn({
              [ce]: I,
            }))
          return
        }
        if (r === 'remove-from-start') {
          const u = l[0],
            a = (n == null ? void 0 : n.findIndex((f) => o(f) === o(u))) ?? -1
          if (a === -1) {
            e.pub(S, l)
            return
          }
          const I = Oe(a, i)
          ;(e.pub(te, -I),
            queueMicrotask(() => {
              e.pub(S, l)
              const f = Ie(s[0]).reduce((p, { k: b, v: d }) => U(p, Math.max(0, b - a), d), We())
              e.pub(ee, [f, 0])
            }))
          return
        }
        if (r === 'remove-from-end') {
          ;(e.pub(S, l),
            e.pub(me, [
              {
                size: e.getValue(Ve),
                startIndex: l.length,
                endIndex: Number.POSITIVE_INFINITY,
              },
            ]))
          return
        }
        if ((r == null ? void 0 : r.type) === 'item-location') {
          l !== n &&
            e.pubIn({
              [Ke]: {
                data: l,
                initialLocation: r.location,
                purgeItemSizes: r.purgeItemSizes,
              },
            })
          return
        }
        if ((r == null ? void 0 : r.type) === 'auto-scroll-to-bottom') {
          e.pubIn({
            [S]: l,
            [ut]: {
              data: l,
              scrollToBottom: r.autoScroll,
            },
          })
          return
        }
        if ((r == null ? void 0 : r.type) === 'items-change') {
          e.pub(Ct, {
            newData: l,
            autoscrollToBottomBehavior: r.behavior,
          })
          return
        }
        e.pub(S, l)
      })
    },
    (e, t) => (e ? e.data === (t == null ? void 0 : t.data) : !1)
  ),
  Ii = ({ item: e, ItemContent: t, mount: n, unmount: o }) => {
    const i = C(Be),
      s = h.useRef(null),
      l = h.useCallback(
        (r) => {
          r ? ((s.current = r), n(r)) : s.current && (o(s.current), (s.current = null))
        },
        [n, o]
      )
    return /* @__PURE__ */ w('div', {
      ref: l,
      'data-index': e.index,
      'data-known-size': e.height,
      style: {
        overflowAnchor: 'none',
        position: 'absolute',
        width: '100%',
        top: e.offset,
      },
      children: /* @__PURE__ */ w(t, { index: e.index, prevData: e.prevData, nextData: e.nextData, data: e.data, context: i }),
    })
  },
  vi = h.memo(Ii, (e, t) => {
    const n = e.item,
      o = t.item
    return (
      n.index === o.index &&
      n.height === o.height &&
      n.offset === o.offset &&
      n.data === o.data &&
      n.prevData === o.prevData &&
      n.nextData === o.nextData &&
      e.ItemContent === t.ItemContent
    )
  }),
  ln = c('top', (e) => {
    ;(e.link(
      e.pipe(
        e.combine(ln, Xe, oe, ft, Qn),
        v(([t]) => t === 'bottom' || t === 'bottom-smooth'),
        g(([, t, n, o, i]) => Math.max(0, n - t - o - i))
      ),
      Vt
    ),
      e.link(
        e.pipe(
          e.combine(Vt, ln),
          v(([, t]) => t === 'bottom-smooth'),
          ae((t, [n]) => [t[1], n], [0, 0]),
          g(([t, n]) => (t > 0 && n > 0 ? 'margin-top 0.2s ease-out' : ''))
        ),
        eo
      ))
  })
function It(e) {
  const t = h.useRef(null)
  return [
    h.useCallback(
      (o) => {
        o
          ? ((t.current = o), e == null || e.observe(o, { box: 'border-box' }))
          : t.current && (e == null || e.unobserve(t.current), (t.current = null))
      },
      [e]
    ),
    t,
  ]
}
function xi(e, t, n, o, i) {
  const s = _e(),
    l = h.useRef(null),
    r = h.useRef(null),
    u = h.useCallback(
      (p = !1) => {
        ;(l.current && (cancelAnimationFrame(l.current), (l.current = null), (r.current = null)),
          (o.current = !1),
          p && n.current !== null && ((n.current = null), s.pub($e, !1)))
      },
      [s, o, n]
    )
  ;(h.useEffect(
    () =>
      s.sub(gn, (p) => {
        p !== r.current && u(!0)
      }),
    [s, u]
  ),
    h.useEffect(() => s.sub(Gn, () => u(!0)), [s, u]))
  const a = h.useCallback(
      (p, b, d) => {
        var B
        l.current && u()
        const m = ((B = e.current) == null ? void 0 : B.scrollTop) ?? 0
        ;((r.current = m < p ? 'down' : 'up'), (o.current = !0))
        let k = 0,
          D = 0
        function V() {
          var N, q
          const _ = m + (p - m) * b(k)
          ;((N = e.current) == null || N.scrollTo({ top: _, behavior: 'instant' }),
            (k += 1 / d),
            (D += 1),
            D < d
              ? (s.pub(i, _), (l.current = requestAnimationFrame(V)))
              : ((q = e.current) == null || q.scrollTo({ top: p, behavior: 'instant' }),
                (l.current = null),
                (r.current = null),
                (o.current = !1),
                (n.current = null),
                s.pub(i, p),
                s.pub($e, !1),
                s.pub(Me, p)))
        }
        V()
      },
      [e, u, o, n, s, i]
    ),
    I = h.useCallback(
      (p) => {
        const b = e.current
        if (b === null || n.current !== p) return
        const d = b.scrollHeight - b.clientHeight
        Lt(b.scrollTop, Math.min(d, p)) && ((n.current = null), s.pub(i, b.scrollTop), s.pub($e, !1), s.pub(Me, b.scrollTop))
      },
      [s, e, n, i]
    )
  return h.useCallback(
    (p) => {
      var k, D
      const b = e.current
      if (!b || p.top === void 0) return
      const d = b.scrollHeight - b.clientHeight,
        m = Math.max(0, Math.min(p.top, d))
      if (Lt(m, b.scrollTop) || b.scrollHeight <= b.clientHeight) {
        requestAnimationFrame(() => {
          var V
          s.pub(Me, (V = e.current) == null ? void 0 : V.scrollTop)
        })
        return
      }
      if (
        ((n.current = m),
        s.pub($e, !0),
        p.forceBottomSpace !== void 0 && t.current && (t.current.style.paddingBottom = `${p.forceBottomSpace}px`),
        p.behavior === 'smooth')
      )
        a(m ?? 0, fi, pi)
      else if (p.behavior === 'auto' || p.behavior === 'instant' || p.behavior === void 0)
        (u(), (k = e.current) == null || k.scrollTo(p), requestAnimationFrame(() => I(m)))
      else {
        const { easing: V, animationFrameCount: B } = p.behavior(((D = e.current) == null ? void 0 : D.scrollTop) ?? 0, m ?? 0)
        a(m ?? 0, V, B)
      }
    },
    [s, a, t, e, n, u, I]
  )
}
function Si(e) {
  return ki(Ti(yi(Ei(e), 8 * e.length))).toLowerCase()
}
function ki(e) {
  for (var t, n = '0123456789ABCDEF', o = '', i = 0; i < e.length; i++)
    ((t = e.charCodeAt(i)), (o += n.charAt((t >>> 4) & 15) + n.charAt(15 & t)))
  return o
}
function Ei(e) {
  for (var t = Array(e.length >> 2), n = 0; n < t.length; n++) t[n] = 0
  for (n = 0; n < 8 * e.length; n += 8) t[n >> 5] |= (255 & e.charCodeAt(n / 8)) << (n % 32)
  return t
}
function Ti(e) {
  for (var t = '', n = 0; n < 32 * e.length; n += 8) t += String.fromCharCode((e[n >> 5] >>> (n % 32)) & 255)
  return t
}
function yi(e, t) {
  ;((e[t >> 5] |= 128 << (t % 32)), (e[14 + (((t + 64) >>> 9) << 4)] = t))
  for (var n = 1732584193, o = -271733879, i = -1732584194, s = 271733878, l = 0; l < e.length; l += 16) {
    const r = n,
      u = o,
      a = i,
      I = s
    ;((o = j(
      (o = j(
        (o = j(
          (o = j(
            (o = Y(
              (o = Y(
                (o = Y(
                  (o = Y(
                    (o = z(
                      (o = z(
                        (o = z(
                          (o = z(
                            (o = W(
                              (o = W(
                                (o = W(
                                  (o = W(
                                    o,
                                    (i = W(
                                      i,
                                      (s = W(s, (n = W(n, o, i, s, e[l + 0], 7, -680876936)), o, i, e[l + 1], 12, -389564586)),
                                      n,
                                      o,
                                      e[l + 2],
                                      17,
                                      606105819
                                    )),
                                    s,
                                    n,
                                    e[l + 3],
                                    22,
                                    -1044525330
                                  )),
                                  (i = W(
                                    i,
                                    (s = W(s, (n = W(n, o, i, s, e[l + 4], 7, -176418897)), o, i, e[l + 5], 12, 1200080426)),
                                    n,
                                    o,
                                    e[l + 6],
                                    17,
                                    -1473231341
                                  )),
                                  s,
                                  n,
                                  e[l + 7],
                                  22,
                                  -45705983
                                )),
                                (i = W(
                                  i,
                                  (s = W(s, (n = W(n, o, i, s, e[l + 8], 7, 1770035416)), o, i, e[l + 9], 12, -1958414417)),
                                  n,
                                  o,
                                  e[l + 10],
                                  17,
                                  -42063
                                )),
                                s,
                                n,
                                e[l + 11],
                                22,
                                -1990404162
                              )),
                              (i = W(
                                i,
                                (s = W(s, (n = W(n, o, i, s, e[l + 12], 7, 1804603682)), o, i, e[l + 13], 12, -40341101)),
                                n,
                                o,
                                e[l + 14],
                                17,
                                -1502002290
                              )),
                              s,
                              n,
                              e[l + 15],
                              22,
                              1236535329
                            )),
                            (i = z(
                              i,
                              (s = z(s, (n = z(n, o, i, s, e[l + 1], 5, -165796510)), o, i, e[l + 6], 9, -1069501632)),
                              n,
                              o,
                              e[l + 11],
                              14,
                              643717713
                            )),
                            s,
                            n,
                            e[l + 0],
                            20,
                            -373897302
                          )),
                          (i = z(
                            i,
                            (s = z(s, (n = z(n, o, i, s, e[l + 5], 5, -701558691)), o, i, e[l + 10], 9, 38016083)),
                            n,
                            o,
                            e[l + 15],
                            14,
                            -660478335
                          )),
                          s,
                          n,
                          e[l + 4],
                          20,
                          -405537848
                        )),
                        (i = z(
                          i,
                          (s = z(s, (n = z(n, o, i, s, e[l + 9], 5, 568446438)), o, i, e[l + 14], 9, -1019803690)),
                          n,
                          o,
                          e[l + 3],
                          14,
                          -187363961
                        )),
                        s,
                        n,
                        e[l + 8],
                        20,
                        1163531501
                      )),
                      (i = z(
                        i,
                        (s = z(s, (n = z(n, o, i, s, e[l + 13], 5, -1444681467)), o, i, e[l + 2], 9, -51403784)),
                        n,
                        o,
                        e[l + 7],
                        14,
                        1735328473
                      )),
                      s,
                      n,
                      e[l + 12],
                      20,
                      -1926607734
                    )),
                    (i = Y(
                      i,
                      (s = Y(s, (n = Y(n, o, i, s, e[l + 5], 4, -378558)), o, i, e[l + 8], 11, -2022574463)),
                      n,
                      o,
                      e[l + 11],
                      16,
                      1839030562
                    )),
                    s,
                    n,
                    e[l + 14],
                    23,
                    -35309556
                  )),
                  (i = Y(
                    i,
                    (s = Y(s, (n = Y(n, o, i, s, e[l + 1], 4, -1530992060)), o, i, e[l + 4], 11, 1272893353)),
                    n,
                    o,
                    e[l + 7],
                    16,
                    -155497632
                  )),
                  s,
                  n,
                  e[l + 10],
                  23,
                  -1094730640
                )),
                (i = Y(
                  i,
                  (s = Y(s, (n = Y(n, o, i, s, e[l + 13], 4, 681279174)), o, i, e[l + 0], 11, -358537222)),
                  n,
                  o,
                  e[l + 3],
                  16,
                  -722521979
                )),
                s,
                n,
                e[l + 6],
                23,
                76029189
              )),
              (i = Y(
                i,
                (s = Y(s, (n = Y(n, o, i, s, e[l + 9], 4, -640364487)), o, i, e[l + 12], 11, -421815835)),
                n,
                o,
                e[l + 15],
                16,
                530742520
              )),
              s,
              n,
              e[l + 2],
              23,
              -995338651
            )),
            (i = j(
              i,
              (s = j(s, (n = j(n, o, i, s, e[l + 0], 6, -198630844)), o, i, e[l + 7], 10, 1126891415)),
              n,
              o,
              e[l + 14],
              15,
              -1416354905
            )),
            s,
            n,
            e[l + 5],
            21,
            -57434055
          )),
          (i = j(
            i,
            (s = j(s, (n = j(n, o, i, s, e[l + 12], 6, 1700485571)), o, i, e[l + 3], 10, -1894986606)),
            n,
            o,
            e[l + 10],
            15,
            -1051523
          )),
          s,
          n,
          e[l + 1],
          21,
          -2054922799
        )),
        (i = j(
          i,
          (s = j(s, (n = j(n, o, i, s, e[l + 8], 6, 1873313359)), o, i, e[l + 15], 10, -30611744)),
          n,
          o,
          e[l + 6],
          15,
          -1560198380
        )),
        s,
        n,
        e[l + 13],
        21,
        1309151649
      )),
      (i = j(i, (s = j(s, (n = j(n, o, i, s, e[l + 4], 6, -145523070)), o, i, e[l + 11], 10, -1120210379)), n, o, e[l + 2], 15, 718787259)),
      s,
      n,
      e[l + 9],
      21,
      -343485551
    )),
      (n = de(n, r)),
      (o = de(o, u)),
      (i = de(i, a)),
      (s = de(s, I)))
  }
  return [n, o, i, s]
}
function Nt(e, t, n, o, i, s) {
  return de(wi(de(de(t, e), de(o, s)), i), n)
}
function W(e, t, n, o, i, s, l) {
  return Nt((t & n) | (~t & o), e, t, i, s, l)
}
function z(e, t, n, o, i, s, l) {
  return Nt((t & o) | (n & ~o), e, t, i, s, l)
}
function Y(e, t, n, o, i, s, l) {
  return Nt(t ^ n ^ o, e, t, i, s, l)
}
function j(e, t, n, o, i, s, l) {
  return Nt(n ^ (t | ~o), e, t, i, s, l)
}
function de(e, t) {
  const n = (65535 & e) + (65535 & t)
  return (((e >> 16) + (t >> 16) + (n >> 16)) << 16) | (65535 & n)
}
function wi(e, t) {
  return (e << t) | (e >>> (32 - t))
}
const To = Symbol('INVALID_KEY')
function $i(e) {
  const t = e.slice(0, 32),
    n = e.slice(32),
    o = atob(n)
  if (t !== Si(n)) return To
  const [i, s] = o.split(';'),
    l = i.slice(2),
    r = new Date(Number(s.slice(2)))
  return { orderNumber: l, expiryDate: r }
}
const Li = {
    valid: !1,
    consoleMessage:
      'The VirtuosoMessageList license wrapper component is missing. Enclose the VirtuosoMessageList with VirtuosoMessageListLicense and add your key at the licenseKey property.',
    watermarkMessage:
      'The VirtuosoMessageList license wrapper component is missing. Enclose the VirtuosoMessageList with VirtuosoMessageListLicense and add your key at the licenseKey property.',
  },
  Ri = {
    valid: !1,
    consoleMessage: 'Your VirtuosoMessageListLicense is missing a license key. Purchase one from https://virtuoso.dev/pricing/',
    watermarkMessage: 'Your VirtuosoMessageListLicense is missing a license key. Purchase one from https://virtuoso.dev/pricing/',
  },
  Mi = {
    valid: !1,
    consoleMessage:
      'Your VirtuosoMessageListLicense component is missing a license key - this component will not work if deployed in production. Purchase a key from https://virtuoso.dev/pricing/ before you deploy to production.',
  },
  yo = {
    valid: !0,
  },
  Ai = {
    valid: !1,
    consoleMessage:
      'Your Virtuoso Message List license key is invalid. Ensure that you have copy-pasted the key from the purchase email correctly.',
    watermarkMessage: 'Your Virtuoso Message List license key is invalid',
  },
  Ci = {
    valid: !1,
    consoleMessage:
      'Your annual license key to use Virtuoso Message List in non-production environments has expired. You can still use it in production. To keep using it in development, purchase a new key from https://virtuoso.dev/pricing/',
    watermarkMessage:
      'Your annual license key to use Virtuoso Message List in non-production environments has expired. You can still use it in production. To keep using it in development, purchase a new key from https://virtuoso.dev/pricing/',
  },
  Vi = {
    valid: !1,
    consoleMessage:
      'You have installed a version of `@virtuoso.dev/message-list` that is newer than the period of your license key. Either downgrade to a supported version, or purchase a new license from https://virtuoso.dev/pricing/',
    watermarkMessage:
      'You have installed a version of `@virtuoso.dev/message-list` that is newer than the period of your license key. Either downgrade to a supported version, or purchase a new license from https://virtuoso.dev/pricing/',
  },
  Oi = yo,
  Di = /^(?:127\.0\.0\.1|localhost|0\.0\.0\.0|.+\.local)$/,
  Bi = ['virtuoso.dev', 'csb.app', 'codesandbox.io']
function Ni({ licenseKey: e, now: t, hostname: n, packageTimestamp: o, isNativeRuntime: i = !1, isNativeCapacitor: s = !1 }) {
  const l = !(i || s) && Di.test(n),
    r = Bi.some((a) => n.endsWith(a))
  if (!e) return r ? Oi : l ? Mi : Ri
  const u = $i(e)
  if (u === To) return Ai
  if (u.expiryDate.getTime() < t.getTime()) {
    if (l) return Ci
    if (u.expiryDate.getTime() < o) return Vi
  }
  return yo
}
const wo = h.createContext(Li)
function Hi() {
  const e = globalThis.Capacitor
  if (typeof (e == null ? void 0 : e.isNativePlatform) != 'function') return !1
  try {
    return e.isNativePlatform()
  } catch {
    return !1
  }
}
function Fi() {
  var t
  const e = globalThis.process
  return (t = e == null ? void 0 : e.versions) != null && t.electron
    ? !0
    : typeof navigator > 'u'
      ? !1
      : /\bElectron\//.test(navigator.userAgent)
}
function _i() {
  return Hi() || Fi()
}
function ns({ licenseKey: e, children: t }) {
  const n = Ni({
    licenseKey: e,
    hostname: typeof window < 'u' ? window.location.hostname : 'localhost',
    now: /* @__PURE__ */ new Date(),
    packageTimestamp: 1788616254168,
    isNativeRuntime: _i(),
  })
  return /* @__PURE__ */ w(wo.Provider, { value: n, children: t })
}
const Ht = h.createContext(void 0)
let yn = !1
const Pi = h.forwardRef(
  (
    {
      initialData: e = [],
      computeItemKey: t = xo,
      context: n = null,
      initialLocation: o = null,
      shortSizeAlign: i = 'top',
      onScroll: s,
      onRenderedDataChange: l,
      ItemContent: r = vo,
      Header: u = null,
      StickyHeader: a = null,
      Footer: I = null,
      StickyFooter: f = null,
      EmptyPlaceholder: p = null,
      HeaderWrapper: b = ao,
      StickyHeaderWrapper: d = po,
      FooterWrapper: m = fo,
      StickyFooterWrapper: k = ho,
      useWindowScroll: D = !1,
      customScrollParent: V = null,
      ScrollElement: B = 'div',
      increaseViewportBy: _ = 0,
      data: N,
      enforceStickyFooterAtBottom: q = !1,
      itemIdentity: G = ko,
      ...P
    },
    R
  ) => {
    const M = h.useMemo(() => {
      const A = new Oo()
      return (
        A.register(ve),
        A.register(Dt),
        A.register(Rt),
        A.register(Xt),
        A.register(xt),
        A.register(At),
        A.register(ce),
        A.register(Ke),
        A.pubIn({
          [S]: e.slice(),
          [sn]: G,
          [Be]: n,
          [So]: t,
          [De]: o,
          [on]: r,
          [io]: u,
          [lo]: I,
          [so]: a,
          [ro]: f,
          [uo]: p,
          [co]: B,
          [Io]: k,
          [mo]: d,
          [bo]: m,
          [go]: b,
          [ln]: i,
          [dn]: D,
          [lt]: V,
          [Zn]: _,
          [Xn]: q,
        }),
        A.singletonSub(tn, s),
        A.singletonSub(Mt, l),
        A
      )
    }, [])
    ;(h.useImperativeHandle(R, () => oo(M), [M]),
      h.useEffect(() => {
        ;(M.pub(sn, G),
          M.pubIn({
            [Be]: n,
            [on]: r,
            [lt]: V,
            [Eo]: N,
          }),
          M.singletonSub(tn, s),
          M.singletonSub(Mt, l))
      }, [n, r, V, G, s, l, M, N]))
    const X = h.useContext(wo)
    return (
      h.useEffect(() => {
        X.consoleMessage && (yn || ((yn = !0), console.warn(X.consoleMessage)))
      }, [X]),
      h.useEffect(() => {
        const A = (fe) => {
          var ke
          ;(ke = fe.message) != null &&
            ke.includes('ResizeObserver loop') &&
            (fe.preventDefault(), fe.stopPropagation(), fe.stopImmediatePropagation())
        }
        return (
          window.addEventListener('error', A, { capture: !0 }),
          () => {
            window.removeEventListener('error', A)
          }
        )
      }, []),
      typeof window < 'u' && X.watermarkMessage
        ? /* @__PURE__ */ w('div', {
            style: {
              color: 'red',
              pointerEvents: 'none',
            },
            children: X.watermarkMessage,
          })
        : /* @__PURE__ */ w(Do.Provider, { value: M, children: /* @__PURE__ */ w(Wi, { ...P }) })
    )
  }
)
Pi.displayName = 'VirtuosoMessageList'
const Wi = ({ style: e, ...t }) => {
    const n = _e(),
      o = h.useContext(Ht),
      [i, s, l, r, u, a, I, f, p, b, d] = Bo(io, so, go, mo, lo, ro, bo, Io, on, uo, lt),
      [m] = h.useState(() => {
        if (typeof window < 'u' && typeof ResizeObserver > 'u')
          throw new Error('ResizeObserver not found. Please ensure that you have a polyfill installed.')
        if (!(typeof ResizeObserver > 'u'))
          return new ResizeObserver((T) => {
            var dt, Ye, Je, In
            const Te = T.length,
              Z = []
            let $ = {}
            for (let _t = 0; _t < Te; _t++) {
              const he = T[_t],
                H = he.target
              if (H === N.current) {
                $ = {
                  ...$,
                  [ct]: he.contentRect.height,
                  [F]: (dt = P.current) == null ? void 0 : dt.scrollHeight,
                }
                continue
              }
              if (H === G.current) {
                $ = {
                  ...$,
                  [Qe]: he.contentRect.height,
                  [F]: (Ye = P.current) == null ? void 0 : Ye.scrollHeight,
                }
                continue
              }
              if (H === D.current) {
                $ = {
                  ...$,
                  [pn]: he.contentRect.height,
                  [F]: (Je = P.current) == null ? void 0 : Je.scrollHeight,
                }
                continue
              }
              if (H === B.current) {
                $ = {
                  ...$,
                  [at]: he.contentRect.height,
                  [F]: (In = P.current) == null ? void 0 : In.scrollHeight,
                }
                continue
              }
              if (H === P.current) {
                $ = {
                  ...$,
                  [L]: H.scrollTop,
                  [F]: H.scrollHeight,
                  [oe]: he.contentRect.height,
                  [yt]: H.clientWidth,
                }
                continue
              }
              if (H === M.current) {
                P.current &&
                  ($ = {
                    ...$,
                    [F]: P.current.scrollHeight,
                  })
                continue
              }
              if (H === R.current) {
                const ge = H.ownerDocument.defaultView
                ge !== null &&
                  ($ = {
                    ...$,
                    [F]: he.contentRect.height,
                    [xe]: ge.scrollY,
                    [Ze]: ge.innerHeight,
                    [rt]: H.getBoundingClientRect().top + ge.scrollY,
                    [yt]: H.clientWidth,
                  })
                continue
              }
              if (H === d || H === X.current) {
                const ge = A.current,
                  mt = X.current
                ge &&
                  mt &&
                  ($ = {
                    ...$,
                    [F]: mt.getBoundingClientRect().height,
                    [xe]: ge.scrollTop,
                    [Ze]: ge.clientHeight,
                    [rt]: mt.offsetTop,
                    [yt]: mt.clientWidth,
                  })
                continue
              }
              if (H.dataset.index === void 0) continue
              const Pt = Number.parseInt(H.dataset.index),
                Vo = Number.parseFloat(H.dataset.knownSize ?? ''),
                Wt = he.contentRect.height
              if (Wt === Vo) continue
              const vn = Z[Z.length - 1]
              Z.length === 0 || vn.size !== Wt || vn.endIndex !== Pt - 1
                ? Z.push({ endIndex: Pt, size: Wt, startIndex: Pt })
                : Z[Z.length - 1].endIndex++
            }
            ;(Z.length > 0 &&
              ($ = {
                ...$,
                [me]: Z,
              }),
              n.pubIn($))
          })
      }),
      [k, D] = It(m),
      [V, B] = It(m),
      [_, N] = It(m),
      [q, G] = It(m),
      P = h.useRef(null),
      R = h.useRef(null),
      M = h.useRef(null),
      X = h.useRef(null),
      A = h.useRef(null)
    $n(() => {
      A.current = d
    }, [d])
    const fe = h.useCallback(
        (T) => {
          if (o) {
            const Te = Number.parseInt(T.dataset.index ?? '')
            n.pub(me, [
              {
                startIndex: Te,
                endIndex: Te,
                size: o.itemHeight,
              },
            ])
          }
          m == null || m.observe(T)
        },
        [m, n, o]
      ),
      ke = h.useCallback(
        (T) => {
          m == null || m.unobserve(T)
        },
        [m]
      ),
      Q = h.useCallback(
        (T) => {
          T
            ? ((M.current = T), m == null || m.observe(T, { box: 'border-box' }))
            : M.current && (m == null || m.unobserve(M.current), (M.current = null))
        },
        [m]
      ),
      { items: Ee, visibleListHeight: re } = C(ve),
      ue = h.useCallback(() => {
        var Te
        const T = []
        for (const Z of ((Te = M.current) == null ? void 0 : Te.children) ?? []) {
          if (Z.dataset.index === void 0) continue
          const $ = Number.parseInt(Z.dataset.index),
            dt = Number.parseFloat(Z.dataset.knownSize ?? ''),
            Ye = Z.getBoundingClientRect().height
          if (Ye === dt) continue
          const Je = T[T.length - 1]
          T.length === 0 || Je.size !== Ye || Je.endIndex !== $ - 1
            ? T.push({ endIndex: $, size: Ye, startIndex: $ })
            : T[T.length - 1].endIndex++
        }
        n.pub(me, T)
      }, [n])
    h.useLayoutEffect(() => n.sub(to, ue), [ue, n])
    const Ft = C(J),
      pe = C(nn),
      pt = C(Vt),
      $o = C(Bt),
      Lo = C(eo),
      ze = C(Be),
      Ro = C(So),
      ht = C(Se),
      Mo = C(Xe),
      Ao = C(dn),
      gt = C(Re),
      Co = C(Xn)
    return (
      h.useLayoutEffect(() => {
        Ee.length === 0 && n.pub(no)
      }, [Ee, n]),
      h.useLayoutEffect(() => {
        var T
        ht > 0 && gt === null && b !== null && n.pub(F, (T = P.current) == null ? void 0 : T.scrollHeight)
      }, [n, ht, gt, b]),
      /* @__PURE__ */ Ln(d ? ji : Ao ? Yi : zi, {
        ...t,
        observer: m,
        scrollerRef: P,
        customScrollParentWrapperRef: X,
        listRef: M,
        style: e,
        windowScrollWrapperRef: R,
        children: [
          (ht === 0 || gt) && b ? /* @__PURE__ */ w(b, { context: ze }) : null,
          s && /* @__PURE__ */ w(r, { ref: q, style: bt, children: /* @__PURE__ */ w(s, { context: ze }) }),
          i && /* @__PURE__ */ w(l, { ref: _, style: bt, children: /* @__PURE__ */ w(i, { context: ze }) }),
          ht > 0
            ? /* @__PURE__ */ w('div', {
                ref: Q,
                'data-testid': 'virtuoso-list',
                style: {
                  boxSizing: 'content-box',
                  height: Mo,
                  paddingBottom: $o,
                  overflowAnchor: 'none',
                  marginTop: pt,
                  transition: Lo,
                  position: 'relative',
                  transform: `translateY(${Ft + pe}px)`,
                  ...(Co ? { minHeight: re - pt } : {}),
                  visibility: gt ? 'hidden' : 'visible',
                },
                children: Ee.map((T) =>
                  /* @__PURE__ */ w(
                    vi,
                    {
                      mount: fe,
                      unmount: ke,
                      item: T,
                      ItemContent: p,
                    },
                    Ro({ index: T.index, data: T.data, context: ze })
                  )
                ),
              })
            : null,
          u && /* @__PURE__ */ w(I, { ref: k, style: bt, children: /* @__PURE__ */ w(u, { context: ze }) }),
          a && /* @__PURE__ */ w(f, { ref: V, style: bt, children: /* @__PURE__ */ w(a, { context: ze }) }),
        ],
      })
    )
  },
  zi = ({
    customScrollParentWrapperRef: e,
    windowScrollWrapperRef: t,
    observer: n,
    children: o,
    listRef: i,
    scrollerRef: s,
    style: l,
    ...r
  }) => {
    const u = _e(),
      a = h.useContext(Ht),
      I = C(co),
      { onScroll: f, onWheel: p } = mn({
        listRef: i,
        scrollTopCell$: L,
        scrollToSignal$: He,
        scrollableRef: s,
      }),
      b = h.useCallback(
        (k) => {
          k
            ? (u.pub(Ne, k),
              (s.current = k),
              k.addEventListener('scroll', f),
              k.addEventListener('wheel', p),
              a &&
                u.pubIn({
                  [oe]: a.viewportHeight,
                  [F]: a.viewportHeight,
                  [L]: 0,
                }),
              n == null || n.observe(k, { box: 'border-box' }))
            : s.current &&
              (s.current.removeEventListener('scroll', f),
              s.current.removeEventListener('wheel', p),
              u.pub(Ne, null),
              n == null || n.unobserve(s.current),
              (s.current = null))
        },
        [n, u, f, p, a, s]
      )
    bn(() => {
      var k
      return (k = s.current) == null ? void 0 : k.scrollHeight
    })
    const d = C(ie),
      m = C(Be)
    return /* @__PURE__ */ w(I, {
      ...r,
      ref: b,
      'data-testid': 'virtuoso-scroller',
      style: {
        overflowY: d ? 'hidden' : 'scroll',
        boxSizing: 'border-box',
        ...l,
      },
      ...(I === 'div' ? {} : { context: m }),
      children: o,
    })
  },
  Yi = ({ observer: e, children: t, windowScrollWrapperRef: n, customScrollParentWrapperRef: o, listRef: i, ...s }) => {
    const l = h.useRef(null),
      r = _e(),
      u = h.useContext(Ht),
      { onScroll: a, onWheel: I } = mn({
        listRef: i,
        scrollTopCell$: xe,
        scrollToSignal$: hn,
        scrollableRef: l,
      }),
      f = h.useCallback(() => {
        var d
        const b = l.current
        b !== null && r.pub(Ze, (d = b.ownerDocument.defaultView) == null ? void 0 : d.innerHeight)
      }, [r]),
      p = h.useCallback(
        (b) => {
          if (b) {
            ;(r.pub(Ne, b), (n.current = b))
            const d = b.ownerDocument.defaultView
            ;(d &&
              (d.addEventListener('scroll', a),
              d.addEventListener('wheel', I),
              d.addEventListener('resize', f),
              u &&
                r.pubIn({
                  [Ze]: d == null ? void 0 : d.innerHeight,
                  [F]: b.getBoundingClientRect().height,
                  [xe]: 0,
                }),
              (l.current = b.ownerDocument.documentElement)),
              e == null || e.observe(b, { box: 'border-box' }))
          } else {
            if (n.current) {
              const d = n.current.ownerDocument.defaultView
              ;(d && (d.removeEventListener('scroll', a), d.removeEventListener('wheel', I), d.removeEventListener('resize', f)),
                r.pub(Ne, null),
                e == null || e.unobserve(n.current),
                (n.current = null))
            }
            l.current = null
          }
        },
        [e, r, a, I, f, u, n]
      )
    return (
      bn(() => {
        var b
        return (b = n.current) == null ? void 0 : b.getBoundingClientRect().height
      }),
      /* @__PURE__ */ w('div', { ref: p, ...s, children: t })
    )
  },
  ji = ({ scrollerRef: e, windowScrollWrapperRef: t, children: n, listRef: o, customScrollParentWrapperRef: i, observer: s, ...l }) => {
    const r = _e(),
      u = h.useContext(Ht),
      a = C(lt),
      I = h.useRef(a)
    $n(() => {
      I.current = a
    }, [a])
    const { onWheel: f, onScroll: p } = mn({
        listRef: o,
        scrollTopCell$: xe,
        scrollToSignal$: hn,
        scrollableRef: I,
      }),
      b = h.useCallback(
        (d) => {
          if (d) {
            const m = I.current
            ;(r.pub(Ne, m),
              (i.current = d),
              m &&
                (m.addEventListener('scroll', p),
                m.addEventListener('wheel', f),
                u &&
                  r.pubIn({
                    [Ze]: m.clientHeight,
                    [F]: d.getBoundingClientRect().height,
                    [xe]: 0,
                  }),
                s == null || s.observe(m, { box: 'border-box' })),
              s == null || s.observe(d, { box: 'border-box' }))
          } else {
            const m = I.current
            ;(m && (m.removeEventListener('scroll', p), m.removeEventListener('wheel', f), r.pub(Ne, null), s == null || s.unobserve(m)),
              i.current && (s == null || s.unobserve(i.current)),
              (i.current = null))
          }
        },
        [s, r, p, f, u, i]
      )
    return (
      bn(() => {
        var d
        return (d = i.current) == null ? void 0 : d.getBoundingClientRect().height
      }),
      /* @__PURE__ */ w('div', { ref: b, ...l, children: n })
    )
  }
function mn({ scrollToSignal$: e, scrollableRef: t, listRef: n, scrollTopCell$: o }) {
  const i = _e(),
    s = h.useRef(null),
    l = h.useRef(!1),
    r = xi(t, n, s, l, o),
    u = h.useCallback(
      (f) => {
        t.current && (t.current.scrollTop += f)
      },
      [t]
    ),
    a = h.useCallback(() => {
      if (l.current) return
      const f = t.current
      if (f !== null && (i.pub(o, f.scrollTop), s.current !== null)) {
        const p = f.scrollHeight - f.clientHeight
        Lt(f.scrollTop, Math.min(p, s.current)) && ((s.current = null), i.pub($e, !1), i.pub(Me, f.scrollTop))
      }
    }, [i, t, o]),
    I = h.useCallback(
      (f) => {
        i.pub(gn, f.deltaY > 0 ? 'down' : 'up')
      },
      [i]
    )
  return (
    h.useLayoutEffect(() => i.sub(e, r), [r, i, e]),
    h.useLayoutEffect(() => i.sub(te, u), [u, i]),
    {
      onScroll: a,
      onWheel: I,
    }
  )
}
function bn(e) {
  const t = No(F)
  Ho(() => {
    if (!Pn()) return
    const n = setInterval(() => {
      t(e() ?? 0)
    }, 1e3)
    return () => {
      clearInterval(n)
    }
  }, [t, e])
}
export {
  Ji as ScrollModifierOption,
  Pi as VirtuosoMessageList,
  ns as VirtuosoMessageListLicense,
  Ht as VirtuosoMessageListTestingContext,
  ts as scrollToBottomAlways,
  es as scrollToBottomIfAtBottom,
  Xi as useCurrentlyRenderedData,
  Zi as useVirtuosoLocation,
  Qi as useVirtuosoMethods,
}
