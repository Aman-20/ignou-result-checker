# IGNOU Result Checker

Check your IGNOU **grade card** and **assignment / practical status** in one place. Enter your enrolment number and programme code to see your marks, estimated percentage and submission status, then download the result as an image or PDF.

**Live site:** https://ignou-result-checker.vercel.app

## Features

- Course-wise grade card with assignment, lab and term-end marks
- Estimated percentage per course and overall (30% assignment + 70% term-end)
- Term-end theory below 40 is shown in red as fail; assignment or lab marks below 40 are shown in amber
- Download as PNG or PDF
- Responsive on mobile and desktop
- No login, and nothing about the student is stored on the server

## Tech stack

React 19, Vite, html2canvas, jsPDF, and Vercel serverless functions for the IGNOU proxy.

## Run locally

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |
| `npm test` | Run the parser and API tests (needs `jsdom`) |

## Deploy

1. Push the project to GitHub.
2. Import it in [Vercel](https://vercel.com) and click **Deploy**. No environment variables are needed.

IGNOU's servers don't allow requests straight from a browser, so the app calls its own `/api/isms` and `/api/gradecard` routes (`api/` folder), which forward to IGNOU. In development, `vite.config.js` does the same.

## Project structure

```
api/        Serverless functions (IGNOU proxy)
scripts/    Test scripts
src/
  components/   UI components
  config/       Footer text, contact links, notes (siteInfo.js)
  services/     IGNOU requests and retries
  utils/        Parsers, marks calculation, PNG/PDF export
```

## Customise

- Contact details, notes and fallback programme list: `src/config/siteInfo.js`
- Pass marks: `TERM_END_PASS_MARK` and `COMPONENT_PASS_MARK` in `src/utils/calc.js`
- Colours: CSS variables at the top of `src/index.css`


---
 
Built with ❤️ for IGNOU students. Feedback and contributions are welcome.