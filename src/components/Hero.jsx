import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, REDUCE_QUERY, scrollToId, vh } from '../lib/gsap'
import MaskText from './MaskText'

// Foreground only: the animated background lives in <FrameBackground />.
export default function Hero() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    // reduced motion: show the finished hero — no intro, no pin
    if (window.matchMedia(REDUCE_QUERY).matches) return

    const ctx = gsap.context(() => {
      gsap.set(q('.hero__eyebrow'), { opacity: 0, y: 14 })
      gsap.set(q('.hero__logo .mask__in'), { yPercent: 140 })
      gsap.set(q('.hero__headline .mask__in'), { yPercent: 140 })
      gsap.set(q('.hero__sub'), { clipPath: 'inset(0 100% 0 0)', opacity: 0, x: -20 })
      gsap.set(q('.hero__cta .btn'), { opacity: 0, y: 28 })
      gsap.set(q('.hero__cue'), { opacity: 0 })
    }, root)

    // intro plays straight away — nothing waits on the frame preload
    const intro = gsap
      .timeline({ delay: 0.1 })
      .to(q('.hero__eyebrow'), { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .to(q('.hero__logo .mask__in'), { yPercent: 0, duration: 1.2, stagger: 0.09, ease: 'power4.out' }, 0.1)
      .to(q('.hero__cue'), { opacity: 1, duration: 0.8 }, '-=0.3')
    const mm = gsap.matchMedia()
    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      // short pin: just long enough for the text to build, then the page flows on
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          id: 'hero',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 0.9 : 1.3),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to(q('.hero__cue'), { opacity: 0, duration: 0.6, ease: 'none' }, 0)
        .to(q('.hero__headline .mask__in'), { yPercent: 0, duration: 1.4, stagger: 0.5, ease: 'power3.out' }, 0.3)
        .to(q('.hero__sub'), { clipPath: 'inset(0 0% 0 0)', opacity: 1, x: 0, duration: 1.4 }, 2.2)
        .to(q('.hero__cta .btn'), { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, 3.4)
        .to({}, { duration: 1.2 }, 4.4)
    })

    return () => {
      intro.kill()
      mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section id="hero" className="hero" ref={rootRef}>
      <div className="hero__scrim" />

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow">Crafted in layers</p>
        <MaskText as="h1" text="LUMA" chars className="hero__logo" />
        <MaskText as="p" text="Layers Worth Savoring." className="hero__headline" />
        <p className="hero__sub">
          A modern take on Falooda — rich, refreshing, and carefully layered from the first sip to the last.
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
    </section>
  )
}
