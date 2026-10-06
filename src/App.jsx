import { useEffect, useRef, useState } from 'react';

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
  </div>;
}

function SignupForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const submitting = useRef(false);

  async function subscribe(event) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true;
    setStatus('loading');
    setError('');
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), consent: data.get('consent') === 'on', website: data.get('website') }),
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We couldn’t save your email. Please try again.');
      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof TypeError || err.name === 'TimeoutError' || err instanceof SyntaxError ? 'We couldn’t connect. Please try again in a moment.' : err.message);
    } finally {
      submitting.current = false;
    }
  }

  return <div className="signup-form-wrap">
    {status === 'success' ? <div role="status" className="success-message border border-black p-7">
      <span className="mb-5 flex size-9 items-center justify-center rounded-full border border-black" aria-hidden="true">✓</span>
      <h3 className="text-2xl font-semibold tracking-tight">You’re on the list.</h3>
      <p className="mt-3 text-sm leading-6">Your interest is registered. Look out for Lagos Tech Week announcements.</p>
      <button type="button" className="mt-6 text-sm underline underline-offset-4" onClick={() => setStatus('idle')}>Register another email</button>
    </div> : <form onSubmit={subscribe}>
      <label htmlFor="email" className="mb-3 block font-mono text-xs uppercase tracking-widest">Your email address</label>
      <div className="email-row flex border border-black focus-within:outline focus-within:outline-2 focus-within:outline-offset-4">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required disabled={status === 'loading'} className="min-w-0 flex-1 bg-white px-5 py-5 text-sm outline-none" aria-describedby={error ? 'signup-error' : undefined} />
        <button type="submit" disabled={status === 'loading'} className="group flex shrink-0 items-center justify-center gap-5 bg-black px-6 py-5 text-sm text-white transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-60"><span>{status === 'loading' ? 'Joining…' : 'Notify me'}</span><Arrow className="transition-transform group-hover:translate-x-1" /></button>
      </div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-5"><input type="checkbox" name="consent" required disabled={status === 'loading'} className="mt-1 size-3.5 shrink-0 accent-black" /><span>I agree to receive Lagos Tech Week announcements by email.</span></label>
      <p className="mt-3 text-xs leading-5">Your email will be stored for event updates. See our <a className="underline underline-offset-3" href="#privacy">privacy note</a>.</p>
      {error && <p id="signup-error" role="alert" className="mt-4 border-l-2 border-black pl-3 text-sm">{error}</p>}
    </form>}
  </div>;
}

export default function App() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="site-shell">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black bg-white py-6 sm:py-8">
        <a href="#" aria-label="Lagos Tech Week home" className="flex items-center gap-3"><Mark /><span className="text-[17px] font-bold leading-[1.05] tracking-tight">Lagos<br />Tech Week<span className="ml-1 align-top text-[9px]">↗</span></span></a>
        <nav aria-label="Main navigation" className="flex items-center gap-8 text-xs sm:text-sm"><a href="#about" className="hidden underline-offset-4 hover:underline sm:block">The idea</a><a href="#updates" className="flex items-center gap-3 underline-offset-4 hover:underline">Get updates <Arrow diagonal className="size-4" /></a></nav>
      </header>

      <main id="main">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-topline flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.16em] sm:text-[11px]"><span className="flex items-center gap-2.5"><span className="size-1.5 rounded-full bg-black" />Something is starting.</span><span>Lagos, Nigeria · Coming soon</span></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">Lagos<br />Tech Week<br /><span className="coming-text">is coming.</span></h1>
              <p className="hero-description">The city. The people. The possibilities.<br />A new meeting point for the people<br className="hidden sm:block" /> building what comes next.</p>
              <a href="#updates" className="primary-button group"><span>Be the first to know</span><Arrow className="transition-transform group-hover:translate-x-1" /></a>
            </div>
            <CityIllustration />
          </div>
          <div className="hero-bottom flex flex-wrap items-center justify-between gap-4 border-t border-black py-5 font-mono text-[10px] uppercase tracking-[.12em]"><span>Dates to be announced</span><a href="#about" className="flex items-center gap-4">Discover the idea <span aria-hidden="true">↓</span></a></div>
        </section>

        <section id="about" className="about-section section-grid border-t border-black" aria-labelledby="about-title">
          <div className="section-label"><span>01 / The idea</span><Mark className="mt-10 hidden size-14 md:block" /></div>
          <div><h2 id="about-title" className="section-heading">Big ideas.<br />Lagos energy.</h2><div className="about-body"><p>Lagos Tech Week is coming — bringing the city’s technology community into the conversation.</p><p>For the founders starting something. The builders making it happen. The investors backing possibility. And the curious minds asking, “what’s next?”</p><p>This is the beginning. Dates, programme details, and ways to take part will be announced here.</p></div><div className="audience-row flex flex-wrap gap-x-6 gap-y-3 border-t border-black pt-5 font-mono text-[10px] uppercase tracking-[.12em]"><span>Founders</span><span>Builders</span><span>Investors</span><span>Curious minds ↗</span></div></div>
        </section>

        <section id="updates" className="updates-section section-grid border-t border-black" aria-labelledby="updates-title">
          <div className="section-label">02 / Stay in the loop</div>
          <div className="updates-content"><div><span className="mb-5 block font-mono text-[10px] uppercase tracking-[.16em]">Good things are taking shape.</span><h2 id="updates-title" className="section-heading">You’ll want<br />to be here.</h2><p className="mt-5 max-w-sm text-sm leading-7">Leave your email for updates on dates, the programme, and how to get involved.</p></div><SignupForm /></div>
        </section>

        <details id="privacy" className="privacy-note border-t border-black py-5 text-xs"><summary className="w-fit cursor-pointer underline-offset-4 hover:underline">A note on your privacy</summary><p className="mt-4 max-w-2xl leading-6">When you join the list, we store your email address, your consent, and the time you signed up to manage interest in Lagos Tech Week and send event announcements. Signing up does not reserve a ticket. Please submit only your own email address.</p></details>
      </main>

      <footer className="border-t border-black pb-7 pt-8"><div className="flex flex-wrap items-center justify-between gap-5"><a href="#" className="flex items-center gap-2 text-sm font-semibold"><Mark className="size-5" /> Lagos Tech Week</a><span className="font-mono text-[10px] uppercase tracking-[.1em]">From Lagos. For what’s next.</span><a href="#" className="flex items-center gap-3 text-xs">Back to top <span aria-hidden="true">↑</span></a></div><p className="mt-8 font-mono text-[10px]">© {new Date().getFullYear()} Lagos Tech Week</p></footer>
    </div>
  </>;
}
