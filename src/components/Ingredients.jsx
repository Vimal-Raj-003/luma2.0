import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, REDUCE_QUERY, vh } from '../lib/gsap'
import { ingredients } from '../data'
import MaskText from './MaskText'

// Clean readable list: all ingredients stay legible, the active one gets a gold accent.
export default function Ingredients() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY, reduce: REDUCE_QUERY }, (c) => {
      const { mobile, reduce } = c.conditions
      const still = mobile || reduce // no scroll-linked drift on phones or with reduced motion
      const rows = q('.ing__row')
      const names = q('.ing__rowName')
      const bars = q('.ing__bar')
      const descs = q('.ing__rowLine')
      const details = q('.ing__detail p')
      const N = rows.length

      gsap.set(q('.ing__head .mask__in'), { yPercent: 140 })
      gsap.set(q('.ing__eyebrow, .ing__lead'), { opacity: 0, y: 16 })
      gsap.set(names, { yPercent: 140 })
      gsap.set(rows, { opacity: 0 })
      gsap.set(bars, { scaleY: 0 })
      gsap.set(descs, { opacity: 0.7 })
      gsap.set(details, { opacity: 0, y: 12 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          id: 'ingredients',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 2.6 : 3.6),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      const T = 1.2 + N * 0.7 + 0.6

      tl.to(q('.ing__eyebrow'), { opacity: 1, y: 0, duration: 0.6 }, 0)
        .to(q('.ing__head .mask__in'), { yPercent: 0, duration: 1, stagger: 0.12 }, 0.1)
        .to(q('.ing__lead'), { opacity: 1, y: 0, duration: 0.7 }, 0.6)

      // all rows appear (readable), then the highlight travels down the list
      tl.to(rows, { opacity: 0.72, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.8)
        .to(names, { yPercent: 0, duration: 0.7, stagger: 0.08 }, 0.8)

      if (!still) tl.fromTo(q('.ing__list'), { y: 14 }, { y: -14, duration: T, ease: 'none' }, 0)

      rows.forEach((row, i) => {
        const at = 1.5 + i * 0.7
        tl.to(row, { opacity: 1, duration: 0.45, ease: 'power2.out' }, at)
          .to(bars[i], { scaleY: 1, duration: 0.45, ease: 'power2.out' }, at)
          .to(descs[i], { opacity: 1, duration: 0.4 }, at)
          .to(details[i], { opacity: 1, y: 0, duration: 0.5 }, at + 0.1)
        if (i < N - 1) {
          tl.to(row, { opacity: 0.72, duration: 0.4, ease: 'power2.inOut' }, at + 0.65)
            .to(bars[i], { scaleY: 0, duration: 0.35 }, at + 0.65)
            .to(descs[i], { opacity: 0.7, duration: 0.35 }, at + 0.65)
            .to(details[i], { opacity: 0, y: -10, duration: 0.35 }, at + 0.6)
        }
      })
      tl.to({}, { duration: 0.01 }, T)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="ingredients" className="ing" ref={rootRef}>
      <div className="ing__stage">
        <div className="ing__head">
          <p className="eyebrow ing__eyebrow">The ingredient story</p>
          <MaskText as="h2" text="Layered with Intention." className="h-section" />
          <p className="lead ing__lead">
            Every ingredient has a purpose. Every layer brings its own texture, flavour, and character.
          </p>
        </div>

        <ul className="ing__list">
          {ingredients.map((ing) => (
            <li key={ing.name} className="ing__row">
              <span className="ing__bar" aria-hidden="true" />
              <span className="mask">
                <span className="ing__rowName mask__in">{ing.name}</span>
              </span>
              <span className="ing__rowLine">{ing.line}</span>
            </li>
          ))}
        </ul>

        {/* small screens: the active ingredient's description shows here instead */}
        <div className="ing__detail" aria-hidden="true">
          {ingredients.map((ing) => (
            <p key={ing.name}>{ing.line}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
