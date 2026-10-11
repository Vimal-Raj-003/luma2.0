import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, vh } from '../lib/gsap'
import { whyLuma } from '../data'

const pad = (n) => String(n).padStart(2, '0')

export default function WhyLuma() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      const N = whyLuma.length
      const bgs = q('.why__bg')
      const words = q('.why__word')
      const panels = q('.why__panel')
      const frames = q('.why__frame')
      const imgs = q('.why__frame img')
      const dots = q('.why__dot i')
      const lines = (p) => p.querySelectorAll('.mask__in')
      const body = (p) => p.querySelectorAll('.why__body')

      gsap.set(bgs.slice(1), { opacity: 0 })
      gsap.set(words.slice(1), { opacity: 0 })
      gsap.set(words[0], { opacity: 1 })
      gsap.set(panels.slice(1), { visibility: 'hidden' })
      panels.forEach((p) => {
        gsap.set(lines(p), { yPercent: 140 })
        gsap.set(body(p), { opacity: 0, y: 24 })
      })
      gsap.set(frames.slice(1), { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 24px 24px)' })
      gsap.set(frames[0], { clipPath: 'inset(14% 14% 14% 14% round 999px 999px 24px 24px)' })
      gsap.set(imgs, { scale: 1.4 })
      gsap.set(dots, { scaleX: 0 })

      gsap.fromTo(
        q('.why__stage'),
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
          id: 'why',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 3.8 : 5.2),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      const hold = 0.9
      const step = 1.7
      const tk = (k) => hold + (k - 1) * step
      const total = hold + (N - 1) * step + 0.9

      // first panel builds in as the pin starts
      tl.to(lines(panels[0]), { yPercent: 0, duration: 0.8, stagger: 0.1 }, 0)
        .to(body(panels[0]), { opacity: 1, y: 0, duration: 0.6 }, 0.35)
        .to(frames[0], { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 24px 24px)', duration: 0.9 }, 0)
        .to(imgs[0], { scale: 1, duration: 1.1 }, 0)
        .to(dots[0], { scaleX: 1, duration: 0.5, ease: 'none' }, 0.2)

      // constant drift: depth between giant type, image and background
      tl.fromTo(q('.why__media'), { y: 36 }, { y: -36, duration: total, ease: 'none' }, 0)
        .fromTo(words, { xPercent: 8 }, { xPercent: -14, duration: total, ease: 'none' }, 0)

      for (let k = 1; k < N; k++) {
        const t = tk(k)
        const d = 0.9
        tl.set(panels[k], { visibility: 'visible' }, t)
          .to(bgs[k], { opacity: 1, duration: d, ease: 'none' }, t)
          .to(words[k - 1], { opacity: 0, duration: d * 0.6, ease: 'none' }, t)
          .to(words[k], { opacity: 1, duration: d * 0.8, ease: 'none' }, t + 0.1)
          .to(lines(panels[k - 1]), { yPercent: -140, duration: 0.55, stagger: 0.07, ease: 'power3.in' }, t)
          .to(body(panels[k - 1]), { opacity: 0, y: -20, duration: 0.4 }, t)
          .to(lines(panels[k]), { yPercent: 0, duration: 0.75, stagger: 0.1 }, t + 0.35)
          .to(body(panels[k]), { opacity: 1, y: 0, duration: 0.6 }, t + 0.6)
          .to(frames[k], { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 24px 24px)', duration: 1.1, ease: 'power2.inOut' }, t)
          .to(imgs[k], { scale: 1, duration: 1.3 }, t)
          .to(imgs[k - 1], { scale: 1.18, duration: 1.2, ease: 'none' }, t)
          .to(dots[k], { scaleX: 1, duration: 0.5, ease: 'none' }, t + 0.3)
          .set(panels[k - 1], { visibility: 'hidden' }, t + 0.7)
      }
      tl.to({}, { duration: 0.01 }, total)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="why" className="why" ref={rootRef}>
      <div className="why__stage">
        <div className="why__bgs" aria-hidden="true">
          {whyLuma.map((w) => (
            <div key={w.word} className="why__bg" style={{ background: w.bg }} />
          ))}
        </div>

        <div className="why__words" aria-hidden="true">
          {whyLuma.map((w) => (
            <span key={w.word} className="why__word">
              {w.word}
            </span>
          ))}
        </div>

        <div className="why__panels">
          {whyLuma.map((w, i) => (
            <article key={w.word} className="why__panel">
              <p className="eyebrow why__body">
                {pad(i + 1)} / {pad(whyLuma.length)} &nbsp;Why LUMA
              </p>
              <h2 className="why__title" aria-label={w.title.join(' ')}>
                {w.title.map((line) => (
                  <span key={line} className="mask" aria-hidden="true">
                    <span className="mask__in">{line}</span>
                  </span>
                ))}
              </h2>
              <p className="why__text why__body">{w.text}</p>
            </article>
          ))}
        </div>

        <div className="why__media">
          {whyLuma.map((w) => (
            <div key={w.word} className="why__frame">
              <img src={w.img} alt="" loading="lazy" decoding="async" style={{ objectPosition: w.pos }} draggable="false" />
            </div>
          ))}
        </div>

        <div className="why__dots" aria-hidden="true">
          {whyLuma.map((w) => (
            <span key={w.word} className="why__dot">
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
