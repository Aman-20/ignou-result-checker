// Edit this file to change footer details. Nothing here is fetched from IGNOU.

export const SITE = {
  name: 'IGNOU Result Checker',
  contactEmail: 'aman.nishad.dev@gmail.com',
  contactNote: 'Found a bug or have a suggestion for this website? Get in touch.',
}

// Contact / social links shown in the footer. `icon` must match a key in Footer.jsx.
export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/Aman-20', icon: 'github' },
  { label: 'X', href: 'https://x.com/Aman7109', icon: 'x' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/aman-nishad-dev', icon: 'linkedin' },
]

// Official IGNOU pages. Phone numbers and e-mail addresses change, so for those
// please use the official contact page rather than copying numbers into this app.
export const IGNOU_LINKS = [
  { label: 'IGNOU official website', href: 'https://www.ignou.ac.in' },
  { label: 'Official grade card page', href: 'https://gradecard.ignou.ac.in' },
  { label: 'Official assignment status page', href: 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP' },
]

export const FALLBACK_PROGRAMMES = [
  { code: 'BCA_NEW', name: 'Bachelor of Computer Applications (New)' },
  { code: 'MCA_NEW', name: 'Master of Computer Applications (New)' },
  { code: 'BAG', name: 'Bachelor of Arts (General)' },
]

export const PASS_NOTES = [
  'Theory courses: 30% weight on assignments and 70% on the term-end exam (estimate shown here).',
  'IGNOU also expects at least 40% in assignments and practicals. Marks below 40 there are shown in amber as a warning.',
  'A dash (-) means marks are not recorded yet. It does not mean zero.',
]
