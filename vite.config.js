import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// IGNOU's pages do not send CORS headers, so the browser cannot call them directly.
// In development (and `vite preview`) these proxies forward the requests for us.
// In production on Vercel the same URLs are served by api/isms.js and api/gradecard.js.
const proxy = {
  '/api/isms': {
    target: 'https://isms.ignou.ac.in',
    changeOrigin: true,
    secure: true,
    timeout: 30000,
    proxyTimeout: 30000,
    rewrite: (path) => path.replace(/^\/api\/isms/, '/changeadmdata/StatusAssignment.ASP'),
    headers: {
      'User-Agent': UA,
      Referer: 'https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP',
      Origin: 'https://isms.ignou.ac.in',
    },
  },
  '/api/gradecard': {
    target: 'https://gradecard.ignou.ac.in',
    changeOrigin: true,
    secure: true,
    timeout: 30000,
    proxyTimeout: 30000,
    rewrite: (path) => path.replace(/^\/api\/gradecard/, '/view_gradecard.aspx'),
    headers: { 'User-Agent': UA },
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})