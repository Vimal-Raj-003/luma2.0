import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, REDUCE_QUERY, vh } from '../lib/gsap'
import { quotes } from '../data'
import MaskText from './MaskText'

// One editorial quote at a time, set large over the live frames.
export default function Testimonials() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY, reduce: REDUCE_QUERY }, (c) => {
      const { mobile, reduce } = c.conditions
      const still = mobile || reduce // no scroll-linked drift on phones or with reduced motion
      const items = q('.tst__q')
      const words = (el) => el.querySelectorAll('.mask__in')
      const cap = (el) => el.querySelectorAll('.tst__cap')
      const N = items.length

      gsap.set(items.slice(1), { visibility: 'hidden' })
      gsap.set(q('.tst__eyebrow'), { opacity: 0, y: 14 })
      items.forEach((el) => {
        gsap.set(words(el), { yPercent: 140 })
        gsap.set(cap(el), { opacity: 0, y: 14 })
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          id: 'testimonials',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 2 : 2.6),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      const hold = 1.4
      const step = 1.8
      const total = hold + (N - 1) * step + 0.6

      tl.to(q('.tst__eyebrow'), { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(words(items[0]), { yPercent: 0, duration: 0.9, stagger: 0.04 }, 0.1)
        .to(cap(items[0]), { opacity: 1, y: 0, duration: 0.6 }, 0.9)

      if (!still) tl.fromTo(q('.tst__stack'), { y: 14 }, { y: -14, duration: total, ease: 'none' }, 0)

      for (let k = 1; k < N; k++) {
        const t = hold + (k - 1) * step
        tl.to(words(items[k - 1]), { yPercent: -140, duration: 0.6, stagger: 0.02, ease: 'power3.in' }, t)
          .to(cap(items[k - 1]), { opacity: 0, y: -12, duration: 0.4 }, t)
          .set(items[k], { visibility: 'visible' }, t + 0.5)
          .to(words(items[k]), { yPercent: 0, duration: 0.9, stagger: 0.04 }, t + 0.7)
          .to(cap(items[k]), { opacity: 1, y: 0, duration: 0.6 }, t + 1.4)
          .set(items[k - 1], { visibility: 'hidden' }, t + 0.7)
      }
      tl.to({}, { duration: 0.01 }, total)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="stories" className="tst" ref={rootRef}>
      <div className="tst__stage">
        <p className="eyebrow tst__eyebrow">Guest notes</p>
        <div className="tst__stack">
          {quotes.map((t) => (
            <figure key={t.name} className="tst__q">
              <MaskText as="blockquote" text={`“${t.quote}”`} className="tst__text" />
              <figcaption className="tst__cap">— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
