import { useLayoutEffect, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, vh } from '../lib/gsap'
import { ingredients } from '../data'
import { artMap } from './Art'
import MaskText from './MaskText'

// entrance vectors as fractions of the stage size + spin
const entrances = [
  { x: -0.7, y: 0.1, r: -70 }, // strawberry — from the left
  { x: 0.6, y: -0.1, r: 100 }, // jelly — from the right
  { x: -0.1, y: 0.8, r: 40 }, // basil — rises from below
  { x: 0.5, y: 0.7, r: -50 }, // sev — bottom right
  { x: 0.4, y: -0.8, r: 80 }, // nuts — drops from top right
  { x: 0.05, y: -0.8, r: -30 }, // syrup — drops from the top
  { x: 0.05, y: 0.6, r: 0 }, // ice cream — rises, scales up
]
const depths = [1, 0.5, 0.35, 0.6, 0.4, 0.45, 0.8]

export default function Ingredients() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      const stage = q('.ing__stage')[0]
      const flies = q('.ing__fly')
      const drifts = q('.ing__drift')
      const rows = q('.ing__row')
      const center = mobile ? [50, 40] : [66, 50]

      gsap.set(q('.ing__head .mask__in'), { yPercent: 140 })
      gsap.set(q('.ing__eyebrow'), { opacity: 0, y: 20 })
      gsap.set(rows, { opacity: 0.22, x: mobile ? 0 : -14 })
      gsap.set(q('.ing__glow'), { scale: 0.3, opacity: 0 })

      gsap.fromTo(
        stage,
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
          id: 'ingredients',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 4.2 : 6.2),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // text reveals in layers
      tl.to(q('.ing__eyebrow'), { opacity: 1, y: 0, duration: 0.8 }, 0)
        .to(q('.ing__head .mask__in'), { yPercent: 0, duration: 1.2, stagger: 0.25 }, 0.2)

      // background depth: bokeh drifts at different speeds
      q('.ing__bokeh').forEach((el, i) => {
        tl.fromTo(el, { y: 40 * (i + 1) }, { y: -120 * (i + 1), duration: 12, ease: 'none' }, 0)
      })
      tl.to(q('.ing__glow'), { scale: 1, opacity: 0.85, duration: 8, ease: 'none' }, 1)

      ingredients.forEach((ing, i) => {
        const e = entrances[i]
        const at = 1 + i * 0.8
        const W = () => stage.clientWidth
        const H = () => stage.clientHeight
        const [px, py] = mobile ? ing.m : ing.d

        // entrance (different direction + depth per ingredient)
        tl.fromTo(
          flies[i],
          { x: () => e.x * W(), y: () => e.y * H(), rotate: e.r, scale: i === 6 ? 0.2 : 0.6, opacity: 0 },
          { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1.8 },
          at,
        )
        // light up the matching row
        tl.to(rows[i], { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }, at + 0.8)

        // continuous parallax drift (different depth per layer)
        tl.fromTo(
          drifts[i],
          { y: depths[i] * 70, rotate: -6 * depths[i] },
          { y: -depths[i] * 150, rotate: 8 * depths[i], duration: 12, ease: 'none' },
          0,
        )

        // converge toward the centre, as if falling into the glass
        tl.to(
          flies[i],
          {
            x: () => ((center[0] - px) / 100) * W(),
            y: () => ((center[1] - py) / 100) * H(),
            scale: 0.35,
            rotate: i % 2 ? 40 : -40,
            duration: 2.4,
            ease: 'power2.in',
            immediateRender: false,
          },
          9 + i * 0.1,
        )
        tl.to(flies[i], { opacity: 0, duration: 0.9, ease: 'none', immediateRender: false }, 10.6 + i * 0.1)
      })

      tl.to(q('.ing__glow'), { scale: 1.9, opacity: 0, duration: 1.4, ease: 'power2.out' }, 10.8)
        .to([...q('.ing__head'), ...q('.ing__list')], { opacity: 0, y: -30, duration: 1.2, ease: 'power2.in' }, 10.6)
        .to({}, { duration: 0.01 }, 12)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="ingredients" className="ing" ref={rootRef}>
      <div className="ing__stage">
        <div className="ing__bg" aria-hidden="true">
          <span className="ing__bokeh" style={{ left: '8%', top: '70%', width: 220, height: 220 }} />
          <span className="ing__bokeh" style={{ left: '78%', top: '60%', width: 300, height: 300 }} />
          <span className="ing__bokeh" style={{ left: '55%', top: '95%', width: 180, height: 180 }} />
        </div>
        <div className="ing__glow" aria-hidden="true" />

        <div className="ing__head">
          <p className="eyebrow ing__eyebrow">The ingredient story</p>
          <MaskText as="h2" text="Everything in its place." className="ing__title" />
        </div>

        <ul className="ing__list">
          {ingredients.map((ing) => (
            <li key={ing.id} className="ing__row">
              <span className="ing__rowName">{ing.name}</span>
              <span className="ing__rowLine">{ing.line}</span>
            </li>
          ))}
        </ul>

        <div className="ing__items" aria-hidden="true">
          {ingredients.map((ing) => {
            const Art = artMap[ing.id]
            return (
              <div
                key={ing.id}
                className="ing__item"
                style={{
                  '--dx': `${ing.d[0]}%`,
                  '--dy': `${ing.d[1]}%`,
                  '--ds': ing.d[2],
                  '--mx': `${ing.m[0]}%`,
                  '--my': `${ing.m[1]}%`,
                  '--ms': ing.m[2],
                }}
              >
                <div className="ing__fly">
                  <div className="ing__drift">
                    <Art />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
