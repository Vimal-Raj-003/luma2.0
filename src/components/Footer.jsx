import { useLayoutEffect, useRef } from 'react'
import { gsap, scrollToId } from '../lib/gsap'

export default function Footer() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)

    const ctx = gsap.context(() => {
      gsap.set(q('.foot__line'), { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(q('.foot__tag .mask__in'), { yPercent: 140 })
      gsap.set(q('.foot__links li'), { opacity: 0, y: 30 })
      gsap.set(q('.foot__word .mask__in'), { yPercent: 105 })
      gsap.set(q('.foot__bottom'), { opacity: 0 })

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            id: 'footer',
            trigger: root,
            start: 'top 88%',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        })
        .to(q('.foot__line'), { scaleX: 1, duration: 1, ease: 'none' }, 0)
        .to(q('.foot__tag .mask__in'), { yPercent: 0, duration: 1, stagger: 0.1 }, 0.1)
        .to(q('.foot__links li'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.3)
        .to(q('.foot__word .mask__in'), { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.5)
        .to(q('.foot__bottom'), { opacity: 1, duration: 0.6 }, 1.6)
    }, root)

    return () => ctx.revert()
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }
  const noop = (e) => e.preventDefault()

  return (
    <footer id="footer" className="foot" ref={rootRef}>
      <div className="foot__line" />
      <div className="foot__top">
        <p className="foot__tag" aria-label="Layers of Happiness.">
          <span className="mask" aria-hidden="true"><span className="mask__in">Layers of</span></span>
          <span className="mask" aria-hidden="true"><span className="mask__in">Happiness.</span></span>
        </p>
        <ul className="foot__links">
          <li><a href="#flavours" onClick={go('flavours')}>Flavours</a></li>
          <li><a href="#why" onClick={go('why')}>About</a></li>
          <li><a href="mailto:hello@luma.example">Contact</a></li>
          <li><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></li>
          <li><a href="#terms" onClick={noop}>Terms</a></li>
          <li><a href="#privacy" onClick={noop}>Privacy</a></li>
        </ul>
      </div>
      <div className="foot__word" aria-hidden="true">
        {'LUMA'.split('').map((ch, i) => (
          <span className="mask" key={i}>
            <span className="mask__in">{ch}</span>
          </span>
        ))}
      </div>
      <div className="foot__bottom">
        <span>© 2026 LUMA. All rights reserved.</span>
        <span>Layers of Happiness.</span>
      </div>
    </footer>
  )
}
