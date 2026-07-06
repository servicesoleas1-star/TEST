import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { universes } from '../../data/universes';
import { media } from '../../config/media';

gsap.registerPlugin(ScrollTrigger);

// Once the visitor has ridden the story all the way through the finale, it
// is remembered for the rest of the tab session — scrolling back up into
// the section afterwards shows the resting final frame instead of replaying
// the whole thing. A hard refresh is the only way to see it again.
const DONE_KEY = 'moledi_zui_done';

const BLOCK_W = 520;
const BLOCK_H = 660;
// Wide ellipse rather than a circle: on a wide desktop viewport the height
// (navbar-minus-viewport) is always the tighter constraint, so a circular
// orbit left huge unused margins left/right. Stretching horizontally and
// compressing vertically lets the whole story fill far more of a wide
// screen while still resolving to the same "6 blocks in a ring" layout.
const ORBIT_RX = 1300;
const ORBIT_RY = 700;
const ANGLES = [-90, -30, 30, 90, 150, 210];
const RING_COLORS = ['#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF', '#FF6A00', '#2B6BFF'];

function positionsFor(count) {
  return ANGLES.slice(0, count).map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(Math.cos(rad) * ORBIT_RX), y: Math.round(Math.sin(rad) * ORBIT_RY) };
  });
}

const positions = positionsFor(universes.length);

// Relative weights for the sub-animations inside each transition (arbitrary
// units — the real on-screen speed of a step is set by STEP_DURATION below,
// GSAP just samples these proportionally within that window). `hold` is the
// deliberate dwell at zoom-1 in the middle of a flight: the camera parks on
// the block for a beat — long enough to read its title/description — before
// diving on into zoom-2.
const T = { in: 1.3, hold: 0.5, deepen: 0.95, surface: 0.7, out: 0.85 };

// Real seconds for each clip. Simple pause-per-block pacing, like a video
// you scroll to play/pause: one scroll takes you from the overview into a
// block's zoom-1 then all the way into its zoom-2, where it PAUSES. The
// next scroll resumes — dézooms back to the overview and dives into the
// next block, pausing again at its zoom-2. No speed-up, no "turbo": every
// clip always plays at its own natural pace.
const STEP_DURATION = { inDeep: 3.4, next: 4.6, out: 1.8 };
const STEP_EASE = 'power2.inOut';

// One camera easing curve for every block — kept uniform on purpose so the
// flight never has a jarring speed change from one step to the next; only
// the decorative ring accent's easing varies per universe.
const FLIGHT_STYLES = [
  { ringEase: 'back.out(1.4)' },
  { ringEase: 'elastic.out(1,0.65)' },
  { ringEase: 'back.out(2)' },
  { ringEase: 'power1.out' },
  { ringEase: 'back.out(1.8)' },
  { ringEase: 'elastic.out(1,0.5)' },
];

// ---------------------------------------------------------------------
// Finale: once every universe has been visited, the blocks slide left and
// stack into a single deck, a white iris wipes over to "close" the scene,
// then the slogan pops in, holds, and fades — a clean hand-off into the
// rest of the page instead of just stopping cold.
// ---------------------------------------------------------------------
const FINALE_SLOGAN_LINE_1 = 'Faites entrer la fête';
const FINALE_SLOGAN_LINE_2 = 'dans votre poche';

function ZUIHubStory() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRefs = useRef([]);
  const descRefs = useRef([]);
  const ringRefs = useRef([]);
  const overlayRefs = useRef([]);
  const blockRefs = useRef([]);
  const titleRefs = useRef([]);
  const flashRefs = useRef([]);
  const logoRef = useRef(null);
  const irisRef = useRef(null);
  const finaleTextRef = useRef(null);
  const tlRef = useRef(null);
  const stRef = useRef(null);
  const stopsRef = useRef([]);
  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const accumRef = useRef(0);
  const lastScrollRef = useRef(0);

  // Story already finished once this tab session — render the resting
  // final frame statically, no pin, no replay (only a hard refresh resets
  // sessionStorage and brings the animated version back).
  const [alreadyDone] = useState(() => {
    try {
      return sessionStorage.getItem(DONE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [finished, setFinished] = useState(alreadyDone);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canvas = canvasRef.current;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const navHeight = viewportW < 1024 ? 64 : 80;
      const usableH = viewportH - navHeight;

      const maxX = Math.max(...positions.map((p) => Math.abs(p.x))) + BLOCK_W / 2;
      const maxY = Math.max(...positions.map((p) => Math.abs(p.y))) + BLOCK_H / 2;
      // Fuller bleed than before (0.94/0.9) — the wide-ellipse orbit above
      // already frees up the margin this used to need as safety room.
      const OVERVIEW = Math.min(
        (viewportW * 0.97) / (maxX * 2),
        (usableH * 0.94) / (maxY * 2)
      );
      const mobile = viewportW < 768;
      const ZOOM_1 = mobile ? Math.min(1, (viewportW * 0.88) / BLOCK_W) : 1;
      const ZOOM_2 = ZOOM_1 * 1.4;
      // Push the whole scene down by half the navbar height so the fixed
      // header never overlaps blocks that sit near the top of the canvas.
      const yOffset = navHeight / 2;

      gsap.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW, transformOrigin: '50% 50%' });
      gsap.set(imgRefs.current, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(descRefs.current, { opacity: 0, y: 12 });
      gsap.set(ringRefs.current, { opacity: 0, scale: 0.92 });
      gsap.set(overlayRefs.current, { opacity: 0, pointerEvents: 'none' });
      gsap.set(flashRefs.current, { opacity: 0 });
      gsap.set(blockRefs.current, { opacity: 1, filter: 'blur(0px)' });
      gsap.set(logoRef.current, { opacity: 1, filter: 'blur(0px)' });
      gsap.set(irisRef.current, { scale: 0 });
      gsap.set(finaleTextRef.current, { opacity: 0, scale: 0.85 });

      // Already rode the full story this session — leave the canvas parked
      // on the resting overview frame and skip building the scroll-jacking
      // timeline altogether (no pin is created in the effect below either).
      if (alreadyDone) return;

      // This timeline is never scrubbed by raw scroll position. It's a fixed
      // score of camera moves, paused, that we play with tl.tweenTo() one
      // clip at a time — a scroll only presses "play" on the next clip.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
      tlRef.current = tl;

      const flyTo = (dx, dy, S, dur, ease, pos) =>
        tl.to(canvas, { x: -dx * S, y: -dy * S + yOffset, scale: S, duration: dur, ease: ease || 'power3.inOut' }, pos ?? '>');

      const stops = ['overview-0'];
      tl.addLabel('overview-0');

      positions.forEach((p, i) => {
        const desc = descRefs.current[i];
        const ring = ringRefs.current[i];
        const overlay = overlayRefs.current[i];
        const title = titleRefs.current[i];
        const flash = flashRefs.current[i];
        const ringColor = RING_COLORS[i % RING_COLORS.length];
        const others = blockRefs.current.filter((_, idx) => idx !== i).concat([logoRef.current]);
        const style = FLIGHT_STYLES[i % FLIGHT_STYLES.length];
        gsap.set(ring, { '--ring-color': ringColor });

        // 1. OVERVIEW → ZOOM-1  (spotlight this block, dim every other one)
        // Anchored explicitly on tl.duration() (the timeline's true furthest
        // point) rather than the implicit '>' shorthand — '>' resolves to
        // "end of the most recently *inserted* tween", which for i>0 is the
        // previous block's `others` dim-restore tween, not its actual (later)
        // ending flyTo. Without this, this block's camera flight used to
        // start early and visibly collide with the previous block's outro.
        let t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_1, T.in, 'power2.inOut', t0);
        tl.to(ring, { opacity: 1, scale: 1, duration: T.in * 0.6, ease: style.ringEase }, '<');
        tl.to(desc, { opacity: 1, y: 0, duration: T.in * 0.45, ease: 'power2.out' }, `>-${T.in * 0.25}`);
        // Anchored on the phase's own start time (not chained with '<') so it
        // never shifts the ring/desc sequence above.
        tl.to(others, { opacity: 0.2, filter: 'blur(8px)', duration: T.in, ease: 'power2.out' }, t0);
        tl.addLabel(`zoom1-${i}`);
        // Reading pause: the camera parks at zoom-1 for a beat (relative
        // weight T.hold of the whole clip) so the block's title/description
        // can actually be read before the dive continues into zoom-2.
        tl.to({}, { duration: T.hold });

        // 2. ZOOM-1 → ZOOM-2  (dive in with a quick colored flash)
        tl.to(ring, { opacity: 0, scale: 1.08, duration: T.deepen * 0.35, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, y: -6, duration: T.deepen * 0.3 }, '<');
        if (title) {
          // Fully hidden (not just reset) once the immersive overlay takes
          // over — otherwise the block's own title, blown up underneath,
          // shows through as a stray duplicate of the overlay's big title.
          tl.to(title, { opacity: 0, scale: 1, duration: T.deepen * 0.3 }, '<');
        }
        t0 = tl.duration();
        flyTo(p.x, p.y, ZOOM_2, T.deepen, 'power2.inOut');
        tl.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: T.deepen * 0.55, ease: 'power2.inOut' }, `>-${T.deepen * 0.45}`);
        if (flash) {
          tl.set(flash, { '--flash-color': ringColor }, t0);
          tl.to(flash, { opacity: 0.35, duration: T.deepen * 0.25, ease: 'power1.in' }, t0);
          tl.to(flash, { opacity: 0, duration: T.deepen * 0.5, ease: 'power1.out' }, t0 + T.deepen * 0.25);
        }
        tl.addLabel(`zoom2-${i}`);
        // The zoom-2 screens are resting "paused" stops — like a paused
        // video — plus the initial overview and the finale at the very end:
        // one scroll always plays the clip through to the next pause point.
        stops.push(`zoom2-${i}`);

        // 3. ZOOM-2 → OVERVIEW, one continuous dézoom with a brief pass
        // through zoom-1 on the way out, then straight into the next
        // universe's flight (this whole path plays as ONE clip per scroll).
        tl.to(overlay, { opacity: 0, pointerEvents: 'none', duration: T.surface * 0.45, ease: 'power2.in' });
        flyTo(p.x, p.y, ZOOM_1, T.surface, 'power2.out');
        tl.to(desc, { opacity: 1, y: 0, duration: T.surface * 0.5 }, `>-${T.surface * 0.35}`);
        if (title) {
          tl.to(title, { opacity: 1, duration: T.surface * 0.5 }, '<');
        }
        tl.to(ring, { opacity: 1, scale: 1, duration: T.surface * 0.4 }, `>-${T.surface * 0.35}`);

        t0 = tl.duration();
        tl.to(ring, { opacity: 0, scale: 0.92, duration: T.out * 0.4, ease: 'power2.in' });
        tl.to(desc, { opacity: 0, duration: T.out * 0.35 }, '<');
        flyTo(0, 0, OVERVIEW, T.out, 'power3.inOut');
        tl.to(others, { opacity: 1, filter: 'blur(0px)', duration: T.out, ease: 'power2.inOut' }, t0);
        tl.addLabel(`overview-${i + 1}`);
      });

      // The last "back to overview" reached above is the resting stop right
      // before the finale — give it a stable name and register it.
      tl.addLabel('overview-final', `overview-${positions.length}`);
      stops.push('overview-final');

      // -----------------------------------------------------------------
      // FINALE — every block slides left and stacks into one deck, a white
      // iris wipes over to "close" the scene (game-transition style), then
      // the slogan pops in, holds, and fades before the section lets go.
      // -----------------------------------------------------------------
      const stackTarget = { x: -maxX * 0.42, y: 0 };
      const finaleStart = tl.duration();
      const stackStagger = 0.32;
      const stackDuration = 1.05;

      universes.forEach((_, i) => {
        const dx = stackTarget.x - positions[i].x;
        const dy = stackTarget.y - positions[i].y;
        const block = blockRefs.current[i];
        const t0 = finaleStart + i * stackStagger;
        tl.to(
          [descRefs.current[i], titleRefs.current[i], ringRefs.current[i]].filter(Boolean),
          { opacity: 0, duration: 0.3 },
          t0
        );
        tl.to(
          block,
          {
            x: `+=${dx}`,
            y: `+=${dy}`,
            rotation: -8 + i * 3.5,
            scale: 0.82,
            duration: stackDuration,
            ease: 'power2.inOut',
          },
          t0
        );
      });
      tl.to(logoRef.current, { opacity: 0, scale: 0.8, duration: 0.5 }, finaleStart);

      const stackDoneAt = finaleStart + (universes.length - 1) * stackStagger + stackDuration;

      // Iris closes over the stacked deck...
      tl.to(irisRef.current, { scale: 1, duration: 0.55, ease: 'power2.in' }, stackDoneAt - 0.2);
      // ...hidden behind full white, the scene resets instantly...
      tl.set(blockRefs.current, { opacity: 0 }, stackDoneAt + 0.3);
      tl.set(canvas, { x: 0, y: yOffset, scale: OVERVIEW }, stackDoneAt + 0.3);
      // ...and the iris opens back onto an empty, resting canvas.
      tl.to(irisRef.current, { scale: 0, duration: 0.55, ease: 'power2.out' }, stackDoneAt + 0.35);

      // The slogan pops into view — no typewriter — holds, then fades.
      tl.to(finaleTextRef.current, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.5)' }, stackDoneAt + 0.75);
      tl.to({}, { duration: 1.3 });
      tl.to(finaleTextRef.current, { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in' });

      tl.addLabel('finale-done');
      stops.push('finale-done');

      stopsRef.current = stops;
    }, rootRef);
    return () => ctx.revert();
  }, [alreadyDone]);

  // -- Step engine: pause-per-block, like a video you scroll to play/pause --
  // One scroll plays the next clip through to its resting pause point. No
  // "turbo", no fast-forward: every clip always plays at its own natural
  // pace, and scrolling while one is already playing does nothing — exactly
  // like scrolling can't speed up a video that's already unpaused.

  const durationFor = (fromIdx, toIdx) => {
    const stops = stopsRef.current;
    const from = stops[Math.min(fromIdx, toIdx)];
    const to = stops[Math.max(fromIdx, toIdx)];
    if (to === 'finale-done') return STEP_DURATION.finale;
    if (from === 'overview-0') return STEP_DURATION.inDeep;
    if (to === 'overview-final') return STEP_DURATION.out;
    return STEP_DURATION.next;
  };

  const markDoneIfFinished = (clamped, stopsLength) => {
    if (clamped !== stopsLength - 1) return;
    try {
      sessionStorage.setItem(DONE_KEY, '1');
    } catch {
      /* private browsing / storage disabled — harmless to skip */
    }
    setFinished(true);
  };

  const goToStep = (rawIndex) => {
    const stops = stopsRef.current;
    const tl = tlRef.current;
    if (!tl || !stops.length || isAnimatingRef.current) return;
    const clamped = Math.max(0, Math.min(stops.length - 1, rawIndex));
    if (clamped === currentStepRef.current) return;
    const duration = durationFor(currentStepRef.current, clamped);
    isAnimatingRef.current = true;
    currentStepRef.current = clamped;
    tl.tweenTo(stops[clamped], {
      duration,
      ease: STEP_EASE,
      onComplete: () => {
        isAnimatingRef.current = false;
        // Once the very first or very last stop is genuinely reached (the
        // clip has finished playing), snap the real scroll position to the
        // trigger's start/end so ScrollTrigger's pin releases immediately
        // instead of requiring the user to scroll through dead space.
        const st = stRef.current;
        if (st) {
          if (clamped === 0) st.scroll(st.start);
          else if (clamped === stops.length - 1) st.scroll(st.end);
          lastScrollRef.current = st.scroll();
        }
        markDoneIfFinished(clamped, stops.length);
      },
    });
  };

  // "Passer" — fast-forward straight through to the finale (and out the
  // other side of it), skipping whatever is left of the block-by-block
  // tour, then mark it done so it never replays this session.
  const skipToEnd = () => {
    const stops = stopsRef.current;
    const tl = tlRef.current;
    if (!tl || !stops.length) return;
    const last = stops.length - 1;
    if (currentStepRef.current === last) {
      markDoneIfFinished(last, stops.length);
      return;
    }
    isAnimatingRef.current = true;
    currentStepRef.current = last;
    tl.tweenTo(stops[last], {
      duration: 3.6,
      ease: 'power2.inOut',
      onComplete: () => {
        isAnimatingRef.current = false;
        const st = stRef.current;
        if (st) {
          st.scroll(st.end);
          lastScrollRef.current = st.scroll();
        }
        markDoneIfFinished(last, stops.length);
      },
    });
  };

  // The whole pin + capture engine is delegated to GSAP's ScrollTrigger —
  // `normalizeScroll(true)` irons out mobile touch/momentum inconsistencies.
  // We never scrub the camera 1:1 with scroll position: a small scroll is
  // just the "play" signal, and the clip's own duration paces the story.
  useEffect(() => {
    if (alreadyDone) return;
    ScrollTrigger.normalizeScroll(true);

    const FIRE_THRESHOLD = 24;

    const st = ScrollTrigger.create({
      trigger: rootRef.current,
      // The story only starts capturing scroll once the section is centred
      // in the viewport — not the instant it's merely entered — so arriving
      // at it never feels like an ambush mid-scroll.
      start: 'center center',
      end: () => `+=${Math.max(stopsRef.current.length, 1) * 800}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const stops = stopsRef.current;
        if (!stops.length) return;

        const scroll = self.scroll();
        const delta = scroll - lastScrollRef.current;
        lastScrollRef.current = scroll;
        if (!delta) return;

        const atStart = currentStepRef.current === 0;
        const atEnd = currentStepRef.current === stops.length - 1;
        // Let native scroll take over at the story's two ends.
        if (atStart && delta < 0) return;
        if (atEnd && delta > 0) return;

        // A clip is already playing — like a video already un-paused,
        // extra scroll input while it plays doesn't do anything. This is
        // the whole "pause per block" behaviour: no banking, no chaining.
        if (isAnimatingRef.current) return;

        if (Math.sign(accumRef.current) === -Math.sign(delta)) {
          accumRef.current = 0;
        }
        accumRef.current += delta;

        if (Math.abs(accumRef.current) >= FIRE_THRESHOLD) {
          const dir = accumRef.current > 0 ? 1 : -1;
          accumRef.current = 0;
          goToStep(currentStepRef.current + dir);
        }
      },
    });
    stRef.current = st;

    return () => st.kill();
  }, [alreadyDone]);

  return (
    // ScrollTrigger's `pin: true` wraps this in its own spacer and pins it
    // at top:0 for the whole scroll budget above.
    <section
      ref={rootRef}
      className="relative h-[100svh] overflow-hidden"
      aria-label="Les 6 univers de Moledi Event"
    >

      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={canvasRef} data-testid="zui-canvas" className="absolute left-1/2 top-1/2" style={{ willChange: 'transform' }}>
          <CenterLogo logoRef={logoRef} />
          {universes.map((univ, i) => (
            <Block
              key={univ.id}
              univ={univ}
              pos={positions[i]}
              imgRef={(el) => (imgRefs.current[i] = el)}
              descRef={(el) => (descRefs.current[i] = el)}
              ringRef={(el) => (ringRefs.current[i] = el)}
              blockRef={(el) => (blockRefs.current[i] = el)}
              titleRef={(el) => (titleRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>

      {universes.map((univ, i) => (
        <div
          key={`${univ.id}-flash`}
          ref={(el) => (flashRefs.current[i] = el)}
          className="pointer-events-none fixed inset-0 z-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, var(--flash-color, #FF6A00) 0%, transparent 65%)' }}
        />
      ))}

      {universes.map((univ, i) => (
        <ImmersiveOverlay
          key={`${univ.id}-overlay`}
          univ={univ}
          index={i}
          overlayRef={(el) => (overlayRefs.current[i] = el)}
        />
      ))}

      {/* Finale iris — a plain white disc that wipes over the stacked deck
          (closing) then back down (opening) onto the empty resting scene,
          like a classic game-transition cut. */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
        <div ref={irisRef} className="w-[300vmax] h-[300vmax] rounded-full bg-white" />
      </div>

      {/* Finale slogan — pops in (not typewritten), holds, fades. */}
      <div
        ref={finaleTextRef}
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <p className="text-ink-900 text-3xl sm:text-5xl leading-tight text-center">
          <span className="block">{FINALE_SLOGAN_LINE_1}</span>
          <span className="block bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">
            {FINALE_SLOGAN_LINE_2}
          </span>
        </p>
      </div>

      {/* Sober "skip" — fast-forwards through to the finale. Sits at the
          bottom of this (100svh) section, which is exactly the bottom of
          the screen once the story is actively pinned. */}
      {!finished && (
        <button
          type="button"
          onClick={skipToEnd}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] text-xs font-semibold text-ink-700 bg-white/80 backdrop-blur-sm border border-ink-200 rounded-lg px-4 py-2 hover:text-ink-900 hover:border-ink-300 transition-colors"
        >
          Passer
        </button>
      )}
    </section>
  );
}

function CenterLogo({ logoRef }) {
  return (
    <div ref={logoRef} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0, willChange: 'opacity, filter' }}>
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
        <div className="absolute inset-[-20px] rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute inset-[-8px] rounded-full border border-primary/25 animate-[spin_20s_linear_infinite]" />
        <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-full bg-white shadow-[0_18px_50px_-12px_rgba(255,106,0,0.4)] flex items-center justify-center">
          <LogoImg />
        </div>
      </div>
    </div>
  );
}

function LogoImg() {
  return (
    <img
      src={media.logoMark}
      alt="Moledi Event"
      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
    />
  );
}

function Block({ univ, pos, imgRef, descRef, ringRef, blockRef, titleRef }) {
  return (
    <div
      ref={blockRef}
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: BLOCK_W,
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
        willChange: 'opacity, filter',
      }}
    >
      <div
        ref={ringRef}
        className="pointer-events-none absolute -inset-2.5 rounded-[36px]"
        style={{
          border: '3px solid var(--ring-color, #FF6A00)',
          boxShadow: '0 0 60px -10px var(--ring-color, #FF6A00), inset 0 0 30px -15px var(--ring-color, #FF6A00)',
        }}
      />
      <div
        className="relative rounded-[28px] overflow-hidden shadow-[0_24px_60px_-18px_rgba(11,19,36,0.35)] bg-white"
        style={{ height: BLOCK_H }}
      >
        <img
          ref={imgRef}
          src={univ.image}
          alt={univ.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3
            ref={titleRef}
            className="font-heading text-white text-2xl sm:text-3xl leading-tight normal-case"
            style={{ willChange: 'transform' }}
          >
            {univ.label}
          </h3>
          <p ref={descRef} className="text-white/90 text-sm sm:text-base leading-relaxed normal-case mt-3">
            {univ.definition}
          </p>
        </div>
      </div>
    </div>
  );
}

function IconSteps({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 6h4M4 12h4M4 18h4" />
      <path d="M12 6h8M12 12h8M12 18h8" opacity="0.5" />
    </svg>
  );
}

function IconPeople({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 8.5a3 3 0 1 0 0-5.4" opacity="0.6" />
      <path d="M18 14.3c2.6.5 4.5 2.6 4.5 5.7" opacity="0.6" />
    </svg>
  );
}

function IconShield({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StepsWidget({ steps, color, layout }) {
  if (layout === 'row') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex-1 flex sm:flex-col items-start gap-2.5">
            <span
              className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            <p className="text-ink-700 text-xs sm:text-[13px] leading-snug normal-case">{step}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol>
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className="flex-none w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {idx + 1}
            </span>
            {idx < steps.length - 1 && <span className="w-px flex-1 min-h-[0.8rem] my-1 bg-ink-200" />}
          </div>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case pb-2.5">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function TagsWidget({ tags }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="text-[11px] sm:text-xs text-ink-700 px-2.5 py-1 rounded-full border border-ink-200 bg-white normal-case"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white border border-ink-200 p-4 sm:p-5 shadow-[0_10px_30px_-18px_rgba(11,19,36,0.25)] ${className}`}>
      {children}
    </div>
  );
}

function PanelHeading({ icon, color, children }) {
  return (
    <h4 className="flex items-center gap-2 text-ink-900 font-heading text-xs sm:text-sm tracking-wide uppercase mb-3">
      {icon({ color })}
      {children}
    </h4>
  );
}

function Thumb({ src, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
    </div>
  );
}

// Each universe gets its own genuinely different way of presenting the same
// three pieces of data (steps / who / trust), with real imagery inside, all
// sized to fit a single viewport on desktop (no internal scrolling).
const DETAIL_LAYOUTS = [TimelineDetail, TicketDetail, RadialDetail, ProgressDetail, SplitDetail, RaffleDetail];

function ImmersiveOverlay({ univ, overlayRef, index }) {
  const color = RING_COLORS[index % RING_COLORS.length];
  const steps = univ.nested.how.text.split('→').map((s) => s.trim()).filter(Boolean);
  const tags = univ.nested.who.text.split(',').map((s) => s.trim()).filter(Boolean);
  const trust = univ.nested.trust;
  const Layout = DETAIL_LAYOUTS[index % DETAIL_LAYOUTS.length];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-30 overflow-y-auto lg:overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute inset-0">
        <img src={univ.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/[0.93]" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}14, transparent 55%)` }}
        />
      </div>

      <div className="relative min-h-full lg:h-full flex items-center justify-center px-4 pt-20 pb-8 lg:pt-24 lg:pb-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-5 sm:mb-6">
            <span
              className="inline-block text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-semibold mb-2 px-3 py-1 rounded-full border bg-white/70"
              style={{ color, borderColor: `${color}55` }}
            >
              Univers Moledi Event
            </span>
            <h3 className="font-heading text-ink-900 text-2xl sm:text-3xl lg:text-4xl normal-case">
              {univ.label}
            </h3>
            <p className="mt-2 max-w-2xl mx-auto text-ink-700 text-xs sm:text-sm leading-relaxed normal-case">
              {univ.definition}
            </p>
          </div>

          <Layout univ={univ} steps={steps} tags={tags} trust={trust} color={color} />
        </div>
      </div>
    </div>
  );
}

// Votes & Scrutins — a connected vertical timeline beside a tall visual.
function TimelineDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
      <Thumb src={univ.nested.how.image} className="hidden lg:block lg:col-span-3 min-h-[16rem]" />
      <Panel className="lg:col-span-5">
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <StepsWidget steps={steps} color={color} layout="column" />
      </Panel>
      <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border flex-1" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Billetterie — a boarding-pass: photo on the left of the ticket, steps as
// stages printed across it, perforated divider before the who/trust stub.
function TicketDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="rounded-3xl bg-white border border-ink-200 shadow-[0_18px_50px_-20px_rgba(11,19,36,0.3)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <Thumb src={univ.nested.how.image} className="hidden lg:block rounded-none min-h-full" />
        <div className="lg:col-span-3 p-4 sm:p-6">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
          <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4 sm:gap-0">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex sm:flex-col items-center gap-2.5 relative">
                <span
                  className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {idx + 1}
                </span>
                <p className="text-ink-700 text-xs leading-snug normal-case text-left sm:text-center sm:px-2">{step}</p>
                {idx < steps.length - 1 && (
                  <span
                    className="hidden sm:block absolute top-4 left-[calc(50%+22px)] right-[calc(-50%+22px)] border-t-2 border-dashed"
                    style={{ borderColor: `${color}45` }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative border-t-2 border-dashed border-ink-200 mx-5 sm:mx-8">
        <span className="absolute -left-[30px] -top-2.5 w-5 h-5 rounded-full bg-ink-100" />
        <span className="absolute -right-[30px] -top-2.5 w-5 h-5 rounded-full bg-ink-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 p-4 sm:p-6">
        <div>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </div>
        <div className="rounded-xl p-3.5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Dons & Cagnottes — a radial dial (trust at the centre, steps orbiting)
// beside the who/imagery column: reads like a fundraising meter.
function RadialDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-stretch">
      <Panel>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <StepsWidget steps={steps} color={color} layout="row" />
      </Panel>
      <div className="flex flex-col gap-3 sm:gap-4">
        <Thumb src={univ.nested.who.image} className="hidden lg:block h-28" />
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs sm:text-sm leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Crowdfunding — a milestone progress bar with panels below.
function ProgressDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <Panel>
        <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        <div className="pt-1">
          <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '72%', background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
          </div>
          <div className="flex justify-between mt-3 gap-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center">
                <span className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: color }} />
                <p className="text-ink-700 text-[11px] sm:text-xs leading-snug normal-case">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Thumb src={univ.nested.who.image} className="hidden sm:block min-h-[8rem]" />
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: `${color}0d`, borderColor: `${color}35` }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
      </div>
    </div>
  );
}

// Sponsoring — a split "matchmaking" panel: organizer steps on one side,
// the brand-facing tinted side on the other, with a photo bridge.
function SplitDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="rounded-3xl bg-white border border-ink-200 shadow-[0_18px_50px_-20px_rgba(11,19,36,0.3)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2 p-4 sm:p-6 lg:border-r border-ink-200 border-b lg:border-b-0">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
          <StepsWidget steps={steps} color={color} layout="column" />
        </div>
        <Thumb src={univ.nested.how.image} className="hidden lg:block rounded-none" />
        <div className="lg:col-span-2 p-4 sm:p-6 flex flex-col gap-4" style={{ background: `${color}0a` }}>
          <div>
            <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
            <TagsWidget tags={tags} />
          </div>
          <div className="rounded-xl p-3.5 border bg-white/70" style={{ borderColor: `${color}35` }}>
            <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
            <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tombolas — scattered raffle-ticket cards with a light tilt.
function RaffleDetail({ univ, steps, tags, trust, color }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <div className="flex justify-center mb-3">
          <PanelHeading icon={IconSteps} color={color}>Comment ça marche</PanelHeading>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative w-full sm:w-52 rounded-xl bg-white border-2 border-dashed p-3.5 shadow-sm"
              style={{ borderColor: `${color}50`, transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * (1.5 + idx)}deg)` }}
            >
              <span
                className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {idx + 1}
              </span>
              <p className="text-ink-700 text-xs leading-snug normal-case">{step}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl p-4 border-2 sm:col-span-1" style={{ background: `${color}0d`, borderColor: color }}>
          <PanelHeading icon={IconShield} color={color}>Confiance</PanelHeading>
          <p className="text-ink-700 text-xs leading-snug normal-case">{trust.text}</p>
        </div>
        <Panel>
          <PanelHeading icon={IconPeople} color={color}>Pour qui</PanelHeading>
          <TagsWidget tags={tags} />
        </Panel>
        <Thumb src={univ.nested.who.image} className="hidden sm:block min-h-[8rem]" />
      </div>
    </div>
  );
}

export default ZUIHubStory;
