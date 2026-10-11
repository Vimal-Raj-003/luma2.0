import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, vh } from '../lib/gsap'
import MaskText from './MaskText'

// Short brand statement. One brief pin, then the page flows on.
export default function Approach() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      gsap.set(q('.apr__title .mask__in'), { yPercent: 140 })
      gsap.set(q('.apr__eyebrow, .apr__lead, .apr__note'), { opacity: 0, y: 18 })

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            id: 'approach',
            trigger: root,
            start: 'top top',
            end: vh(mobile ? 1.2 : 1.5),
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to(q('.apr__eyebrow'), { opacity: 1, y: 0, duration: 0.5 }, 0)
        .to(q('.apr__title .mask__in'), { yPercent: 0, duration: 0.9, stagger: 0.12 }, 0.1)
        .to(q('.apr__lead'), { opacity: 1, y: 0, duration: 0.7 }, 0.8)
        .to(q('.apr__note'), { opacity: 1, y: 0, duration: 0.7 }, 1.3)
        .fromTo(q('.apr__block'), { y: 16 }, { y: -16, duration: 2.6, ease: 'none' }, 0)
        .to({}, { duration: 0.01 }, 2.6)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="story" className="apr" ref={rootRef}>
      <div className="apr__stage">
        <div className="apr__block">
          <p className="eyebrow apr__eyebrow">Our approach</p>
          <MaskText as="h2" text="More Than a Drink." className="h-section apr__title" />
          <p className="lead apr__lead">
            LUMA brings together texture, temperature, colour, and flavour in one layered experience.
          </p>
          <p className="apr__note">Simple ingredients. Carefully composed.</p>
        </div>
      </div>
    </section>
  )
}
