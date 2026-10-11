import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY } from '../lib/gsap'
import { testimonials } from '../data'
import MaskText from './MaskText'

export default function Testimonials() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      const track = q('.tst__track')[0]
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)

      gsap.set(q('.tst__title .mask__in'), { yPercent: 140 })

      // vertical scroll → horizontal travel
      const slide = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          id: 'testimonials',
          trigger: root,
          start: 'top top',
          end: () => `+=${Math.round(dist() * (mobile ? 0.85 : 1))}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      gsap.fromTo(
        q('.tst__stage'),
        { clipPath: 'inset(7% 5% round 36px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true },
        },
      )

      gsap.to(q('.tst__title .mask__in'), {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 40%', toggleActions: 'play none none reverse' },
      })

      // progress bar
      gsap.fromTo(
        q('.tst__progress i'),
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } },
      )

      // parallax inside the horizontal move (relative to the track motion)
      q('.tst__card').forEach((card, i) => {
        const img = card.querySelector('img')
        const mark = card.querySelector('.tst__mark')
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: mobile ? -6 : -14, scale: 1.25 },
            {
              xPercent: mobile ? 6 : 14,
              scale: 1.25,
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
            },
          )
        }
        gsap.fromTo(
          mark,
          { x: 60 },
          { x: -60, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true } },
        )
        gsap.fromTo(
          card,
          { opacity: 0.35, scale: 0.94 },
          {
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 95%', end: 'left 55%', scrub: true },
          },
        )
        void i
      })

      gsap.to(q('.tst__bigword'), {
        x: () => -dist() * 0.35,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
      })
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="stories" className="tst" ref={rootRef}>
      <div className="tst__stage">
        <div className="tst__bigword" aria-hidden="true">
          LOVED · LOVED · LOVED
        </div>
        <div className="tst__glow" aria-hidden="true" />

        <div className="tst__track">
          <div className="tst__intro">
            <p className="eyebrow">Stories from the table</p>
            <MaskText as="h2" text="Loved, layer by layer." className="tst__title" />
            <p className="tst__hint" aria-hidden="true">
              Keep scrolling <span>→</span>
            </p>
          </div>

          {testimonials.map((t) => (
            <figure key={t.name} className={`tst__card${t.img ? ' has-img' : ''}`}>
              {t.img && (
                <div className="tst__photo">
                  <img src={t.img} alt="" loading="lazy" decoding="async" style={{ objectPosition: t.pos }} draggable="false" />
                </div>
              )}
              <span className="tst__mark" aria-hidden="true">
                “
              </span>
              <div className="tst__stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </figcaption>
            </figure>
          ))}
          <div className="tst__end" aria-hidden="true" />
        </div>

        <div className="tst__progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  )
}
