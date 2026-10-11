import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, REDUCE_QUERY, vh } from '../lib/gsap'
import { whyLuma } from '../data'
import MaskText from './MaskText'

const pad = (n) => String(n).padStart(2, '0')

// A persistent headline with four points that take the stage one at a time.
export default function WhyLuma() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY, reduce: REDUCE_QUERY }, (c) => {
      const { mobile, reduce } = c.conditions
      const still = mobile || reduce // no scroll-linked drift on phones or with reduced motion
      const N = whyLuma.length
      const tints = q('.why__tint')
      const panels = q('.why__panel')
      const lines = (p) => p.querySelectorAll('.mask__in')
      const body = (p) => p.querySelectorAll('.why__body')

      gsap.set(tints.slice(1), { opacity: 0 })
      gsap.set(panels.slice(1), { visibility: 'hidden' })
      gsap.set(q('.why__head .mask__in'), { yPercent: 140 })
      gsap.set(q('.why__eyebrow'), { opacity: 0, y: 16 })
      panels.forEach((p) => {
        gsap.set(lines(p), { yPercent: 140 })
        gsap.set(body(p), { opacity: 0, y: 20 })
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          id: 'why',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 2.4 : 3.2),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      const hold = 1.2
      const step = 1.4
      const tk = (k) => hold + (k - 1) * step
      const total = hold + (N - 1) * step + 0.8

      tl.to(q('.why__eyebrow'), { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(q('.why__head .mask__in'), { yPercent: 0, duration: 0.9, stagger: 0.1 }, 0.1)
        .to(lines(panels[0]), { yPercent: 0, duration: 0.8 }, 0.5)
        .to(body(panels[0]), { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.7)

      if (!still) tl.fromTo(q('.why__pos'), { y: 14 }, { y: -14, duration: total, ease: 'none' }, 0)

      for (let k = 1; k < N; k++) {
        const t = tk(k)
        tl.set(panels[k], { visibility: 'visible' }, t)
          .to(tints[k], { opacity: 1, duration: 0.9, ease: 'none' }, t)
          .to(tints[k - 1], { opacity: 0, duration: 0.9, ease: 'none' }, t)
          .to(lines(panels[k - 1]), { yPercent: -140, duration: 0.5, ease: 'power3.in' }, t)
          .to(body(panels[k - 1]), { opacity: 0, y: -16, duration: 0.4 }, t)
          .to(lines(panels[k]), { yPercent: 0, duration: 0.75 }, t + 0.35)
          .to(body(panels[k]), { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, t + 0.55)
          .set(panels[k - 1], { visibility: 'hidden' }, t + 0.6)
      }
      tl.to({}, { duration: 0.01 }, total)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="why" className="why" ref={rootRef}>
      <div className="why__stage">
        <div className="why__tints" aria-hidden="true">
          {whyLuma.map((w) => (
            <div key={w.title} className="why__tint" style={{ background: w.tint }} />
          ))}
        </div>

        <div className="why__head">
          <p className="eyebrow why__eyebrow">Why LUMA</p>
          <MaskText as="h2" text="Thoughtful in Every Layer." className="h-section" />
        </div>

        <div className="why__pos">
          {whyLuma.map((w, i) => (
            <article key={w.title} className="why__panel">
              <p className="eyebrow why__body">
                {pad(i + 1)} / {pad(whyLuma.length)}
              </p>
              <h3 className="why__title mask">
                <span className="mask__in">{w.title}</span>
              </h3>
              <p className="why__text why__body">{w.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
