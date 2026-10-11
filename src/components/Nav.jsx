import { scrollToId } from '../lib/gsap'

export default function Nav() {
  const go = (id) => (e) => {
    e.preventDefault()
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' })
    else scrollToId(id)
  }
  return (
    <header className="nav">
      <a className="nav__logo" href="#top" onClick={go('top')} aria-label="LUMA — back to top">
        LUMA
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#flavours" onClick={go('flavours')}>Flavours</a>
        <a href="#why" onClick={go('why')}>Story</a>
        <a className="nav__order" href="#cta" onClick={go('cta')}>Order</a>
      </nav>
    </header>
  )
}
