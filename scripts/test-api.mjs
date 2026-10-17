// Tests the Vercel functions with a fake fetch and fake req/res. No network needed.
import assert from 'node:assert/strict'
import isms from '../api/isms.js'
import gradecard from '../api/gradecard.js'

const calls = []
globalThis.fetch = async (url, init) => {
  calls.push({ url, init })
  if (globalThis.__fail) throw new Error('ENOTFOUND')
  return new Response('<html>ok</html>', { status: globalThis.__status || 200 })
}

function run(handler, req) {
  return new Promise((resolve) => {
    const out = { status: 200, headers: {}, body: '' }
    const res = {
      setHeader: (k, v) => ((out.headers[k] = v), res),
      status: (s) => ((out.status = s), res),
      send: (b) => (resolve({ ...out, body: b }), res),
      end: () => (resolve(out), res),
    }
    handler(req, res)
  })
}

const GOOD = '/api/gradecard?eno=2000000001&prog=BCA_NEW&type=2'

// grade card: forwarded with validated params, from the URL or from req.query
let r = await run(gradecard, { method: 'GET', url: GOOD })
assert.equal(r.status, 200)
assert.equal(r.headers['X-Proxy'], 'ignou-checker')
assert.equal(calls.at(-1).url, 'https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=2000000001&prog=BCA_NEW&type=2')
r = await run(gradecard, { method: 'GET', url: '/api/gradecard', query: { eno: '2000000001', prog: 'BCA_NEW', type: '1' } })
assert.equal(calls.at(-1).url, 'https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=2000000001&prog=BCA_NEW&type=1')

// IGNOU's own 404 is relayed and marked as upstream
globalThis.__status = 404
r = await run(gradecard, { method: 'GET', url: GOOD })
assert.equal(r.status, 404)
assert.equal(r.headers['X-Upstream-Status'], '404')
globalThis.__status = 0

// assignment POST, body as parsed object (what Vercel provides) and as string
for (const body of [{ EnrNo: '2000000001', program: 'BCA_NEW', Submit: 'Submit' }, 'EnrNo=2000000001&program=BCA_NEW&Submit=Submit']) {
  r = await run(isms, { method: 'POST', url: '/api/isms', body })
  assert.equal(r.status, 200)
  const c = calls.at(-1)
  assert.equal(c.url, 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP')
  assert.equal(c.init.method, 'POST')
  assert.equal(c.init.body, 'EnrNo=2000000001&program=BCA_NEW&Submit=Submit')
  assert.equal(c.init.headers.Referer, 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP')
  assert.equal(c.init.headers.Origin, 'https://isms.ignou.ac.in')
  assert.match(c.init.headers['User-Agent'], /Mozilla/)
}

// programme list GET
r = await run(isms, { method: 'GET', url: '/api/isms' })
assert.equal(r.status, 200)
assert.equal(calls.at(-1).init.method, 'GET')

// invalid input never reaches IGNOU
const n = calls.length
assert.equal((await run(gradecard, { method: 'GET', url: '/api/gradecard?eno=bad&prog=X&type=1' })).status, 400)
assert.equal((await run(gradecard, { method: 'GET', url: '/api/gradecard?eno=2000000001&prog=../x&type=1' })).status, 400)
assert.equal((await run(gradecard, { method: 'GET', url: '/api/gradecard?eno=2000000001&prog=BCA&type=9' })).status, 400)
assert.equal((await run(gradecard, { method: 'POST', url: '/api/gradecard' })).status, 405)
assert.equal((await run(isms, { method: 'PUT', url: '/api/isms' })).status, 405)
assert.equal((await run(isms, { method: 'POST', url: '/api/isms', body: { EnrNo: 'x', program: 'BCA' } })).status, 400)
assert.equal(calls.length, n, 'rejected requests never reach IGNOU')

// upstream unreachable -> empty 502
globalThis.__fail = true
r = await run(gradecard, { method: 'GET', url: GOOD })
assert.equal(r.status, 502)
assert.equal(r.body, '')

console.log('All API function tests passed.')
