// Edit this file to change footer details. Nothing here is fetched from IGNOU.

export const SITE = {
  name: 'IGNOU Result Checker',
  // Your own contact details for the site. Leave an empty string to hide a line.
  contactEmail: '',
  contactNote: 'For problems with this website (not with your IGNOU records), write to us.',
}

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
  'A minimum of 35% in the term-end theory exam is normally required, shown in red when below that.',
  'A dash (-) means marks are not recorded yet. It does not mean zero.',
]
