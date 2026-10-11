import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, REDUCE_QUERY, vh } from '../lib/gsap'
import { flavours } from '../data'
import MaskText from './MaskText'

const pad = (n) => String(n).padStart(2, '0')

// Typography + a small glass panel only — the global frames stay the hero visual.
export default function Flavours() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY, reduce: REDUCE_QUERY }, (c) => {
      const { mobile, reduce } = c.conditions
      const still = mobile || reduce // no scroll-linked drift on phones or with reduced motion
      const N = flavours.length
      const tints = q('.flv__tint')
      const names = q('.flv__name .mask__in')
      const descs = q('.flv__desc')
      const nums = q('.flv__num')
      const items = q('.flv__item')

      gsap.set(tints.slice(1), { opacity: 0 })
      gsap.set(names.slice(1), { yPercent: 140 })
      gsap.set(nums.slice(1), { yPercent: 140 })
      gsap.set(descs.slice(1), { opacity: 0, y: 20 })
      gsap.set(items, { opacity: 0.6 })
      gsap.set(items[0], { opacity: 1 })
      gsap.set(q('.flv__head .mask__in'), { yPercent: 140 })
      gsap.set(q('.flv__eyebrow, .flv__lead'), { opacity: 0, y: 16 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          id: 'flavours',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 2.8 : 3.8),
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      tl.to(q('.flv__eyebrow'), { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .to(q('.flv__head .mask__in'), { yPercent: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.1)
        .to(q('.flv__lead'), { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5)

      if (!still) tl.fromTo(q('.flv__panel'), { y: 16 }, { y: -16, duration: N, ease: 'none' }, 0)

      for (let k = 1; k < N; k++) {
        const t = k - 0.3
        const d = 0.6
        tl.to(tints[k], { opacity: 1, duration: d, ease: 'none' }, t)
          .to(tints[k - 1], { opacity: 0, duration: d, ease: 'none' }, t)
          .to(names[k - 1], { yPercent: -140, duration: d * 0.8, ease: 'power3.in' }, t)
          .to(names[k], { yPercent: 0, duration: d * 0.85, ease: 'power3.out' }, t + d * 0.25)
          .to(nums[k - 1], { yPercent: -140, duration: d * 0.8, ease: 'power3.in' }, t)
          .to(nums[k], { yPercent: 0, duration: d * 0.85, ease: 'power3.out' }, t + d * 0.25)
          .to(descs[k - 1], { opacity: 0, y: -16, duration: d * 0.5 }, t)
          .to(descs[k], { opacity: 1, y: 0, duration: d * 0.7 }, t + d * 0.35)
          .to(items[k - 1], { opacity: 0.6, duration: d * 0.6 }, t)
          .to(items[k], { opacity: 1, duration: d * 0.6 }, t + d * 0.2)
          .to(q('.flv__marker'), mobile ? { xPercent: k * 100, duration: d } : { yPercent: k * 100, duration: d }, t)
      }
      tl.to({}, { duration: 0.01 }, N)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="flavours" className="flv" ref={rootRef}>
      <div className="flv__stage">
        <div className="flv__tints" aria-hidden="true">
          {flavours.map((f) => (
            <div key={f.name} className="flv__tint" style={{ background: f.tint }} />
          ))}
        </div>

        <div className="flv__head">
          <p className="eyebrow flv__eyebrow">Find your flavour</p>
          <MaskText as="h2" text="A Mood for Every Craving." className="h-section" />
          <p className="lead flv__lead">
            From fruity and fresh to rich and indulgent, every LUMA flavour is built to feel distinct.
          </p>
        </div>

        <ul className="flv__list" aria-label="Flavours">
          <span className="flv__marker" aria-hidden="true" />
          {flavours.map((f, i) => (
            <li key={f.name} className="flv__item">
              <span className="n">{pad(i + 1)}</span>
              <span className="t">{f.name}</span>
            </li>
          ))}
        </ul>

        <div className="flv__pos">
          <div className="flv__panel">
            <p className="eyebrow flv__count" aria-hidden="true">
              <span className="flv__nums">
                {flavours.map((f, i) => (
                  <span className="mask" key={f.name}>
                    <span className="flv__num mask__in">{pad(i + 1)}</span>
                  </span>
                ))}
              </span>
              <span>/ {pad(flavours.length)}</span>
            </p>
            <div className="flv__names">
              {flavours.map((f, i) => (
                <h3 key={f.name} className="flv__name mask" aria-hidden={i !== 0 ? 'true' : undefined}>
                  <span className="mask__in">{f.name}</span>
                </h3>
              ))}
            </div>
            <div className="flv__descs">
              {flavours.map((f) => (
                <p key={f.name} className="flv__desc">
                  {f.desc}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
