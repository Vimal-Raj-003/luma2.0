import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, MOBILE_QUERY, DESKTOP_QUERY, vh } from '../lib/gsap'
import { buildSteps } from '../data'

const pad = (n) => String(n).padStart(2, '0')

// deterministic pseudo-random so the glass looks identical on every render
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const GLASS = 'M54 70L266 70L246 498Q244 518 224 518L96 518Q76 518 74 498Z'
const cubes = [
  [112, 196], [200, 232], [140, 296], [208, 358], [104, 384], [170, 160],
]
const sevPaths = [
  'M62 206C90 190 110 224 138 206S190 190 214 208S248 200 262 204',
  'M60 226C88 210 112 244 140 226S192 210 216 228S250 220 262 224',
  'M62 246C90 230 112 262 140 246S190 230 214 248S248 240 260 244',
  'M64 196C94 184 116 212 146 196S196 184 222 198S250 192 262 196',
  'M60 216C88 232 112 200 142 218S192 234 218 216S248 232 262 214',
  'M62 236C92 252 114 220 144 238S194 254 220 236S250 250 260 234',
]

export default function Build() {
  const rootRef = useRef(null)

  const seeds = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 46 }, () => ({
      x: 70 + r() * 180,
      y: 138 + r() * 282,
      rot: r() * 180,
    }))
  }, [])
  const bits = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: 14 }, () => ({
      x: 90 + r() * 140,
      y: 8 + r() * 56,
      rot: r() * 360,
    }))
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ mobile: MOBILE_QUERY, desktop: DESKTOP_QUERY }, (c) => {
      const { mobile } = c.conditions
      const N = buildSteps.length
      const names = q('.bld__name .mask__in')
      const descs = q('.bld__desc')
      const nums = q('.bld__num')
      const ticks = q('.bld__tick i')

      gsap.set(names.slice(1), { yPercent: 140 })
      gsap.set(nums.slice(1), { yPercent: 140 })
      gsap.set(descs.slice(1), { opacity: 0, y: 24 })
      gsap.set(ticks, { scaleX: 0 })

      gsap.set(q('.b-fill'), { transformOrigin: '50% 100%', scaleY: 0 })
      gsap.set(q('.b-stream'), { transformOrigin: '50% 0%', scaleY: 0, opacity: 1 })
      gsap.set(q('.b-jelly'), { y: -300, opacity: 0, rotate: -50 })
      gsap.set(q('.b-seed'), { scale: 0, opacity: 0 })
      gsap.set(q('.b-sev'), { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 })
      gsap.set(q('.b-ice'), { transformOrigin: '50% 100%', scale: 0, y: -40, opacity: 0 })
      gsap.set(q('.b-drizzle'), { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 })
      gsap.set(q('.b-berry'), { scale: 0, opacity: 0, transformOrigin: '50% 80%' })
      gsap.set(q('.b-bit'), { scale: 0, opacity: 0, y: -50 })
      gsap.set(q('.b-cherry'), { y: -90, opacity: 0 })
      gsap.set(q('.b-spark'), { scale: 0, opacity: 0 })

      gsap.fromTo(
        q('.bld__stage'),
        { clipPath: 'inset(7% 5% round 36px)' },
        {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true },
        },
      )

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          id: 'build',
          trigger: root,
          start: 'top top',
          end: vh(mobile ? 4.6 : 6.4),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      const t0 = (k) => 0.4 + k * 1.1
      const total = t0(N) + 0.4

      // whole-glass motion tied to progress
      tl.fromTo(q('.bld__glass'), { rotate: -5, scale: 0.9 }, { rotate: 3, scale: 1.04, duration: total, ease: 'none' }, 0)
        .fromTo(q('.bld__disc'), { scale: 0.7, rotate: 0 }, { scale: 1.12, rotate: 90, duration: total, ease: 'none' }, 0)
        .fromTo(q('.bld__word'), { xPercent: 12 }, { xPercent: -22, duration: total, ease: 'none' }, 0)

      // text / stepper
      for (let k = 0; k < N; k++) {
        const t = t0(k) - 0.15
        tl.to(ticks[k], { scaleX: 1, duration: 0.8, ease: 'none' }, t)
        if (k === 0) continue
        tl.to(names[k - 1], { yPercent: -140, duration: 0.45, ease: 'power3.in' }, t)
          .to(names[k], { yPercent: 0, duration: 0.55, ease: 'power3.out' }, t + 0.18)
          .to(nums[k - 1], { yPercent: -140, duration: 0.45, ease: 'power3.in' }, t)
          .to(nums[k], { yPercent: 0, duration: 0.55, ease: 'power3.out' }, t + 0.18)
          .to(descs[k - 1], { opacity: 0, y: -20, duration: 0.4 }, t)
          .to(descs[k], { opacity: 1, y: 0, duration: 0.5 }, t + 0.25)
      }
      tl.to(ticks[0], { scaleX: 1, duration: 0.01 }, 0)

      // layers
      // 0 — syrup
      tl.to(q('.b-stream-syrup'), { scaleY: 1, duration: 0.4, ease: 'none' }, t0(0))
        .to(q('.b-fill-syrup'), { scaleY: 1, duration: 0.7 }, t0(0) + 0.3)
        .to(q('.b-stream-syrup'), { scaleX: 0, opacity: 0, duration: 0.3, ease: 'none' }, t0(0) + 0.8)
      // 1 — milk
      tl.to(q('.b-stream-milk'), { scaleY: 1, duration: 0.4, ease: 'none' }, t0(1))
        .to(q('.b-fill-milk'), { scaleY: 1, duration: 0.75 }, t0(1) + 0.3)
        .to(q('.b-stream-milk'), { scaleX: 0, opacity: 0, duration: 0.3, ease: 'none' }, t0(1) + 0.85)
      // 2 — jelly
      tl.to(q('.b-jelly'), { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.09, ease: 'power2.in' }, t0(2))
      // 3 — basil seeds
      tl.to(q('.b-seed'), { scale: 1, opacity: 1, duration: 0.3, stagger: { each: 0.014, from: 'random' } }, t0(3))
      // 4 — sev
      tl.to(q('.b-sev'), { strokeDashoffset: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power1.inOut' }, t0(4))
      // 5 — ice cream
      tl.to(q('.b-ice'), { scale: 1, y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, t0(5))
      // 6 — toppings
      tl.to(q('.b-drizzle'), { strokeDashoffset: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power1.inOut' }, t0(6))
        .to(q('.b-berry'), { scale: 1, opacity: 1, duration: 0.55, stagger: 0.12 }, t0(6) + 0.1)
        .to(q('.b-bit'), { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: { each: 0.03, from: 'random' }, ease: 'power2.in' }, t0(6) + 0.25)
        .to(q('.b-cherry'), { y: 0, opacity: 1, duration: 0.5, ease: 'power2.in' }, t0(6) + 0.45)
        .to(q('.b-spark'), { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08 }, t0(6) + 0.7)
        .to({}, { duration: 0.01 }, total)
    }, root)

    return () => mm.revert()
  }, [])

  return (
    <section id="build" className="bld" ref={rootRef}>
      <div className="bld__stage">
        <div className="bld__word" aria-hidden="true">LAYERS</div>
        <div className="bld__text">
          <p className="eyebrow">
            <span className="bld__nums" aria-hidden="true">
              {buildSteps.map((s, i) => (
                <span className="mask" key={s.name}>
                  <span className="bld__num mask__in">{pad(i + 1)}</span>
                </span>
              ))}
            </span>
            <span>/ {pad(buildSteps.length)} &nbsp;Building your LUMA</span>
          </p>
          <div className="bld__names">
            {buildSteps.map((s, i) => (
              <h2 key={s.name} className="bld__name mask" aria-hidden={i !== 0 ? 'true' : undefined}>
                <span className="mask__in">{s.name}</span>
              </h2>
            ))}
          </div>
          <div className="bld__descs">
            {buildSteps.map((s) => (
              <p key={s.name} className="bld__desc">
                {s.desc}
              </p>
            ))}
          </div>
          <div className="bld__ticks" aria-hidden="true">
            {buildSteps.map((s) => (
              <span key={s.name} className="bld__tick">
                <i />
              </span>
            ))}
          </div>
        </div>

        <div className="bld__glassWrap">
          <div className="bld__disc" aria-hidden="true" />
          <svg className="bld__glass" viewBox="0 -40 320 600" role="img" aria-label="A Falooda glass being built layer by layer">
            <defs>
              <clipPath id="bld-clip">
                <path d={GLASS} />
              </clipPath>
              <linearGradient id="bld-syrup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff4560" />
                <stop offset="1" stopColor="#a50f2c" />
              </linearGradient>
              <linearGradient id="bld-milk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fffaf3" />
                <stop offset=".7" stopColor="#ffe3e6" />
                <stop offset="1" stopColor="#ff9fb0" />
              </linearGradient>
              <radialGradient id="bld-ice" cx="38%" cy="30%" r="80%">
                <stop offset="0" stopColor="#ffd9e4" />
                <stop offset=".6" stopColor="#f58aa8" />
                <stop offset="1" stopColor="#d9567c" />
              </radialGradient>
              <linearGradient id="bld-glassfill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity=".28" />
                <stop offset=".5" stopColor="#fff" stopOpacity=".06" />
                <stop offset="1" stopColor="#fff" stopOpacity=".22" />
              </linearGradient>
            </defs>

            {/* contact shadow */}
            <ellipse cx="160" cy="526" rx="104" ry="9" fill="#3a0c18" opacity=".18" />
            <path d={GLASS} fill="#fff" opacity=".35" />

            <g clipPath="url(#bld-clip)">
              <rect className="b-fill b-fill-syrup" x="40" y="428" width="240" height="100" fill="url(#bld-syrup)" />
              <rect className="b-fill b-fill-milk" x="40" y="112" width="240" height="330" fill="url(#bld-milk)" />

              {cubes.map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y}) scale(${0.95 + (i % 3) * 0.12})`}>
                  <g className="b-jelly">
                    <polygon points="0,-18 18,-9 0,0 -18,-9" fill="#ff6a7e" />
                    <polygon points="-18,-9 0,0 0,22 -18,13" fill="#c21d3a" />
                    <polygon points="18,-9 0,0 0,22 18,13" fill="#8f1029" />
                    <polygon points="-14,-6 -4,-1 -4,12 -14,7" fill="#fff" opacity=".3" />
                  </g>
                </g>
              ))}

              {seeds.map((s, i) => (
                <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}>
                  <g className="b-seed">
                    <ellipse rx="6" ry="4.6" fill="#eef8ff" opacity=".55" />
                    <ellipse rx="3.3" ry="2.4" fill="#17100f" />
                  </g>
                </g>
              ))}

              <g transform="translate(0 -62)">
                {sevPaths.map((d, i) => (
                  <path
                    key={i}
                    className="b-sev"
                    d={d}
                    pathLength="1"
                    stroke={i % 2 ? '#fff4de' : '#ffe5bd'}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
              </g>
            </g>

            {/* pour streams */}
            <rect className="b-stream b-stream-syrup" x="152" y="-40" width="16" height="560" rx="8" fill="#e3203f" />
            <rect className="b-stream b-stream-milk" x="150" y="-40" width="20" height="470" rx="10" fill="#fffaf3" />

            {/* glass shell */}
            <path d={GLASS} fill="url(#bld-glassfill)" stroke="#fff" strokeOpacity=".85" strokeWidth="3" strokeLinejoin="round" />
            <path d="M74 90L88 480" stroke="#fff" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M246 96L236 400" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* ice cream scoop */}
            <g className="b-ice">
              <path
                d="M70 92C56 20 108 -20 160 -20C212 -20 264 20 250 92C262 98 256 118 240 118L80 118C64 118 58 98 70 92Z"
                fill="url(#bld-ice)"
              />
              <path d="M96 118C96 134 104 140 110 130C112 124 116 124 120 132C124 142 132 140 132 126ZM190 118C190 132 196 140 204 132C208 126 212 126 214 134C218 142 226 138 224 118Z" fill="#f58aa8" />
              <ellipse cx="116" cy="22" rx="20" ry="11" fill="#fff" opacity=".35" transform="rotate(-28 116 22)" />
              {[[100, 60], [150, 36], [206, 50], [226, 84], [170, 86], [124, 92]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.6" fill="#fff" opacity=".7" />
              ))}
            </g>

            {/* toppings */}
            <g>
              <path className="b-drizzle" d="M118 10C112 50 126 80 118 130" pathLength="1" stroke="#c9183a" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path className="b-drizzle" d="M196 -4C210 40 194 84 204 124" pathLength="1" stroke="#c9183a" strokeWidth="6" strokeLinecap="round" fill="none" />
              {bits.map((b, i) => (
                <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`}>
                  <rect className="b-bit" x="-4" y="-2.4" width="8" height="4.8" rx="2.2" fill={i % 3 ? '#9dbd5c' : '#e9d29a'} />
                </g>
              ))}
              <g transform="translate(84 62) rotate(-24)">
                <g className="b-berry">
                  <path d="M0 -4C20 -12 36 2 30 24C26 40 8 54 0 54C-8 54 -26 40 -30 24C-36 2 -20 -12 0 -4Z" fill="#e5233f" />
                  <path d="M0 6C10 4 18 14 14 26C11 36 4 42 0 42C-4 42 -11 36 -14 26C-18 14 -10 4 0 6Z" fill="#ffd6dc" />
                  <path d="M-12 -4C-8 -16 8 -16 12 -4C6 -8 -6 -8 -12 -4Z" fill="#3d9a4a" />
                </g>
              </g>
              <g transform="translate(240 66) rotate(22) scale(.9)">
                <g className="b-berry">
                  <path d="M0 -4C20 -12 36 2 30 24C26 40 8 54 0 54C-8 54 -26 40 -30 24C-36 2 -20 -12 0 -4Z" fill="#e5233f" />
                  <path d="M0 6C10 4 18 14 14 26C11 36 4 42 0 42C-4 42 -11 36 -14 26C-18 14 -10 4 0 6Z" fill="#ffd6dc" />
                  <path d="M-12 -4C-8 -16 8 -16 12 -4C6 -8 -6 -8 -12 -4Z" fill="#3d9a4a" />
                </g>
              </g>
              <g transform="translate(160 -22)">
                <g className="b-cherry">
                  <path d="M0 0C6 -18 14 -26 24 -30" stroke="#3d7a38" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <circle r="13" fill="#b5122e" />
                  <ellipse cx="-4" cy="-5" rx="4" ry="3" fill="#fff" opacity=".5" />
                </g>
              </g>
              {[[40, 0, 9], [280, 20, 7], [30, 150, 6], [292, 190, 8]].map(([x, y, r], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <path className="b-spark" d={`M0 -${r}L${r * 0.3} -${r * 0.3}L${r} 0L${r * 0.3} ${r * 0.3}L0 ${r}L-${r * 0.3} ${r * 0.3}L-${r} 0L-${r * 0.3} -${r * 0.3}Z`} fill="#ffb347" />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
