import { useEffect, useRef } from 'react';

function Arrow({ diagonal = false, className = '' }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
}

function Mark({ className = '' }) {
  return <svg className={className} width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true"><path d="M24 3v42M3 24h42M9 9l30 30M9 39 39 9" /></svg>;
}

function CityIllustration() {
  const figureRef = useRef(null);
  const frameRef = useRef(null);
  const pointerRef = useRef(null);
  const motionAllowed = useRef(false);

  function resetTilt() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    pointerRef.current = null;
    figureRef.current?.style.removeProperty('--tilt-x');
    figureRef.current?.style.removeProperty('--tilt-y');
  }

  useEffect(() => {
    const preference = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const updatePreference = () => {
      motionAllowed.current = preference.matches;
      resetTilt();
    };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    window.addEventListener('blur', resetTilt);
    return () => {
      preference.removeEventListener('change', updatePreference);
      window.removeEventListener('blur', resetTilt);
      resetTilt();
    };
  }, []);

  function tiltToPointer(event) {
    if (!motionAllowed.current || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    // Measure the stationary figure, not the rotating card, to avoid feedback jitter.
    pointerRef.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)),
      y: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)),
    };
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const point = pointerRef.current;
      if (!point || !figureRef.current || !motionAllowed.current) return;
      figureRef.current.style.setProperty('--tilt-x', `${(-point.y * 5).toFixed(2)}deg`);
      figureRef.current.style.setProperty('--tilt-y', `${(point.x * 6).toFixed(2)}deg`);
    });
  }

  return <div ref={figureRef} className="city-figure" onPointerMove={tiltToPointer} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
    <div className="city-card-shell">
      <figure className="city-card" aria-label="An architectural line illustration inspired by Lagos and its cable bridge">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.16em]"><span>A city in motion</span><span>NG / LOS</span></div>
      <div className="city-drawing" aria-hidden="true">
      <svg viewBox="0 0 460 340" className="city-layer city-layer-backdrop" fill="none">
        <defs><pattern id="city-grid" width="23" height="23" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="black" /></pattern></defs>
        <rect x="0" y="0" width="460" height="340" fill="url(#city-grid)" />
        <circle cx="300" cy="132" r="86" fill="white" stroke="black" strokeWidth="1" />
        <path d="M27 65h18m-9-9v18m368 43h18m-9-9v18" stroke="black" />
      </svg>
      <svg viewBox="0 0 460 340" className="city-layer city-layer-skyline" fill="none">
        <g stroke="black" strokeWidth="1.2" fill="white"><path d="M12 259v-55h30v55m5 0V174h31v85m6 0v-43h28v43m6 0V158h40v101m-30-101v-12h20v12m223 101V167h32v92m6 0v-59h29v59m6 0v-35h25v35" /><path d="M54 185h17m-17 12h17m-17 12h17m56-37h24m-24 12h24m-24 12h24m-24 12h24m234-27h18m-18 12h18m-18 12h18" /></g>
      </svg>
      <svg viewBox="0 0 460 340" className="city-layer city-layer-water" fill="none">
        <path d="M7 318h102m20 0h37m23 0h65m18 0h151M32 330h39m18 0h114m31 0h66m16 0h132" stroke="black" strokeWidth="1" />
      </svg>
      <svg viewBox="0 0 460 340" className="city-layer city-layer-bridge" fill="none">
        <path d="m18 281 424-37v12L18 293Z" fill="white" stroke="black" strokeWidth="1.5" />
        <path d="M241 263 263 76h8l19 183M257 125h18M249 201h34" fill="white" stroke="black" strokeWidth="2" />
        <g stroke="black" strokeWidth="1"><path d="m265 88-207 190m207-178L89 275m176-163L121 273m144-148L153 270m112-131-80 128m80-113-48 110m54-175 151 158m-151-145 123 147m-123-134 95 137m-95-122 68 124m-68-106 41 109" /></g>
        <path d="m65 289-3 24m120-34-1 21m156-33 4 25m54-30 5 28" stroke="black" strokeWidth="3" />
      </svg>
      </div>
      <figcaption className="flex justify-between border-t border-black pt-4 font-mono text-[10px] uppercase tracking-[.13em]"><span>Rooted in Lagos.</span><span>Connected to what’s next. ↗</span></figcaption>
      </figure>
    </div>
  </div>;
}

export default function App() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="site-shell">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black bg-white py-6 sm:py-8">
        <a href="#" aria-label="Lagos Tech Week home" className="flex items-center gap-3"><Mark /><span className="text-[17px] font-bold leading-[1.05] tracking-tight">Lagos<br />Tech Week<span className="ml-1 align-top text-[9px]">↗</span></span></a>
        <nav aria-label="Main navigation" className="flex items-center gap-8 text-xs sm:text-sm"><a href="#about" className="hidden underline-offset-4 hover:underline sm:block">The idea</a><a href="#updates" className="flex items-center gap-3 underline-offset-4 hover:underline">What’s coming <Arrow diagonal className="size-4" /></a></nav>
      </header>

      <main id="main">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-topline flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] sm:text-[11px]"><span className="flex items-center gap-2.5"><span className="size-1.5 rounded-full bg-black" />Something is starting.</span><span>Lagos, Nigeria · Coming soon</span></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">Lagos<br />Tech Week<br /><span className="coming-text">is coming.</span></h1>
              <p className="hero-description">A new citywide platform for the people, founders, builders, and curious minds shaping the future of technology in Lagos.</p>
              <a href="#about" className="primary-button group"><span>See the vision</span><Arrow className="transition-transform group-hover:translate-x-1" /></a>
            </div>
            <CityIllustration />
          </div>
          <div className="hero-bottom flex flex-wrap items-center justify-between gap-4 border-t border-black py-5 font-mono text-[10px] uppercase tracking-[.12em]"><span>Dates to be announced</span><a href="#updates" className="flex items-center gap-4">What to expect <span aria-hidden="true">↓</span></a></div>
        </section>

        <section id="about" className="about-section section-grid border-t border-black" aria-labelledby="about-title">
          <div className="section-label"><span>01 / The idea</span><Mark className="mt-10 hidden size-14 md:block" /></div>
          <div><h2 id="about-title" className="section-heading">Big ideas.<br />Lagos energy.</h2><div className="about-body"><p>Lagos Tech Week is being built as a home for the city’s technology community.</p><p>It is a place to spotlight the founders building new businesses, the creators making bold products, the investors backing opportunity, and the people who want to understand what comes next.</p><p>This is more than an announcement — it is a signal that Lagos is ready to connect, learn, and grow together.</p></div><div className="audience-row flex flex-wrap gap-x-6 gap-y-3 border-t border-black pt-5 font-mono text-[10px] uppercase tracking-[.12em]"><span>Founders</span><span>Builders</span><span>Investors</span><span>Community ↗</span></div></div>
        </section>

        <section id="updates" className="updates-section section-grid border-t border-black" aria-labelledby="updates-title">
          <div className="section-label">02 / What’s coming</div>
          <div className="updates-content">
            <div>
              <span className="mb-5 block font-mono text-[10px] uppercase tracking-[.16em]">Good things are taking shape.</span>
              <h2 id="updates-title" className="section-heading">A stronger<br />tech ecosystem.</h2>
              <p className="mt-5 max-w-md text-sm leading-7">We’re building a flagship platform for events, conversations, and connections that bring Lagos’s technology community together.</p>
            </div>
            <div className="feature-list">
              <div className="feature-item border border-black p-5">
                <span className="feature-kicker font-mono text-[10px] uppercase tracking-[.14em]">01</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Event discovery</h3>
                <p className="mt-3 text-sm leading-6">A place to learn what is happening across Lagos and the wider tech ecosystem.</p>
              </div>
              <div className="feature-item border border-black p-5">
                <span className="feature-kicker font-mono text-[10px] uppercase tracking-[.14em]">02</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Community connection</h3>
                <p className="mt-3 text-sm leading-6">A space where founders, builders, investors, and curious minds can meet around real opportunity.</p>
              </div>
              <div className="feature-item border border-black p-5">
                <span className="feature-kicker font-mono text-[10px] uppercase tracking-[.14em]">03</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">More details soon</h3>
                <p className="mt-3 text-sm leading-6">Dates, programme announcements, and participation details will be shared here as they are confirmed.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black pb-7 pt-8"><div className="flex flex-wrap items-center justify-between gap-5"><a href="#" className="flex items-center gap-2 text-sm font-semibold"><Mark className="size-5" /> Lagos Tech Week</a><span className="font-mono text-[10px] uppercase tracking-[.1em]">From Lagos. For what’s next.</span><a href="#" className="flex items-center gap-3 text-xs">Back to top <span aria-hidden="true">↑</span></a></div><p className="mt-8 font-mono text-[10px]">© {new Date().getFullYear()} Lagos Tech Week</p></footer>
    </div>
  </>;
}
