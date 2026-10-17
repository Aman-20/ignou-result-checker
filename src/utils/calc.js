// Grade maths. Everything here is an ESTIMATE for display only.
// IGNOU's usual scheme: theory courses = 30% assignment + 70% term-end exam,
// with a minimum of 40% in the term-end exam (and 40% in assignments). Practical courses are shown as the
// average of the marks recorded so far. The official grade card is the only
// authoritative source.

export const TERM_END_PASS_MARK = 40
export const COMPONENT_PASS_MARK = 40
export const ASSIGNMENT_WEIGHT = 0.3
export const THEORY_WEIGHT = 0.7

const mean = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

export function classifyComponent(label) {
  if (/term\s*end\s*theory/i.test(label)) return 'theory'
  if (/^asg|^asgn|assignment/i.test(label)) return 'assignment'
  if (/lab|practical|project/i.test(label)) return 'lab'
  return 'other'
}

export function summariseCourse(course) {
  const buckets = { theory: [], assignment: [], lab: [], other: [] }
  course.components.forEach((c) => {
    if (c.value != null) buckets[classifyComponent(c.label)].push(c.value)
  })

  const theory = buckets.theory.length ? buckets.theory[0] : null
  const assignment = mean(buckets.assignment)

  let percentage = null
  let basis = ''
  if (theory != null && assignment != null) {
    percentage = ASSIGNMENT_WEIGHT * assignment + THEORY_WEIGHT * theory
    basis = '30% assignment + 70% term-end'
  } else if (theory != null) {
    percentage = theory
    basis = 'term-end only (assignment not recorded)'
  } else if (buckets.lab.length) {
    percentage = mean([...buckets.lab, ...buckets.assignment, ...buckets.other])
    basis = 'average of recorded marks'
  }

  return {
    percentage: round1(percentage),
    basis,
    theory,
    belowTermEndPass: theory != null && theory < TERM_END_PASS_MARK,
  }
}

export function summariseGradeCard(card) {
  const perCourse = card.courses.map((course) => ({ course, ...summariseCourse(course) }))
  const withPct = perCourse.filter((c) => c.percentage != null)
  return {
    perCourse,
    total: card.courses.length,
    completed: card.courses.filter((c) => c.status === 'completed').length,
    notCompleted: card.courses.filter((c) => c.status === 'not_completed').length,
    overallPercentage: round1(mean(withPct.map((c) => c.percentage))),
    coursesCounted: withPct.length,
  }
}

export function summariseAssignments(status) {
  const total = status.rows.length
  const count = (cat) => status.rows.filter((r) => r.category === cat).length
  const evaluated = count('evaluated')
  return {
    total,
    evaluated,
    inProcess: count('in_process'),
    other: count('other'),
    evaluatedPercentage: total ? Math.round((evaluated / total) * 1000) / 10 : 0,
  }
}
