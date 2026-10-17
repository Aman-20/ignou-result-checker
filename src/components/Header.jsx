import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1.2 2.7 3 6 3s6-1.8 6-3v-5" />
            <path d="M22 10v6" />
          </svg>
        </div>
        <h1>IGNOU Grade Card &amp; Assignment Status Checker</h1>
        <p className="site-header__sub">
          Enter your enrolment number and programme to see your marks, estimated percentage and
          assignment status in one place. Download the result as an image or PDF.
        </p>
        <ul className="site-header__points">
          <li>No login needed</li>
          <li>Live data from IGNOU</li>
          <li>Nothing stored on our side</li>
        </ul>
      </div>
    </header>
  )
}
