// LANDING PAGE — Lens Veritas
// Pagina editoriale di ingresso, sostituisce la vecchia home (ora a /dashboard).
// Estetica Bloomberg Terminal × Palantir Foundry: dark sobrio, serif editoriale,
// dati in mono, zero decorazione gratuita.
// Le variabili CSS scoped al wrapper .landing-root sono definite in globals.css
// e isolano la landing dal palette switching dell'utente.

import Hero from '../components/home/Hero'
import ProblemSection from '../components/home/ProblemSection'
import Methodology from '../components/home/Methodology'
import FeaturePreview from '../components/home/FeaturePreview'
import Principles from '../components/home/Principles'
import Footer from '../components/home/Footer'

// La landing è statica: niente revalidate (può essere prerendered al deploy).
export const dynamic = 'force-static'

export const metadata = {
  title: 'Lens Veritas — News, refracted.',
  description:
    'Aggreghiamo 30+ fonti internazionali e applichiamo un sistema di 9 agenti AI per verificare i fatti, misurare il bias e ricostruire il contesto geopolitico di ogni notizia.',
}

export default function LandingPage() {
  return (
    <main className="landing-root">
      <Hero />
      <ProblemSection />
      <Methodology />
      <FeaturePreview />
      <Principles />
      <Footer />
    </main>
  )
}
