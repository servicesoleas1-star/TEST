import { useEffect, useRef, useState } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';
const SENSITIVITY = 0.8;
const NAV_LINKS = ['Labs', 'Studio', 'Openings', 'Shop'];

function useTypewriter(text, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ScrubVideo() {
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const prevXRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applySeek = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      seekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    };

    const onSeeked = () => {
      seekingRef.current = false;
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
        applySeek();
      }
    };

    const onMouseMove = (e) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;
      if (!video.duration || Number.isNaN(video.duration)) return;

      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let targetTime = targetTimeRef.current + offset;
      targetTime = Math.max(0, Math.min(video.duration, targetTime));
      targetTimeRef.current = targetTime;

      if (!seekingRef.current) applySeek();
    };

    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 w-full h-full object-cover"
      style={{ objectPosition: '70% center' }}
    >
      <source src={VIDEO_SRC} type="video/mp4" />
    </video>
  );
}

function MobileMenu({ open }) {
  return (
    <div
      className="fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 md:hidden transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
    >
      {NAV_LINKS.map((link) => (
        <a key={link} href="#" className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity">
          {link}
        </a>
      ))}
      <a href="#" className="text-[32px] font-medium text-black underline underline-offset-2">
        Get in touch
      </a>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-10 flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5">
        <div className="flex flex-row items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe&reg;
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none" style={{ letterSpacing: '-0.02em' }}>
            ✳︎
          </span>
        </div>

        <div className="hidden md:flex flex-row items-center text-[23px] text-black">
          {NAV_LINKS.map((link, i) => (
            <span key={link}>
              <a href="#" className="hover:opacity-60 transition-opacity">
                {link}
              </a>
              {i < NAV_LINKS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>

        <a href="#" className="hidden md:inline text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity">
          Get in touch
        </a>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="md:hidden flex flex-col gap-[5px] p-2"
        >
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={{ transform: open ? 'rotate(45deg) translateY(7px)' : 'none' }}
          />
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={{ transform: open ? 'rotate(-45deg) translateY(-7px)' : 'none' }}
          />
        </button>
      </nav>
      <MobileMenu open={open} />
    </>
  );
}

function ActionPills() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timeout);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('hello@mainframe.co').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const pillClass =
    'inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200';

  return (
    <div
      className="flex flex-wrap gap-y-1"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <button type="button" className={pillClass}>
        Pitch us an idea
      </button>
      <button type="button" className={pillClass}>
        Come work here
      </button>
      <button type="button" className={pillClass}>
        Send a brief hello
      </button>
      <button type="button" className={pillClass}>
        See how we operate
      </button>
      <button
        type="button"
        onClick={copyEmail}
        className="inline-flex items-center justify-center gap-2 sm:gap-3 text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-black transition-colors duration-200"
      >
        {copied ? 'Copied!' : (
          <>
            Reach us: <span className="underline underline-offset-1">hello@mainframe.co</span>
          </>
        )}
        <CopyIcon />
      </button>
    </div>
  );
}

function Hero() {
  const { displayed, done } = useTypewriter(
    'Glad you stopped in. Good taste tends to find us. Now, what are we building?'
  );

  return (
    <section className="relative z-[1] h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      <div className="max-w-xl relative z-10">
        <p
          className="pointer-events-none select-none mb-5 sm:mb-6 text-black"
          style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.3, fontWeight: 400, filter: 'blur(4px)' }}
        >
          Hey there, meet A.R.I.A,
          <br />
          Mainframe's Adaptive Response Interface Agent
        </p>

        <p
          className="text-black mb-5 sm:mb-6"
          style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.35, fontWeight: 400, minHeight: 54 }}
        >
          {displayed}
          {!done && <span className="typewriter-cursor inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px]" />}
        </p>

        <ActionPills />
      </div>
    </section>
  );
}

function Mainframe() {
  return (
    <div className="mainframe-page relative bg-white">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typewriter-cursor {
          animation: blink 1s step-end infinite;
        }
      `}</style>
      <ScrubVideo />
      <Navbar />
      <Hero />
    </div>
  );
}

export default Mainframe;
