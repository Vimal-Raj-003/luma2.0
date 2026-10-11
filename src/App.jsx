import { useEffect } from 'react'
import { ScrollTrigger, scrollToId } from './lib/gsap'
import FrameBackground from './components/FrameBackground'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Flavours from './components/Flavours'
import Ingredients from './components/Ingredients'
import WhyLuma from './components/WhyLuma'
import Approach from './components/Approach'
import Testimonials from './components/Testimonials'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  useEffect(() => {
    // fonts / lazy images can shift measurements — re-measure once everything settles
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <a
        className="skip"
        href="#flavours"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('flavours')
        }}
      >
        Skip to content
      </a>
      <FrameBackground />
      <Nav />
      <div className="page">
      <main>
        <Hero />
        <Flavours />
        <Ingredients />
        <WhyLuma />
        <Approach />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      </div>
    </>
  )
}
