import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { FRAME_COUNT, frameSrc } from '../data'

const SRC_W = 1920
const SRC_H = 1080
const FOCUS_X = 0.62 // the glass sits ~62% across the frame
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

function buildSpec(el) {
  const cw = el.clientWidth || window.innerWidth
  const ch = el.clientHeight || window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const aspect = cw / ch
  let sx = 0, sy = 0, sw = SRC_W, sh = SRC_H
  if (aspect < SRC_W / SRC_H) {
    sw = Math.round(SRC_H * aspect)
    sx = Math.min(Math.max(FOCUS_X * SRC_W - sw / 2, 0), SRC_W - sw)
  } else {
    sh = Math.round(SRC_W / aspect)
    sy = Math.round((SRC_H - sh) / 2)
  }
  const bw = Math.min(sw, Math.round(cw * dpr), 1280)
  const k = bw / sw
  return { sx: Math.round(sx), sy, sw, sh, bw, bh: Math.round(sh * k), aspect }
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
    }
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
      const k = Math.max(s.W / bmp.width, s.H / bmp.height)
      const dw = bmp.width * k
      const dh = bmp.height * k
      c2d.drawImage(bmp, (s.W - dw) / 2, (s.H - dh) / 2, dw, dh)
      return true
    }
    const tick = () => {
      const idx = Math.min(LAST, Math.max(0, Math.round(proxy.frame)))
      if (idx !== s.lastDrawn && draw(idx)) s.lastDrawn = idx
    }
    gsap.ticker.add(tick)

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const W = Math.round(canvas.clientWidth * dpr)
      const H = Math.round(canvas.clientHeight * dpr)
      if (W === s.W && H === s.H) return
      s.W = canvas.width = W
      s.H = canvas.height = H
      c2d.imageSmoothingQuality = 'high'
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
