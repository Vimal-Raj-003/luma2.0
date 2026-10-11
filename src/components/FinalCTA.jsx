import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, vh } from '../lib/gsap'
import MaskText from './MaskText'

export default function FinalCTA() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions

      gsap.set(q('.cta__title .mask__in'), { yPercent: 140 })
      gsap.set(q('.cta__eyebrow'), { opacity: 0, y: 20 })
      gsap.set(q('.cta__text'), { opacity: 0, y: 24 })
      gsap.set(q('.cta__btn'), { opacity: 0, y: 30, scale: 0.94 })
      gsap.set(q('.cta__glow'), { scale: 0.5, opacity: 0 })

      gsap.fromTo(
        q('.cta__stage'),
        { clipPath: 'inset(7% 5% round 36px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true },
        },
      )

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          id: 'cta',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 1.8 : 2.4),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.fromTo(q('.cta__bg img'), { scale: 1 }, { scale: mobile ? 1.18 : 1.3, duration: 6, ease: 'none' }, 0)
        .fromTo(q('.cta__shade'), { opacity: 0.85 }, { opacity: 0.45, duration: 2.5, ease: 'none' }, 0)
        .to(q('.cta__glow'), { scale: 1.15, opacity: 1, duration: 3, ease: 'power2.out' }, 0)
        .to(q('.cta__eyebrow'), { opacity: 1, y: 0, duration: 0.8 }, 0.2)
        .to(q('.cta__title .mask__in'), { yPercent: 0, duration: 1.1, stagger: 0.18 }, 0.4)
        .to(q('.cta__text'), { opacity: 1, y: 0, duration: 0.9 }, 1.7)
        .to(q('.cta__btn'), { opacity: 1, y: 0, scale: 1, duration: 0.9 }, 2.2)
        .to(q('.cta__glow'), { scale: 1.35, duration: 3, ease: 'none' }, 3)
        .to({}, { duration: 0.01 }, 6)
    }, root)

    return () => mm.revert()
  }, [])

  // particles: lightweight 2D canvas, only runs while the section is on screen
  useEffect(() => {
    const cv = canvasRef.current
    const ctx = cv.getContext('2d')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const mobile = window.matchMedia(MOBILE_QUERY).matches
    const count = mobile ? 24 : 55
    let W = 0
    let H = 0
    let raf = 0
    let last = 0
    let parts = []

    const spawn = (initial) => ({
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 10,
      r: 1 + Math.random() * 2.6,
      v: 12 + Math.random() * 34, // px / second
      ph: Math.random() * Math.PI * 2,
      sw: 6 + Math.random() * 18,
      a: 0.25 + Math.random() * 0.55,
      hue: Math.random() < 0.7 ? '255,205,130' : '255,140,165',
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      parts = Array.from({ length: count }, () => spawn(true))
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - (last || now)) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, W, H)
      for (const p of parts) {
        p.y -= p.v * dt
        p.ph += dt * 1.2
        const x = p.x + Math.sin(p.ph) * p.sw
        if (p.y < -10) Object.assign(p, spawn(false))
        const fade = Math.min(1, (H - p.y) / 120, p.y / 120 + 0.2)
        ctx.fillStyle = `rgba(${p.hue},${(p.a * 0.25 * fade).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, p.y, p.r * 3, 0, 6.2832)
        ctx.fill()
        ctx.fillStyle = `rgba(${p.hue},${(p.a * fade).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, p.y, p.r, 0, 6.2832)
        ctx.fill()
      }
    }

    const start = () => {
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    resize()
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 })
    io.observe(cv)
    window.addEventListener('resize', resize)
    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="cta" className="cta" ref={rootRef}>
      <div className="cta__stage">
        <div className="cta__bg" aria-hidden="true">
          <img src="/hero_frames/ezgif-frame-120.jpg" alt="" loading="lazy" decoding="async" draggable="false" />
        </div>
        <div className="cta__shade" aria-hidden="true" />
        <div className="cta__glow" aria-hidden="true" />
        <canvas ref={canvasRef} className="cta__particles" aria-hidden="true" />

        <div className="cta__content">
          <p className="eyebrow cta__eyebrow">Your turn</p>
          <MaskText as="h2" text="One More Layer of Happiness." className="cta__title" />
          <p className="cta__text">Six flavours. Seven layers. One glass you will think about all week.</p>
          <a
            className="btn btn--primary btn--lg cta__btn"
            href="#footer"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
            }}
          >
            Order Your LUMA
          </a>
        </div>
      </div>
    </section>
  )
}
