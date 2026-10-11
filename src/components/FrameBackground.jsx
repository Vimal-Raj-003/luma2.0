import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, REDUCE_QUERY, MOBILE_QUERY } from '../lib/gsap'
import { FRAME_COUNT, FRAME_PATH, frameSrc } from '../data'

const SRC_W = 1920
const SRC_H = 1080
const LAST = FRAME_COUNT - 1
const STILL_FRAME = 108 // stable, fully built glass shown when reduced motion is requested

// Where each section starts, expressed as the frame that should be on screen (the hero ends with
// milk splashing over the first layers; the CTA lands on the finished, topped glass). Positions come
// from each section's ScrollTrigger; between them progress follows FRAME_PATH, not frame number.
// After the hero the anchors are spaced so every section advances at about the same visible-change
// per scroll distance (~3 units/100px measured on the footage), so no section feels fast or slow.
const STOPS = [
  ['hero', 0],
  ['flavours', 54],
  ['ingredients', 69],
  ['why', 78],
  ['approach', 86],
  ['testimonials', 92],
  ['cta', 109],
]

// visual progress (0..1) -> fractional frame index
function pathToFrame(p) {
  if (p <= 0) return 0
  if (p >= 1) return LAST
  let lo = 0
  let hi = LAST
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (FRAME_PATH[mid] <= p) lo = mid
    else hi = mid
  }
  const span = FRAME_PATH[hi] - FRAME_PATH[lo]
  return lo + (span > 0 ? (p - FRAME_PATH[lo]) / span : 0)
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
const smoothstep = (t) => t * t * (3 - 2 * t)

// ---- framing ---------------------------------------------------------------
// The glass (plus scoop and splash) occupies a fixed box in the source frame.
const BOX = { x0: 860, x1: 1520, y0: 40, y1: 1040 }
const BOX_CX = 1190
const BOX_CY = 540
const HERO_CY = 610 // vertical centre of the glass (rim to base) through the hero frames

// HERO framing: the real frame covers the whole viewport edge to edge (cover-fit), focused on the
// glass so it is never cropped badly. No second layer, no blurred copy.
const NARROW_COVER = 0.95 // narrow portrait phones: 5% inside the full cover scale (glass clears the screen edges)
function coverPlacement(cw, ch) {
  const short = ch <= 520
  const portrait = cw <= 900 && !short
  const narrow = portrait && cw <= 500
  const sc = Math.max(cw / SRC_W, ch / SRC_H) * (narrow ? NARROW_COVER : 1)
  const dw = SRC_W * sc
  const dh = SRC_H * sc
  const tx = portrait ? 0.5 : short ? 0.68 : 0.64 // glass sits right of centre when text is on the left
  return {
    left: dw >= cw ? clamp(tx * cw - BOX_CX * sc, cw - dw, 0) : (cw - dw) / 2,
    // when the frame is a touch shorter than the screen (narrow phones) it is centred and the sliver
    // above/below is filled with the frame's own edge pixels (see draw)
    top: dh >= ch ? clamp(ch * 0.5 - HERO_CY * sc, ch - dh, 0) : (ch - dh) / 2,
    dw,
    dh,
  }
}

// REST OF THE PAGE: contain-style framing. The product box is fitted into a "safe rectangle" of
// the viewport so the whole glass stays visible behind the other sections' text.
function placement(cw, ch) {
  const short = ch <= 520 // phones in landscape
  const mobile = cw <= 900 && !short
  const safe = short
    ? { x0: cw * 0.56, x1: cw * 0.97, y0: 58, y1: ch - 10 } // text column on the left, glass whole on the right
    : mobile
      ? { x0: cw * 0.06, x1: cw * 0.94, y0: ch * 0.22, y1: ch * 0.7 } // text lives below, heading above
      : { x0: cw * 0.42, x1: cw * 0.97, y0: 84, y1: ch - 28 } // product right of centre, clear of the nav
  const sc = Math.min((safe.x1 - safe.x0) / (BOX.x1 - BOX.x0), (safe.y1 - safe.y0) / (BOX.y1 - BOX.y0))
  const dw = SRC_W * sc
  const dh = SRC_H * sc
  let left = (safe.x0 + safe.x1) / 2 - BOX_CX * sc
  let top = (safe.y0 + safe.y1) / 2 - BOX_CY * sc
  // keep the frame inside the viewport when it is smaller, centred-in-range when larger
  left = dw <= cw ? clamp(left, 0, cw - dw) : clamp(left, cw - dw, 0)
  top = dh <= ch ? clamp(top, 0, ch - dh) : clamp(top, ch - dh, 0)
  return { left, top, dw, dh }
}

function buildSpec(el) {
  const cw = el.clientWidth || window.innerWidth
  const ch = el.clientHeight || window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const aspect = cw / ch
  // Narrow phones: decode only the band of the frame that either framing can ever show (the hero is a
  // tight crop; the page framing shows cw / scale source pixels), at a higher scale. Sharper hero and
  // a smaller footprint than the full frame; the band is no wider than needed for this exact screen.
  if (cw <= 500 && ch > 520) {
    const visible = (cw / placement(cw, ch).dw) * SRC_W // source px the page framing shows across
    const sw = clamp(Math.round(visible + 40), 760, 1180)
    const sx = clamp(Math.round(BOX_CX - sw / 2), 0, SRC_W - sw)
    const bw = Math.round(sw * 0.72)
    return { sx, sy: 0, sw, sh: SRC_H, bw, bh: Math.round(SRC_H * 0.72), aspect }
  }
  const dw = Math.max(placement(cw, ch).dw, coverPlacement(cw, ch).dw)
  const cap = ch <= 520 ? 960 : 1280
  const bw = Math.min(SRC_W, cap, Math.max(320, Math.round(dw * dpr)))
  return { sx: 0, sy: 0, sw: SRC_W, sh: SRC_H, bw, bh: Math.round((bw * SRC_H) / SRC_W), aspect }
}

async function loadFrames(spec, bag, onFrame, token) {
  const loadOne = async (i) => {
    try {
      const blob = await (await fetch(frameSrc(i))).blob()
      let bmp
      try {
        bmp = await createImageBitmap(blob, spec.sx, spec.sy, spec.sw, spec.sh, {
          resizeWidth: spec.bw,
          resizeHeight: spec.bh,
          resizeQuality: 'high',
        })
      } catch {
        bmp = await createImageBitmap(blob)
      }
      const entry = { b: bmp, sx: spec.sx, sy: spec.sy, sw: spec.sw, sh: spec.sh }
      if (bmp.width === SRC_W) Object.assign(entry, { sx: 0, sy: 0, sw: SRC_W, sh: SRC_H }) // fallback decode = whole frame
      if (token.cancelled) bmp.close()
      else {
        const old = bag[i]
        bag[i] = entry
        if (old) old.b.close()
      }
    } catch {
      /* a missing frame is covered by its nearest neighbour at draw time */
    }
    onFrame(i)
  }
  // the first frame goes alone and first so the hero paints immediately;
  // everything else streams in silently behind it
  await loadOne(0)
  let next = 1
  const worker = async () => {
    while (next < FRAME_COUNT && !token.cancelled) await loadOne(next++)
  }
  await Promise.all(Array.from({ length: 6 }, worker))
}

// ONE fixed canvas behind the whole page. A single ScrollTrigger maps the full
// document scroll to a proxy `frame` value (and a `mix` value that eases the framing from the
// hero's cover-fit into the page framing); a ticker redraws only when either changes.
// Nothing here touches React state.
export default function FrameBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const c2d = canvas.getContext('2d', { alpha: false })

    const s = {
      bag: new Array(FRAME_COUNT).fill(null),
      spec: buildSpec(canvas),
      W: 0,
      H: 0,
      F: 0,
      base: null,
      lastDrawn: -1,
      drawnMix: -1,
      loaded: 0,
      ready: false,
      painted: false,
      bgSet: false,
      token: { cancelled: false },
      dead: false,
      breaks: null,
    }
    const tiny = document.createElement('canvas')
    tiny.width = 96
    tiny.height = 54
    const tinyCtx = tiny.getContext('2d')
    const soft = document.createElement('canvas') // tiny, re-sampled in two steps so the upscale stays smooth
    soft.width = 384
    soft.height = 216
    const softCtx = soft.getContext('2d')
    softCtx.imageSmoothingQuality = 'high'
    const tmp = document.createElement('canvas')
    const tmpCtx = tmp.getContext('2d')
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d')
    const proxy = { frame: 0, mix: 1 } // mix: 1 = hero cover-fit, 0 = page framing
    const smooth = gsap.quickTo(proxy, 'frame', { duration: 0.7, ease: 'power3.out' })
    const smoothMix = gsap.quickTo(proxy, 'mix', { duration: 0.6, ease: 'power3.out' })

    // ---- drawing --------------------------------------------------------
    const nearest = (i) => {
      if (s.bag[i]) return s.bag[i]
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (s.bag[i - d]) return s.bag[i - d]
        if (s.bag[i + d]) return s.bag[i + d]
      }
      return null
    }
    const draw = (i) => {
      const entry = nearest(i)
      if (!entry) return false
      const bmp = entry.b
      const { W, H, F } = s
      const m = smoothstep(clamp(proxy.mix, 0, 1))
      const a = s.base.contain
      const b = s.base.cover
      const left = a.left + (b.left - a.left) * m
      const top = a.top + (b.top - a.top) * m
      const dw = a.dw + (b.dw - a.dw) * m
      const k = dw / SRC_W
      // where the decoded region lands on the canvas
      const rx = left + entry.sx * k
      const ry = top + entry.sy * k
      const rw = entry.sw * k
      const rh = entry.sh * k
      const fits = rx <= 0.5 && ry <= 0.5 && rx + rw >= W - 0.5 && ry + rh >= H - 0.5
      const heroState = m >= 0.999
      if (!fits && !heroState) {
        // Only when the frame is smaller than the viewport (page framing): a soft, static backdrop from
        // the first frame fills the margin. The hero never draws this — its frame covers the screen.
        if (!s.bgSet) {
          tinyCtx.drawImage((s.bag[0] || entry).b, 0, 0, tiny.width, tiny.height)
          softCtx.drawImage(tiny, 0, 0, 192, 108)
          softCtx.drawImage(soft, 0, 0, 192, 108, 0, 0, soft.width, soft.height)
          s.bgSet = !!s.bag[0]
        }
        const bk = Math.max(W / soft.width, H / soft.height)
        c2d.imageSmoothingEnabled = true
        c2d.drawImage(soft, (W - soft.width * bk) / 2, (H - soft.height * bk) / 2, soft.width * bk, soft.height * bk)
      }
      // the visible part of the frame, and the matching part of the bitmap
      const vx = Math.max(0, Math.floor(rx))
      const vy = Math.max(0, Math.floor(ry))
      const vw = Math.min(W, Math.ceil(rx + rw)) - vx
      const vh = Math.min(H, Math.ceil(ry + rh)) - vy
      if (vw <= 0 || vh <= 0) return true
      const sx = ((vx - rx) / rw) * bmp.width
      const sy = ((vy - ry) / rh) * bmp.height
      const sw = (vw / rw) * bmp.width
      const sh = (vh / rh) * bmp.height
      if (!fits && heroState) {
        // hero: extend the real frame's top/bottom/side rows into the thin margin (no blur, no second layer)
        const ex = Math.ceil(vy - 0) // top margin height
        if (ry > 0.5) c2d.drawImage(bmp, sx, 0, sw, 1, vx, 0, vw, ex + 1)
        if (ry + rh < H - 0.5) c2d.drawImage(bmp, sx, bmp.height - 1, sw, 1, vx, vy + vh - 1, vw, H - (vy + vh) + 1)
        if (rx > 0.5) c2d.drawImage(bmp, 0, sy, 1, sh, 0, vy, vx + 1, vh)
        if (rx + rw < W - 0.5) c2d.drawImage(bmp, bmp.width - 1, sy, 1, sh, vx + vw - 1, vy, W - (vx + vw) + 1, vh)
      }
      const fl = !heroState && rx > 1 ? F : 0
      const fr = !heroState && rx + rw < W - 1 ? F : 0
      const ft = !heroState && ry > 1 ? F : 0
      const fb = !heroState && ry + rh < H - 1 ? F : 0
      if (fl || fr || ft || fb) {
        // feather the frame's open edges into the backdrop (scratch canvases allocated on first use)
        if (tmp.width !== W || tmp.height !== H) {
          tmp.width = mask.width = W
          tmp.height = mask.height = H
        }
        tmpCtx.globalCompositeOperation = 'source-over'
        tmpCtx.clearRect(0, 0, vw, vh)
        tmpCtx.drawImage(bmp, sx, sy, sw, sh, 0, 0, vw, vh)
        mctx.globalCompositeOperation = 'source-over'
        mctx.clearRect(0, 0, vw, vh)
        mctx.fillStyle = '#fff'
        mctx.fillRect(0, 0, vw, vh)
        mctx.globalCompositeOperation = 'destination-in'
        const ramp = (horizontal, lo, hi) => {
          const len = horizontal ? vw : vh
          const g = horizontal ? mctx.createLinearGradient(0, 0, vw, 0) : mctx.createLinearGradient(0, 0, 0, vh)
          g.addColorStop(0, lo ? 'rgba(0,0,0,0)' : '#000')
          if (lo) g.addColorStop(Math.min(lo / len, 0.49), '#000')
          if (hi) g.addColorStop(Math.max(1 - hi / len, 0.51), '#000')
          g.addColorStop(1, hi ? 'rgba(0,0,0,0)' : '#000')
          mctx.fillStyle = g
          mctx.fillRect(0, 0, vw, vh)
        }
        if (fl || fr) ramp(true, fl, fr)
        if (ft || fb) ramp(false, ft, fb)
        tmpCtx.globalCompositeOperation = 'destination-in'
        tmpCtx.drawImage(mask, 0, 0, vw, vh, 0, 0, vw, vh)
        c2d.drawImage(tmp, 0, 0, vw, vh, vx, vy, vw, vh)
      } else {
        c2d.drawImage(bmp, sx, sy, sw, sh, vx, vy, vw, vh)
      }
      s.drawnMix = proxy.mix
      return true
    }
    let lastT = 0
    const lowPower = window.matchMedia(MOBILE_QUERY).matches
    const tick = (time) => {
      // phones: cap redraws at ~30fps (smoothing still interpolates, the story is unchanged)
      if (lowPower && time - lastT < 0.033) return
      lastT = time
      const idx = Math.min(LAST, Math.max(0, Math.round(proxy.frame)))
      if ((idx !== s.lastDrawn || Math.abs(proxy.mix - s.drawnMix) > 0.0005) && draw(idx)) {
        s.lastDrawn = idx
        if (!s.painted) {
          // first real paint: swap the poster for the canvas (identical framing, no flash)
          s.painted = true
          canvas.classList.add('is-ready')
          document.getElementById('poster')?.classList.add('is-hidden')
        }
      }
    }
    gsap.ticker.add(tick)
    if (import.meta.env.DEV) window.__lumaFrame = () => [proxy.frame, s.lastDrawn, proxy.mix] // dev-only debugging hook

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const W = Math.round(canvas.clientWidth * dpr)
      const H = Math.round(canvas.clientHeight * dpr)
      if (W === s.W && H === s.H) return
      s.W = canvas.width = W
      s.H = canvas.height = H
      tmp.width = mask.width = 1 // released here, re-allocated at the new size if the framing ever needs it
      tmp.height = mask.height = 1
      c2d.imageSmoothingQuality = 'high'
      // both framings in device pixels
      const k = W / canvas.clientWidth
      const toDev = (p) => ({ left: p.left * k, top: p.top * k, dw: p.dw * k, dh: p.dh * k })
      s.base = {
        contain: toDev(placement(canvas.clientWidth, canvas.clientHeight)),
        cover: toDev(coverPlacement(canvas.clientWidth, canvas.clientHeight)),
      }
      s.F = Math.round(Math.min(W, H) * 0.07)
      s.lastDrawn = -1
    }

    // ---- scroll → frame (piecewise, so each section owns its frame range)
    const getBreaks = () => {
      if (s.breaks) return s.breaks
      const max = ScrollTrigger.maxScroll(window)
      const pts = [[0, 0]]
      for (const [id, frame] of STOPS.slice(1)) {
        const st = ScrollTrigger.getById(id)
        if (st) pts.push([st.start, FRAME_PATH[frame]])
      }
      pts.push([max, 1])
      // keep strictly increasing in scroll position
      s.breaks = pts.filter((p, i) => i === 0 || p[0] > pts[i - 1][0])
      return s.breaks
    }
    const OPEN_PX = 160 // the opening ramp: gentle start, easing into the main curve
    const pathAt = (y) => {
      const b = getBreaks()
      for (let i = 1; i < b.length; i++) {
        if (y <= b[i][0]) {
          const [y0, f0] = b[i - 1]
          const [y1, f1] = b[i]
          let t = (y - y0) / (y1 - y0)
          // hero segment: ease-out so early scroll already shows clear change
          if (i === 1) t = 1 - Math.pow(1 - t, 1.7)
          return f0 + t * (f1 - f0)
        }
      }
      return 1
    }
    const frameAt = (y) => {
      let p = pathAt(y)
      const b = getBreaks()
      // first ~160px: a continuous ramp (frame 1 -> ~4 -> ~8 -> ~13 -> ~18) instead of a jump
      if (y < OPEN_PX && b.length > 1 && b[1][0] > OPEN_PX) p = pathAt(OPEN_PX) * Math.pow(Math.max(y, 0) / OPEN_PX, 1.8)
      return pathToFrame(p)
    }
    // framing mix: the hero keeps the cover-fit for its whole pin, then eases into the page framing
    // while the hero scrolls away and the first section arrives
    const mixAt = (y) => {
      const hero = ScrollTrigger.getById('hero')
      const next = ScrollTrigger.getById('flavours')
      const from = hero ? hero.end : window.innerHeight * 0.4
      const to = next ? next.start : window.innerHeight * 1.1
      if (y <= from) return 1
      if (y >= to || to <= from) return 0
      return 1 - (y - from) / (to - from)
    }
    const reduce = window.matchMedia(REDUCE_QUERY).matches
    if (reduce) proxy.frame = STILL_FRAME
    const sync = (jump) => {
      const y = window.scrollY
      const mix = mixAt(y)
      if (jump) {
        gsap.killTweensOf(proxy)
        if (!reduce) proxy.frame = frameAt(y)
        proxy.mix = mix
      } else {
        if (!reduce) smooth(frameAt(y))
        smoothMix(mix)
      }
    }

    const globalST = ScrollTrigger.create({
      id: 'global-frames',
      trigger: document.documentElement,
      start: 0,
      end: 'max',
      onUpdate: () => sync(false),
    })
    const onRefresh = () => {
      s.breaks = null
      sync(true)
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)

    // ---- background loading (silent) -------------------------------------
    const onFrame = () => {
      s.loaded++
      if (s.loaded === FRAME_COUNT) s.ready = true // all bitmaps resident; safe to rebuild on big resizes
    }

    resizeCanvas()
    loadFrames(s.spec, s.bag, onFrame, s.token)

    // Rebuild bitmaps only when the viewport changed enough to matter.
    let rt
    const onResize = () => {
      resizeCanvas()
      clearTimeout(rt)
      rt = setTimeout(async () => {
        if (!s.ready) return
        const next = buildSpec(canvas)
        const grew = next.bw > s.spec.bw * 1.35
        const reshaped = Math.abs(next.aspect / s.spec.aspect - 1) > 0.06
        const recropped = next.sw !== s.spec.sw
        if (!grew && !reshaped && !recropped) return
        s.token.cancelled = true
        const token = { cancelled: false }
        s.token = token
        s.spec = next
        // upgrade in place: each frame is swapped (and its old bitmap closed) the moment its
        // replacement is decoded, so memory never holds two complete sets
        await loadFrames(next, s.bag, () => { s.lastDrawn = -1 }, token)
      }, 450)
    }
    window.addEventListener('resize', onResize)

    return () => {
      s.dead = true
      s.token.cancelled = true
      clearTimeout(rt)
      gsap.ticker.remove(tick)
      gsap.killTweensOf(proxy)
      globalST.kill()
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      window.removeEventListener('resize', onResize)
      s.bag.forEach((e) => e && e.b.close())
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="bgcanvas" aria-hidden="true" />
      <div className="bgshade" aria-hidden="true" />
    </>
  )
}
