import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './TravelingDot.css';

gsap.registerPlugin(ScrollTrigger);

export default function TravelingDot() {
  const dotRef = useRef(null);

  useGSAP(() => {
    if (!dotRef.current) return;
    
    // Check if mobile. On mobile, CyberCore is centered. On desktop, it's right-aligned.
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const startX = isMobile ? '0vw' : '25vw'; // Offset from center (left 50%)

    // Master Timeline for the traveling dot
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    });

    // Initial state matching the shrunken CyberCore
    gsap.set(dotRef.current, { opacity: 0, x: startX, y: '40vh', scale: 0.1 });

    // 1. Hero -> Mission Brief (0% to 15% scroll)
    // Fade in and pulse as CyberCore fades out
    tl.to(dotRef.current, {
      opacity: 1,
      scale: 1,
      y: '50vh',
      ease: 'power2.out',
    }, 0.05);

    // 2. Mission Briefing travel (15% to 30% scroll)
    // Travel down the right side
    tl.to(dotRef.current, {
      y: '80vh',
      ease: 'none',
    }, 0.15);

    // 3. Swerve into Timeline (30% to 40% scroll)
    // Move to center X and land at the top of the timeline track
    tl.to(dotRef.current, {
      x: '0vw',
      y: '60vh', // Approaching center
      ease: 'power1.inOut',
    }, 0.3);

    // 4. Lock into Timeline (40% to 45% scroll)
    // Hand off to the timeline progress bar (fade out as timeline takes over)
    tl.to(dotRef.current, {
      y: '30vh', // Scrolls up with the page
      scale: 0,
      opacity: 0,
      ease: 'power2.in',
    }, 0.4);

  });

  return <div className="traveling-dot" ref={dotRef} aria-hidden="true" />;
}
