import { SITE, IGNOU_LINKS, SOCIAL_LINKS } from '../config/siteInfo'
import './Footer.css'

const ICONS = {
  mail: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.555V9h3.564v11.452Z" />
    </svg>
  ),
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section>
          <h3>About</h3>
          <p>
            {SITE.name} is an independent, unofficial tool. It is not affiliated with or endorsed
            by Indira Gandhi National Open University (IGNOU). It reads the public status pages
            IGNOU provides and shows them in an easier layout.
          </p>
        </section>

        <section>
          <h3>Official IGNOU links</h3>
          <ul className="site-footer__links">
            {IGNOU_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
          <p className="site-footer__small">
            For marks corrections, missing results or re-evaluation, contact your Study Centre or
            Regional Centre.
          </p>
        </section>

        <section>
          <h3>Contact</h3>
          <p>{SITE.contactNote}</p>
          <div className="site-footer__social">
            {SITE.contactEmail && (
              <a className="social-chip" href={`mailto:${SITE.contactEmail}`}>
                {ICONS.mail}
                <span>{SITE.contactEmail}</span>
              </a>
            )}
            {SOCIAL_LINKS.map((s) => (
              <a key={s.href} className="social-chip" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {ICONS[s.icon]}
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <p className="site-footer__copy">
        &copy; {new Date().getFullYear()} {SITE.name}. IGNOU and its logos belong to their respective owners.
      </p>
    </footer>
  )
}
