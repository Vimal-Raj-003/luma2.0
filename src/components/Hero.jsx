import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, scrollToId, vh } from '../lib/gsap'
import { FRAME_COUNT, frameSrc } from '../data'
import MaskText from './MaskText'

const SRC_W = 1920
const SRC_H = 1080
const FOCUS_X = 0.62 // the glass sits ~62% across the frame

// Work out which part of the 16:9 source covers the viewport and how big the
// decoded bitmaps need to be (cropped + downscaled up-front to save memory).
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

export default function Hero() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const loaderRef = useRef(null)
  const engineRef = useRef(null)
  const introRef = useRef(null)

  // ---- text + scroll choreography -------------------------------------
  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)

    const ctx = gsap.context(() => {
      gsap.set(q('.hero__logo .mask__in'), { yPercent: 140 })
      gsap.set(q('.hero__headline .mask__in'), { yPercent: 140 })
      gsap.set(q('.hero__sub'), { clipPath: 'inset(0 100% 0 0)', opacity: 0, x: -20 })
      gsap.set(q('.hero__cta .btn'), { opacity: 0, y: 28 })
      gsap.set(q('.hero__cue'), { opacity: 0 })

      introRef.current = gsap
        .timeline({ paused: true })
        .to(q('.hero__logo .mask__in'), { yPercent: 0, duration: 1.2, stagger: 0.09, ease: 'power4.out' })
        .to(q('.hero__cue'), { opacity: 1, duration: 0.8 }, '-=0.3')
    }, root)

    const mm = gsap.matchMedia()
    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          id: 'hero',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 2.8 : 4.4),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => engineRef.current?.setProgress(self.progress),
        },
      })
      tl.to(q('.hero__cue'), { opacity: 0, duration: 0.6, ease: 'none' }, 0)
        .to(q('.hero__headline .mask__in'), { yPercent: 0, duration: 1.4, stagger: 0.5, ease: 'power3.out' }, 0.5)
        .to(q('.hero__sub'), { clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, duration: 1.5 }, 3.2)
        .to(q('.hero__cta .btn'), { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, 5.2)
        .to(q('.hero__canvasWrap'), { scale: 1.07, duration: 10, ease: 'none' }, 0)
        .fromTo(q('.hero__progress i'), { scaleX: 0 }, { scaleX: 1, duration: 10, ease: 'none' }, 0)
        .to(q('.hero__content'), { yPercent: mobile ? -4 : -6, duration: 3, ease: 'none' }, 7)
    })

    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [])

  // ---- canvas frame engine (no React renders per frame) ---------------
  useEffect(() => {
    const canvas = canvasRef.current
    const c2d = canvas.getContext('2d', { alpha: false })
    const loaderEl = loaderRef.current
    const pctEl = loaderEl.querySelector('[data-pct]')

    const s = {
      bag: new Array(FRAME_COUNT).fill(null),
      spec: buildSpec(canvas),
      target: 0,
      current: 0,
      lastDrawn: -1,
      W: 0,
      H: 0,
      raf: 0,
      last: 0,
      loaded: 0,
      ready: false,
      token: { cancelled: false },
      dead: false,
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const W = Math.round(canvas.clientWidth * dpr)
      const H = Math.round(canvas.clientHeight * dpr)
      if (W === s.W && H === s.H) return
      s.W = canvas.width = W
      s.H = canvas.height = H
      c2d.imageSmoothingQuality = 'high'
      s.lastDrawn = -1
      kick()
    }

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

    const tick = (now) => {
      s.raf = 0
      const dt = Math.min((now - (s.last || now)) / 1000, 0.1)
      s.last = now
      const diff = s.target - s.current
      // frame-rate independent easing toward the scroll position
      if (Math.abs(diff) < 0.02) s.current = s.target
      else s.current += diff * (1 - Math.exp(-dt * 14))
      const idx = Math.round(s.current)
      if (idx !== s.lastDrawn) {
        if (draw(idx)) s.lastDrawn = idx
      }
      if (s.current !== s.target) s.raf = requestAnimationFrame(tick)
      else s.last = 0
    }

    function kick() {
      if (!s.raf && !s.dead) s.raf = requestAnimationFrame(tick)
    }

    engineRef.current = {
      setProgress(p) {
        s.target = p * (FRAME_COUNT - 1)
        kick()
      },
    }

    const finishLoad = () => {
      if (s.ready) return
      s.ready = true
      loaderEl.classList.add('is-done')
      document.documentElement.classList.remove('is-loading')
      introRef.current?.play()
      window.dispatchEvent(new Event('resize')) // let ScrollTrigger re-measure
    }

    const onFrame = (i) => {
      s.loaded++
      if (i === 0 || s.lastDrawn === -1) kick()
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
        kick()
        old.forEach((b) => b && b.close())
      }, 450)
    }
    window.addEventListener('resize', onResize)

    return () => {
      s.dead = true
      s.token.cancelled = true
      cancelAnimationFrame(s.raf)
      clearTimeout(rt)
      window.removeEventListener('resize', onResize)
      document.documentElement.classList.remove('is-loading')
      s.bag.forEach((b) => b && b.close())
      engineRef.current = null
    }
  }, [])

  return (
    <section id="hero" className="hero" ref={rootRef}>
      <div className="hero__canvasWrap">
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
      </div>
      <div className="hero__scrim" />

      <div className="hero__content">
        <MaskText as="h1" text="LUMA" chars className="hero__logo" />
        <MaskText as="p" text="Layers of Happiness." className="hero__headline" />
        <p className="hero__sub">
          A rich, refreshing Falooda layered with flavour, texture and joy.
        </p>
        <div className="hero__cta">
          <a
            className="btn btn--primary"
            href="#flavours"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('flavours')
            }}
          >
            Explore Flavours
          </a>
          <a
            className="btn btn--ghost"
            href="#cta"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('cta')
            }}
          >
            Order Now
          </a>
        </div>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
      <div className="hero__progress" aria-hidden="true">
        <i />
      </div>

      <div className="loader" ref={loaderRef} role="status" aria-live="polite">
        <div className="loader__logo">LUMA</div>
        <div className="loader__bar">
          <span data-pct>0</span>%
        </div>
      </div>
    </section>
  )
}
