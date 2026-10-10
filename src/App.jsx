import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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
      <figure className="city-card" aria-label="Three stylized Lagos monument figures in a monochrome drawing">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.16em]"><span>A city in motion</span><span>NG / LOS</span></div>
      <div className="city-drawing" aria-hidden="true">
        <img src="/WhatsApp%20Image%202026-10-10%20at%2013.05.22.jpeg" alt="" className="statue-image" />
      </div>
      <figcaption className="flex justify-between border-t border-black pt-4 font-mono text-[10px] uppercase tracking-[.13em]"><span>Rooted in Lagos.</span><span>Connected to what’s next. ↗</span></figcaption>
      </figure>
    </div>
  </div>;
}

export default function App() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  async function submitSubscription(event) {
    event.preventDefault();
    setSubmitting(true);
    setSignupError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, website: '' }),
      });
      const responseBody = await response.text();
      let result = {};
      if (responseBody) {
        try {
          result = JSON.parse(responseBody);
        } catch {
          throw new Error('The signup service returned an unexpected response. Please try again.');
        }
      }
      if (!response.ok) throw new Error(result.error || 'We couldn’t save your email. Please try again.');
      setSubscribed(true);
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : 'We couldn’t save your email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

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

        <section id="subscribe" className="subscribe-section section-grid border-t border-black" aria-labelledby="subscribe-title">
          <div className="section-label">03 / Stay in the loop</div>
          <div className="subscribe-content">
            <span className="mb-5 block font-mono text-[10px] uppercase tracking-[.16em]">Lagos Tech Week announcements</span>
            <h2 id="subscribe-title" className="section-heading">Subscribe for<br />Updates.</h2>
            {subscribed ? <div className="subscribe-feedback">
              <p role="status">You’re on the list.</p>
              <button type="button" onClick={() => { setSubscribed(false); setEmail(''); setConsent(false); }}>Register another email</button>
            </div> : <form className="subscribe-form" onSubmit={submitSubscription}>
              <label className="sr-only" htmlFor="subscribe-email">Your email address</label>
              <div className="subscribe-form-row">
                <input id="subscribe-email" name="email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={event => setEmail(event.target.value)} required />
                <button type="submit" aria-busy={submitting} disabled={submitting}>
                  Notify me {submitting ? <span className="subscribe-spinner" aria-hidden="true" /> : <Arrow />}
                </button>
              </div>
              <label className="subscribe-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required /> <span>I agree to receive Lagos Tech Week updates by email.</span></label>
              {signupError && <p className="subscribe-error" role="alert">{signupError}</p>}
            </form>}
          </div>
        </section>
      </main>

      <footer className="border-t border-black pb-7 pt-8"><div className="flex flex-wrap items-center justify-between gap-5"><a href="#" className="flex items-center gap-2 text-sm font-semibold"><Mark className="size-5" /> Lagos Tech Week</a><span className="font-mono text-[10px] uppercase tracking-[.1em]">From Lagos. For what’s next.</span><a href="#" className="flex items-center gap-3 text-xs">Back to top <span aria-hidden="true">↑</span></a></div><p className="mt-8 font-mono text-[10px]">© {new Date().getFullYear()} Lagos Tech Week</p></footer>
    </div>
  </>;
}
