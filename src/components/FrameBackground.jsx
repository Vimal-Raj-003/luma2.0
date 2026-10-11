import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { FRAME_COUNT, frameSrc } from '../data'

const SRC_W = 1920
const SRC_H = 1080
const LAST = FRAME_COUNT - 1

// Where each part of the page sits in the frame sequence (fraction of frames).
// Scroll positions come from the sections' own ScrollTriggers.
const STOPS = [
  ['hero', 0],
  ['flavours', 0.2],
  ['ingredients', 0.4],
  ['why', 0.6],
  ['approach', 0.74],
  ['testimonials', 0.84],
  ['cta', 0.92],
]

// Contain-style framing. The glass (plus scoop and splash) occupies a fixed box in
// the source frame; that box is fitted into a "safe rectangle" of the viewport so the
// whole product stays visible at every size. Leftover space is filled by a soft,
// blurred copy of the same frame (see draw()).
const BOX = { x0: 860, x1: 1520, y0: 40, y1: 1040 }
const BOX_CX = 1190
const BOX_CY = 540

function placement(cw, ch) {
  const mobile = cw <= 900
  const safe = mobile
    ? { x0: cw * 0.06, x1: cw * 0.94, y0: ch * 0.22, y1: ch * 0.7 } // text lives below, heading above
    : { x0: cw * 0.42, x1: cw * 0.97, y0: 84, y1: ch - 28 } // product right of centre, clear of the nav
  const sc = Math.min((safe.x1 - safe.x0) / (BOX.x1 - BOX.x0), (safe.y1 - safe.y0) / (BOX.y1 - BOX.y0))
  const dw = SRC_W * sc
  const dh = SRC_H * sc
  let left = (safe.x0 + safe.x1) / 2 - BOX_CX * sc
  let top = (safe.y0 + safe.y1) / 2 - BOX_CY * sc
  // keep the frame inside the viewport when it is smaller, centred-in-range when larger
  left = dw <= cw ? Math.min(Math.max(left, 0), cw - dw) : Math.min(Math.max(left, cw - dw), 0)
  top = dh <= ch ? Math.min(Math.max(top, 0), ch - dh) : Math.min(Math.max(top, ch - dh), 0)
  return { left, top, dw, dh }
}

function buildSpec(el) {
  const cw = el.clientWidth || window.innerWidth
  const ch = el.clientHeight || window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const p = placement(cw, ch)
  const cap = cw <= 900 ? 960 : 1280
  const bw = Math.min(SRC_W, cap, Math.max(320, Math.round(p.dw * dpr)))
  return { sx: 0, sy: 0, sw: SRC_W, sh: SRC_H, bw, bh: Math.round((bw * SRC_H) / SRC_W), aspect: cw / ch }
}

async function loadFrames(spec, bag, onFrame, token) {
  let next = 0
  const worker = async () => {
    while (next < FRAME_COUNT && !token.cancelled) {
      const i = next++
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
        if (token.cancelled) bmp.close()
        else bag[i] = bmp
      } catch {
        /* a missing frame is covered by its nearest neighbour at draw time */
      }
      onFrame(i)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
}

// ONE fixed canvas behind the whole page. A single ScrollTrigger maps the full
// document scroll to a proxy `frame` value; a ticker redraws only when the
// rounded frame index changes. Nothing here touches React state.
export default function FrameBackground() {
  const canvasRef = useRef(null)
  const loaderRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const c2d = canvas.getContext('2d', { alpha: false })
    const loaderEl = loaderRef.current
    const pctEl = loaderEl.querySelector('[data-pct]')

    const s = {
      bag: new Array(FRAME_COUNT).fill(null),
      spec: buildSpec(canvas),
      W: 0,
      H: 0,
      lastDrawn: -1,
      loaded: 0,
      ready: false,
      token: { cancelled: false },
      dead: false,
      breaks: null,
      pl: { left: 0, top: 0, dw: 0, dh: 0, feather: false },
    }
    const tiny = document.createElement('canvas')
    tiny.width = 96
    tiny.height = 54
    const tinyCtx = tiny.getContext('2d')
    const tmp = document.createElement('canvas')
    const tmpCtx = tmp.getContext('2d')
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d')
    const proxy = { frame: 0 }
    const smooth = gsap.quickTo(proxy, 'frame', { duration: 0.7, ease: 'power3.out' })

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
      const bmp = nearest(i)
      if (!bmp) return false
      const { left, top, dw, dh, feather } = s.pl
      // soft backdrop: tiny copy of the frame, stretched to cover (reads as blur)
      tinyCtx.drawImage(bmp, 0, 0, tiny.width, tiny.height)
      const k = Math.max(s.W / tiny.width, s.H / tiny.height)
      c2d.imageSmoothingEnabled = true
      c2d.drawImage(tiny, (s.W - tiny.width * k) / 2, (s.H - tiny.height * k) / 2, tiny.width * k, tiny.height * k)
      // keep the backdrop ambient, not a second product
      c2d.fillStyle = 'rgba(14, 5, 8, 0.62)'
      c2d.fillRect(0, 0, s.W, s.H)
      // sharp, fully framed product
      if (feather) {
        tmpCtx.globalCompositeOperation = 'source-over'
        tmpCtx.clearRect(0, 0, tmp.width, tmp.height)
        tmpCtx.drawImage(bmp, 0, 0, tmp.width, tmp.height)
        tmpCtx.globalCompositeOperation = 'destination-in'
        tmpCtx.drawImage(mask, 0, 0)
        c2d.drawImage(tmp, left, top)
      } else {
        c2d.drawImage(bmp, left, top, dw, dh)
      }
      return true
    }
    const tick = () => {
      const idx = Math.min(LAST, Math.max(0, Math.round(proxy.frame)))
      if (idx !== s.lastDrawn && draw(idx)) s.lastDrawn = idx
    }
    gsap.ticker.add(tick)
    if (import.meta.env.DEV) window.__lumaFrame = () => [proxy.frame, s.lastDrawn] // dev-only debugging hook

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const W = Math.round(canvas.clientWidth * dpr)
      const H = Math.round(canvas.clientHeight * dpr)
      if (W === s.W && H === s.H) return
      s.W = canvas.width = W
      s.H = canvas.height = H
      c2d.imageSmoothingQuality = 'high'
      // placement in device pixels
      const p = placement(canvas.clientWidth, canvas.clientHeight)
      const k = W / canvas.clientWidth
      const pl = { left: p.left * k, top: p.top * k, dw: p.dw * k, dh: p.dh * k }
      const F = Math.round(Math.min(W, H) * 0.07)
      const fl = pl.left > 1 ? F : 0
      const fr = pl.left + pl.dw < W - 1 ? F : 0
      const ft = pl.top > 1 ? F : 0
      const fb = pl.top + pl.dh < H - 1 ? F : 0
      pl.feather = fl || fr || ft || fb
      s.pl = pl
      if (pl.feather) {
        const mw = Math.max(1, Math.round(pl.dw))
        const mh = Math.max(1, Math.round(pl.dh))
        tmp.width = mask.width = mw
        tmp.height = mask.height = mh
        mctx.globalCompositeOperation = 'source-over'
        mctx.clearRect(0, 0, mw, mh)
        mctx.fillStyle = '#fff'
        mctx.fillRect(0, 0, mw, mh)
        mctx.globalCompositeOperation = 'destination-in'
        const ramp = (horizontal, a, b) => {
          const len = horizontal ? mw : mh
          const g = horizontal ? mctx.createLinearGradient(0, 0, mw, 0) : mctx.createLinearGradient(0, 0, 0, mh)
          g.addColorStop(0, a ? 'rgba(0,0,0,0)' : '#000')
          if (a) g.addColorStop(Math.min(a / len, 0.49), '#000')
          if (b) g.addColorStop(Math.max(1 - b / len, 0.51), '#000')
          g.addColorStop(1, b ? 'rgba(0,0,0,0)' : '#000')
          mctx.fillStyle = g
          mctx.fillRect(0, 0, mw, mh)
        }
        if (fl || fr) ramp(true, fl, fr)
        if (ft || fb) ramp(false, ft, fb)
      }
      s.lastDrawn = -1
    }

    // ---- scroll → frame (piecewise, so each section owns its frame range)
    const getBreaks = () => {
      if (s.breaks) return s.breaks
      const max = ScrollTrigger.maxScroll(window)
      const pts = [[0, 0]]
      for (const [id, f] of STOPS.slice(1)) {
        const st = ScrollTrigger.getById(id)
        if (st) pts.push([st.start, f])
      }
      pts.push([max, 1])
      // keep strictly increasing in scroll position
      s.breaks = pts.filter((p, i) => i === 0 || p[0] > pts[i - 1][0])
      return s.breaks
    }
    const frameAt = (y) => {
      const b = getBreaks()
      for (let i = 1; i < b.length; i++) {
        if (y <= b[i][0]) {
          const [y0, f0] = b[i - 1]
          const [y1, f1] = b[i]
          return (f0 + ((y - y0) / (y1 - y0)) * (f1 - f0)) * LAST
        }
      }
      return LAST
    }
    const sync = (jump) => {
      const target = frameAt(window.scrollY)
      if (jump) {
        gsap.killTweensOf(proxy)
        proxy.frame = target
      } else smooth(target)
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

    // ---- loading --------------------------------------------------------
    const finishLoad = () => {
      if (s.ready) return
      s.ready = true
      loaderEl.classList.add('is-done')
      document.documentElement.classList.remove('is-loading')
      window.__lumaReady = true
      window.dispatchEvent(new Event('luma:ready'))
      ScrollTrigger.refresh()
    }
    const onFrame = () => {
      s.loaded++
      pctEl.textContent = Math.round((s.loaded / FRAME_COUNT) * 100)
      if (s.loaded === FRAME_COUNT) finishLoad()
    }

    document.documentElement.classList.add('is-loading')
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
        if (!grew && !reshaped) return
        s.token.cancelled = true
        const token = { cancelled: false }
        s.token = token
        const bag = new Array(FRAME_COUNT).fill(null)
        await loadFrames(next, bag, () => {}, token)
        if (token.cancelled || s.dead) return
        const old = s.bag
        s.bag = bag
        s.spec = next
        s.lastDrawn = -1
        old.forEach((b) => b && b.close())
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
      document.documentElement.classList.remove('is-loading')
      s.bag.forEach((b) => b && b.close())
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="bgcanvas" aria-hidden="true" />
      <div className="bgshade" aria-hidden="true" />
      <div className="loader" ref={loaderRef} role="status" aria-live="polite">
        <div className="loader__logo">LUMA</div>
        <div className="loader__bar">
          <span data-pct>0</span>%
        </div>
      </div>
    </>
  )
}
