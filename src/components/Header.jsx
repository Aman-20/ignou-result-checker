import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__badge" aria-hidden="true">🎓</div>
        <h1>IGNOU Grade Card &amp; Assignment Status Checker</h1>
        <p className="site-header__sub">
          Enter your enrolment number and programme to see your marks, estimated percentage and
          assignment status in one place. Download the result as an image or PDF.
        </p>
        <ul className="site-header__points">
          <li>No login needed</li>
          <li>Data comes live from IGNOU</li>
          <li>Nothing is stored on our side</li>
        </ul>
        <p className="site-header__note">
          Unofficial tool. Results are indicative only and have no legal validity.
        </p>
      </div>
    </header>
  )
}
