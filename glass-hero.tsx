"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Content — edit here                                                 */
/* ------------------------------------------------------------------ */

const CTA_HREF = "https://github.com/akshat017-beep";

const NAME = "Akshat Dobhal";

const HEADLINE = ["Creating", "Technology", "with Purpose"];

const INTRO =
  "Hi, I’m Akshat — a Computer Science & AI/ML student who turns curiosity into code, ideas into products, and problems into intelligent solutions.";

const TAGLINE = ["Where", "curiosity", "meets code"];

// About / Work point at GitHub. Process / Experiments are placeholders:
// point them at real pages once those exist.
const NAV_LINKS = [
  { label: "About", href: "https://github.com/akshat017-beep" },
  { label: "Work", href: "https://github.com/akshat017-beep?tab=repositories" },
  { label: "Process", href: "#process" },
  { label: "Experiments", href: "#experiments" },
] as const;

/* ------------------------------------------------------------------ */
/* Reveal tuning                                                       */
/* ------------------------------------------------------------------ */

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;
const POSITION_FACTOR = 0.14;
const RADIUS_FACTOR = 0.12;
const OFFSCREEN = -999;
const SETTLE_EPSILON = 0.1;

// Image URLs are handed to CSS as custom properties so the bundler never
// tries to resolve them; globals.css picks the pair per breakpoint.
const imageVars = {
  "--img-base-desktop": 'url("/images/Base_image_desktop.png")',
  "--img-reveal-desktop": 'url("/images/Reveal_image_desktop.png")',
  "--img-base-mobile": 'url("/images/Base_image_mobile.png")',
  "--img-reveal-mobile": 'url("/images/Reveal_image_mobile.png")',
} as CSSProperties;

const isExternal = (href: string) => /^https?:\/\//.test(href);

function externalProps(href: string) {
  return isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {};
}

function NewTabHint({ href }: { href: string }) {
  return isExternal(href) ? <span className="sr-only"> (opens in a new tab)</span> : null;
}

/* ------------------------------------------------------------------ */

export default function GlassHero() {
  const heroRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // Animation state lives in refs: pointer movement never re-renders React.
  const rawPos = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const smoothPos = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const radius = useRef(0);
  const targetRadius = useRef(0);
  const isTouching = useRef(false);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const reveal = revealRef.current;
    if (!hero || !reveal) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    const writeVars = () => {
      reveal.style.setProperty("--reveal-x", `${smoothPos.current.x.toFixed(2)}px`);
      reveal.style.setProperty("--reveal-y", `${smoothPos.current.y.toFixed(2)}px`);
      reveal.style.setProperty("--reveal-radius", `${radius.current.toFixed(2)}px`);
    };

    // The single rAF loop. It runs while anything is still moving and parks
    // itself once settled; frameId guarantees there is never a second loop.
    const tick = () => {
      const posFactor = reducedMotion ? 1 : POSITION_FACTOR;
      const radFactor = reducedMotion ? 1 : RADIUS_FACTOR;
      const s = smoothPos.current;
      const r = rawPos.current;

      s.x += (r.x - s.x) * posFactor;
      s.y += (r.y - s.y) * posFactor;
      radius.current += (targetRadius.current - radius.current) * radFactor;

      const settled =
        Math.abs(r.x - s.x) < SETTLE_EPSILON &&
        Math.abs(r.y - s.y) < SETTLE_EPSILON &&
        Math.abs(targetRadius.current - radius.current) < SETTLE_EPSILON;

      if (settled) {
        s.x = r.x;
        s.y = r.y;
        radius.current = targetRadius.current;
      }

      writeVars();
      frameId.current = settled ? null : requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (frameId.current === null) frameId.current = requestAnimationFrame(tick);
    };

    const setRawFromEvent = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      rawPos.current.x = e.clientX - rect.left;
      rawPos.current.y = e.clientY - rect.top;
    };

    // When the circle is closed, jump to the new point instead of gliding
    // across the screen from wherever it last closed.
    const snapIfClosed = () => {
      if (radius.current < 1) {
        smoothPos.current.x = rawPos.current.x;
        smoothPos.current.y = rawPos.current.y;
      }
    };

    /* ---- mouse ---------------------------------------------------- */

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setRawFromEvent(e);
      snapIfClosed();
      targetRadius.current = DESKTOP_RADIUS;
      ensureLoop();
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      targetRadius.current = 0;
      ensureLoop();
    };

    /* ---- shared move ---------------------------------------------- */

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        setRawFromEvent(e);
        // Covers a cursor that was already inside the hero on page load,
        // where no pointerenter fires.
        if (targetRadius.current === 0) {
          snapIfClosed();
          targetRadius.current = DESKTOP_RADIUS;
        }
        ensureLoop();
        return;
      }
      if (!isTouching.current) return;
      setRawFromEvent(e);
      ensureLoop();
    };

    /* ---- touch / pen ---------------------------------------------- */

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      isTouching.current = true;

      // Capturing a pointer that started on a link or button retargets its
      // click to the hero, which would make the CTAs untappable.
      const onControl = (e.target as Element | null)?.closest("a, button");
      if (!onControl && typeof hero.setPointerCapture === "function") {
        try {
          hero.setPointerCapture(e.pointerId);
        } catch {
          /* capture unsupported for this pointer — tracking still works */
        }
      }

      setRawFromEvent(e);
      smoothPos.current.x = rawPos.current.x;
      smoothPos.current.y = rawPos.current.y;
      targetRadius.current = MOBILE_RADIUS;
      writeVars();
      ensureLoop();
    };

    const endTouch = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      isTouching.current = false;
      targetRadius.current = 0;
      if (hero.hasPointerCapture?.(e.pointerId)) hero.releasePointerCapture(e.pointerId);
      ensureLoop();
    };

    hero.addEventListener("pointerenter", onPointerEnter);
    hero.addEventListener("pointerleave", onPointerLeave);
    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerdown", onPointerDown);
    hero.addEventListener("pointerup", endTouch);
    hero.addEventListener("pointercancel", endTouch);

    return () => {
      hero.removeEventListener("pointerenter", onPointerEnter);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerup", endTouch);
      hero.removeEventListener("pointercancel", endTouch);
      motionQuery.removeEventListener("change", onMotionChange);
      if (frameId.current !== null) cancelAnimationFrame(frameId.current);
      frameId.current = null;
    };
  }, []);

  return (
    <section ref={heroRef} className="hero" style={imageVars} aria-labelledby="hero-title">
      {/* 1–2: portrait pair. Shared wrapper so the entrance scale can never
          misalign base and reveal. */}
      <div className="hero-media" aria-hidden="true">
        <div className="hero-portrait hero-portrait--base" />
        <div ref={revealRef} className="hero-portrait hero-portrait--reveal" />
      </div>

      {/* 3: technical grid + circle */}
      <div className="hero-grid" aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={`c${i}`}
            className={`grid-col${(i + 1) % 3 === 0 ? " grid-col--mobile" : ""}`}
            style={{ left: `${((i + 1) / 12) * 100}%` }}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const n = i + 1;
          const cls = [
            "grid-row",
            n % 3 === 0 ? "grid-row--desktop" : "",
            n % 2 === 0 ? "grid-row--mobile" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return <span key={`r${i}`} className={cls} style={{ top: `${(n / 12) * 100}%` }} />;
        })}
        <span className="grid-circle" />
      </div>

      {/* 4: copy */}
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-title">
          {HEADLINE.map((line, i) => (
            <span key={line} className="hero-title-line" style={{ animationDelay: `${0.35 + i * 0.12}s` }}>
              {line}
              {i < HEADLINE.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <div className="hero-intro">
          <p>{INTRO}</p>
          <a className="pill pill--primary" href={CTA_HREF} {...externalProps(CTA_HREF)}>
            Explore my work
            <NewTabHint href={CTA_HREF} />
          </a>
        </div>

        <p className="hero-tagline">
          {TAGLINE.map((line, i) => (
            <span key={line}>
              {line}
              {i < TAGLINE.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>

      {/* 5: navigation */}
      <header className="hero-header">
        <nav className="hero-nav" aria-label="Primary">
          <a className="brand" href="/" aria-label={`${NAME}, home`}>
            <Monogram />
            <span className="brand-name">{NAME}</span>
          </a>

          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a className="nav-link" href={link.href} {...externalProps(link.href)}>
                  {link.label}
                  <NewTabHint href={link.href} />
                </a>
              </li>
            ))}
          </ul>

          <a className="pill pill--nav" href={CTA_HREF} {...externalProps(CTA_HREF)}>
            Let’s talk
            <NewTabHint href={CTA_HREF} />
          </a>
        </nav>
      </header>
    </section>
  );
}

/** Original "A" monogram: a drafted A whose crossbar runs out to the ring
 *  like a dimension line, ending in a node. */
function Monogram() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M9.2 23.4 L16 8.2 L22.8 23.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.1 17.6 H27.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="27.4" cy="17.6" r="1.35" fill="currentColor" />
    </svg>
  );
}
