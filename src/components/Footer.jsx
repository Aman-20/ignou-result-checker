import { SITE, IGNOU_LINKS } from '../config/siteInfo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section>
          <h3>About</h3>
          <p>
            {SITE.name} is an independent, unofficial tool. It is not affiliated with, endorsed by
            or connected to Indira Gandhi National Open University (IGNOU). It simply reads the
            public status pages IGNOU provides and shows them in an easier layout.
          </p>
        </section>

        <section>
          <h3>Official IGNOU links</h3>
          <ul>
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
          {SITE.contactEmail && (
            <p><a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
          )}
        </section>
      </div>

      <details className="site-footer__terms">
        <summary>Terms &amp; Conditions and Disclaimer</summary>
        <ol>
          <li>This website is unofficial and is provided free, as is, with no warranty of any kind.</li>
          <li>
            Marks, statuses and dates are fetched live from IGNOU. Percentages shown here are
            estimates calculated by this tool and may differ from IGNOU&rsquo;s official result.
          </li>
          <li>Results are indicative only and have no legal validity. Always verify with IGNOU.</li>
          <li>
            Your enrolment number and programme are sent only to fetch your status. We do not
            keep a database of student records. The last programme grade-card layout is remembered
            in your browser for speed.
          </li>
          <li>Only check your own enrolment number. Do not use this tool to access others&rsquo; records.</li>
          <li>
            The service depends on IGNOU&rsquo;s servers. If they are slow, down or change, results
            may be delayed or unavailable.
          </li>
          <li>
            We are not responsible for decisions taken on the basis of the information shown here.
          </li>
        </ol>
      </details>

      <p className="site-footer__copy">
        &copy; {new Date().getFullYear()} {SITE.name}. IGNOU and its logos belong to their respective owners.
      </p>
    </footer>
  )
}
