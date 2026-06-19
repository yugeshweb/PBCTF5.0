import { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollProgress } from './hooks/useScrollProgress';
import Loader from './components/Loader/Loader';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import MissionBrief from './components/MissionBrief/MissionBrief';
import Timeline from './components/Timeline/Timeline';
import Categories from './components/Categories/Categories';
import Prizes from './components/Prizes/Prizes';
import AboutPointBlank from './components/AboutPointBlank/AboutPointBlank';
import Venue from './components/Venue/Venue';
import FAQ from './components/FAQ/FAQ';
import Sponsors from './components/Sponsors/Sponsors';
import FinalCTA from './components/FinalCTA/FinalCTA';
import Footer from './components/Footer/Footer';
import StarsBackground from './components/StarsBackground/StarsBackground';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const scrollProgress = useScrollProgress();
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('pbctf_loader_seen');
  });

  useEffect(() => {
    // Refresh ScrollTrigger after all content loads
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    // Handle hash navigation for smooth scroll
    const handleClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/* Space Theme Background */}
      <StarsBackground />
      
      {/* Cyberpunk overlays */}
      <div className="scanlines" />

      {/* Glitch Loading Screen */}
      {loading && <Loader onComplete={() => {
        setLoading(false);
        sessionStorage.setItem('pbctf_loader_seen', 'true');
      }} />}
      {/* Fixed header */}
      <Header />

      {/* Scrollable content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <MissionBrief />
        <Timeline />
        <Categories />
        <Prizes />
        <Sponsors />
        <AboutPointBlank />
        <Venue />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </MotionConfig>
  );
}

export default App;
