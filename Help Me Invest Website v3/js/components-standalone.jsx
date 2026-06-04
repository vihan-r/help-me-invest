/* =========================================================
   Help Me Invest, shared React components
   Loaded by every page. All components attach to window
   so per-page <script type="text/babel"> blocks can use them.
   ========================================================= */

/* The wordmark: "help me" Bold + "invest" Medium, lowercase, single line,
   preceded by the brand 'h' mark. The combined lockup links to the home page. */
function Wordmark({ colour = 'emerald', size = 18 }) {
  const fill = colour === 'paper' ? 'var(--paper)' :
  colour === 'grey' ? 'var(--grey)' :
  'var(--emerald)';
  return (
    <a href={withBase('index.html')} aria-label="help me invest, home" className="brand-lockup" style={{
      color: fill,
      fontSize: `${size}px`,
      lineHeight: 1
    }}>
      <span className="brand-mark" aria-hidden="true" style={{ backgroundImage: `url(${window.__resources.hmiMark})` }}></span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.18em' }}>
        <span style={{ fontWeight: 700 }}>help me</span>
        <span style={{ fontWeight: 500 }}>invest</span>
      </span>
    </a>);

}

/* Phrase highlight: Mint background, Emerald text, padded for descenders. */
function PhraseHighlight({ children }) {
  return <span className="phrase-highlight">{children}</span>;
}

/* Buttons (primary Emerald, secondary Lighter Mint), rendered as <a> since
   this MVP is non-functional. Labels are verbs that complete "I want to ___". */
function PrimaryButton({ to, children }) {
  return <a className="btn btn-primary" href={withBase(to)}>{children}</a>;
}
function SecondaryButton({ to, children }) {
  return <a className="btn btn-secondary" href={withBase(to)}>{children}</a>;
}
function TertiaryLink({ to, children }) {
  return <a className="tertiary-link" href={withBase(to)}>{children}</a>;
}

/* The site header. `active` matches a nav slug.
   Layout: wordmark left, nav + "Talk to an expert" button on the right. */
function Header({ active }) {
  const items = [
  { slug: 'home', label: 'Home', to: 'index.html' },
  { slug: 'how', label: 'How it works', to: 'how-it-works.html' },
  { slug: 'partners', label: 'Partners', to: 'partners.html' },
  { slug: 'stories', label: 'Investor Stories', to: 'success-stories.html' },
  { slug: 'education', label: 'Education', to: 'education.html' }];

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Wordmark size={20} />
        <div className="site-header-right">
          <nav className="site-nav" aria-label="Primary">
            {items.map((item) =>
            <a key={item.slug}
            href={withBase(item.to)}
            className={active === item.slug ? 'active' : ''}>
                {item.label}
              </a>
            )}
          </nav>
          <a className={`btn btn-secondary btn-sm ${active === 'signin' ? 'is-active' : ''}`}
          href={withBase('account/sign-in.html')}>
            Sign in <Arrow />
          </a>
        </div>
      </div>
    </header>);

}

/* The site footer. */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer-grid">
          <div className="site-footer-col">
            <Wordmark size={20} />
            <p className="body-small" style={{ marginTop: 18, maxWidth: 320 }}>
              A platform for the new generation of Australian investors.
            </p>
          </div>
          <div className="site-footer-col">
            <h5>Site</h5>
            <ul>
              <li><a href={withBase('index.html')}>Home</a></li>
              <li><a href={withBase('partners.html')}>Partners</a></li>
              <li><a href={withBase('success-stories.html')}>Investor Stories</a></li>
              <li><a href={withBase('education.html')}>Education</a></li>
              <li><a href={withBase('find-an-expert.html')}>Talk to an expert</a></li>
              <li><a href={withBase('contact.html')}>Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer-meta">
          Help Me Invest Pty Ltd · ABN 00 000 000 000 · Level 4, 100 Collins Street, Melbourne VIC 3000 · 2026
        </div>
      </div>
    </footer>);

}

/* Editorial portrait placeholder. We do not invent photography. */
function Placeholder({ ratio = '4x5', label, emerald = false, style = {} }) {
  return (
    <div className={`placeholder ratio-${ratio} ${emerald ? 'emerald' : ''}`} style={style}>
      <span className="placeholder-label">{label}</span>
    </div>);

}

/* The signature diagram. Vertical stack of labelled Mint blocks,
   knowledge at the top, the everyday investor at the bottom, with thin
   Warm Mid-Grey connecting lines and small Emerald clip markers branching
   off the layers that take a clip. Static (no toggles).
   Labels are always structural, never a profession. */
function ChainDiagram({
  title = 'The chain you can\u2019t see.',
  layers,
  caption,
  topLabel = 'Knowledge',
  bottomLabel = 'The everyday investor'
}) {
  return (
    <figure className="chain-v2">
      {title && <figcaption className="chain-title">{title}</figcaption>}
      <div className="chain-v2-stack">
        <ChainNode label={topLabel} terminal />
        {layers.map((l, i) =>
        <React.Fragment key={i}>
            <ChainConnector />
            <ChainNode label={l.label} description={l.description} clip={l.clip} />
          </React.Fragment>
        )}
        <ChainConnector />
        <ChainNode label={bottomLabel} terminal />
      </div>
      {caption && <p className="chain-caption">{caption}</p>}
    </figure>);

}

function ChainNode({ label, description, clip, terminal }) {
  return (
    <div className={`chain-node ${terminal ? 'is-terminal' : ''} ${clip ? 'has-clip' : ''}`}
    data-reveal-chain="">
      <div className="chain-node-box">
        <p className="chain-node-label">{label}</p>
      </div>
      {clip &&
      <div className="chain-node-clip" aria-hidden="true">
          <span className="chain-clip-line"></span>
          <span className="chain-clip-dot"></span>
          <span className="chain-clip-label">Clip taken</span>
        </div>
      }
    </div>);

}

function ChainConnector() {
  return (
    <div className="chain-connector" aria-hidden="true">
      <span className="chain-connector-line"></span>
      <span className="chain-connector-arrow"></span>
    </div>);

}

/* The platform alternative: two boxes connected by one direct line.
   No layers, no clip markers. The directness is the visual story. */
function PlatformDiagram({
  title = 'The way Help Me Invest works.',
  topLabel = 'Knowledge',
  bottomLabel = 'The everyday investor',
  caption
}) {
  return (
    <figure className="chain-v2">
      {title && <figcaption className="chain-title">{title}</figcaption>}
      <div className="chain-v2-stack is-platform">
        <ChainNode label={topLabel} terminal />
        <div className="platform-connector" aria-hidden="true">
          <span className="platform-connector-line"></span>
          <span className="platform-connector-label">Direct access</span>
          <span className="platform-connector-arrow"></span>
        </div>
        <ChainNode label={bottomLabel} terminal />
      </div>
      {caption && <p className="chain-caption">{caption}</p>}
    </figure>);

}

/* Eyebrow used at the top of long-form education pages. */
function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

/* Generic video module placeholder used on education pages.
   Pre-launch the thumbnail is a Mint block with a play icon + duration;
   in production this becomes the real video poster. */
function VideoModule({ index, title, duration = '00:00', blurb, resource }) {
  const num = String(index).padStart(2, '0');
  return (
    <article className="video-module">
      <div className="video-placeholder" role="button" tabIndex="0" aria-label={`Play module ${num} \u2014 ${title}`}>
        <div className="video-play" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l10-5.5z" /></svg>
        </div>
        <span className="video-duration">{duration}</span>
      </div>
      <div className="video-module-meta">
        <p className="video-module-eyebrow">Module {num}</p>
        <h3 className="video-module-title">{title}</h3>
        <p className="video-module-blurb">{blurb}</p>
        {resource &&
        <div className="video-module-actions">
            <a className="resource" href="#">{resource} <Arrow /></a>
          </div>
        }
      </div>
    </article>);

}

/* Arrow glyph used consistently in buttons + tertiary links. The
   `.anim-arrow` class lets CSS nudge it on hover (see styles.css). */
function Arrow() {
  return <span aria-hidden="true" className="anim-arrow">&rarr;</span>;
}

/* withBase: lets education sub-pages (which live one folder deeper)
   resolve links back to the root. Pages set window.__BASE before
   ReactDOM.render to either '' (root) or '../' (sub-page). */
function withBase(path) {
  const base = typeof window !== 'undefined' && window.__BASE || '';
  if (path.startsWith('#') || /^https?:/.test(path)) return path;
  return base + path;
}

/* Export every shared symbol, Babel files don't share scope. */
Object.assign(window, {
  Wordmark, PhraseHighlight,
  PrimaryButton, SecondaryButton, TertiaryLink,
  Header, Footer, Placeholder,
  ChainDiagram, PlatformDiagram, ChainNode, ChainConnector,
  Eyebrow, Arrow, VideoModule, withBase
});

/* Scroll reveal & motion system, 
   Watches for elements with [data-reveal] (and [data-reveal-chain] for
   the diagrams) and toggles an `is-in` class as each crosses 15%
   above the viewport bottom. Sections fade up; sibling elements
   inside each section can stagger via inline `--reveal-delay`.
   Self-scheduling: rescans for ~1.5s after load to pick up
   React-rendered nodes without each page registering. Also wires up
   the header's scrolled-state class. */
(function setupMotion() {
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header scrolled state, 
  function syncHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 100);
  }
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if (reduced) return;

  // Reveal observers, 
  const seen = new WeakSet();
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        sectionObserver.unobserve(e.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -15% 0px' });

  const itemObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        itemObserver.unobserve(e.target);
      }
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

  function scan() {
    // Section-level reveals (legacy + still useful).
    document.querySelectorAll('main > section').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      // Skip the hero, it animates via its own keyframes on load.
      if (el.matches('.hero-card-wrap') || el.contains(document.querySelector('.hero-card'))) {
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('reveal', 'is-visible');
        return;
      }
      el.classList.add('reveal');
      sectionObserver.observe(el);
    });

    // Per-element reveals (anything with [data-reveal] or [data-reveal-chain]).
    document.querySelectorAll('[data-reveal], [data-reveal-chain]').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('is-in');
        return;
      }
      itemObserver.observe(el);
    });
  }

  scan();
  let frames = 0;
  function rescan() {
    scan();
    if (frames++ < 60) requestAnimationFrame(rescan);
  }
  requestAnimationFrame(rescan);
})();