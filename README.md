# IGNOU Grade Card & Assignment Status Checker

## Use it in your existing Vite + React project

1. Copy `src/` (all files, replacing your `App.jsx`, `main.jsx`, `index.css`) and `vite.config.js` into your project.
2. Install the export libraries: `npm install html2canvas jspdf`
3. Run `npm run dev` and open the page.

## Important: the proxy

IGNOU's servers do not allow browser requests from other websites (no CORS headers), so the page
cannot call them directly. `vite.config.js` forwards these paths while you develop:

| App calls | Forwarded to |
|---|---|
| `/proxy/isms/...` | `https://isms.ignou.ac.in/...` |
| `/proxy/gradecard/...` | `https://gradecard.ignou.ac.in/...` |

The Vite proxy only works with `npm run dev` / `npm run preview`. When you deploy, host the same two
rewrites (Netlify/Vercel rewrites or `_redirects` can proxy to an external URL, or use a small
serverless function). The POST to `/proxy/isms` should send the `Referer`, `Origin` and a browser
`User-Agent` as in `vite.config.js`. IGNOU may also block some hosting providers' IP ranges, so test
from your real deployment.

## Where things are

| File | Job |
|---|---|
| `src/App.jsx` | Page layout, state, runs both checks in parallel |
| `src/services/ignouApi.js` | Requests, retries, grade card `type` 1-4 probing (cached per programme) |
| `src/utils/parsers.js` | HTML to data for both pages |
| `src/utils/calc.js` | Estimated percentages and summaries |
| `src/utils/exportUtils.js` | PNG and PDF export |
| `src/config/siteInfo.js` | Footer text, your contact email, official links |
| `src/components/*` | Header, Footer, SearchForm, GradeCardResult, AssignmentResult, ExportButtons (+ CSS) |

Test the parsers against the sample markup: `npm run test:parsers`
