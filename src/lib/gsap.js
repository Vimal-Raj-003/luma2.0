import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Mobile browsers resize the viewport as the address bar collapses; ignore it
// so pinned sections never jump.
ScrollTrigger.config({ ignoreMobileResize: true })

if (import.meta.env.DEV) window.ScrollTrigger = ScrollTrigger // dev-only: handy for debugging pins

export const MOBILE_QUERY = '(max-width: 900px)'
export const DESKTOP_QUERY = '(min-width: 901px)'
export const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

// Pin lengths are expressed in viewport heights; shortened on mobile.
export const vh = (n) => () => `+=${Math.round(window.innerHeight * n)}`

export function scrollToId(id) {
  const st = ScrollTrigger.getById(id)
  let top
  if (st) top = st.start
  else {
    const el = document.getElementById(id)
    if (!el) return
    top = el.getBoundingClientRect().top + window.scrollY
  }
  window.scrollTo({ top, behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
