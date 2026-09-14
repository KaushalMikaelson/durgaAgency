import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Copy Maa Durga Logo from data folder to public folder and generate logoData.js
try {
  const srcLogo = path.resolve(__dirname, 'data/durga maa logo.jpg')
  const publicDir = path.resolve(__dirname, 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  
  if (fs.existsSync(srcLogo)) {
    fs.copyFileSync(srcLogo, path.resolve(publicDir, 'durga-maa-logo.jpg'))
    fs.copyFileSync(srcLogo, path.resolve(publicDir, 'durga maa logo.jpg'))
    
    const b64 = fs.readFileSync(srcLogo).toString('base64')
    const logoJs = `// Auto-generated Maa Durga Logo from data folder
export const DURGA_MAA_LOGO = "data:image/jpeg;base64,${b64}";
export default DURGA_MAA_LOGO;
`
    fs.writeFileSync(path.resolve(__dirname, 'src/logoData.js'), logoJs, 'utf8')
  }
} catch (e) {
  console.error('[vite.config.js] Error preparing logo:', e)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-data-logo',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent(req.url.split('?')[0])
          if (url === '/durga-maa-logo.jpg' || url === '/durga maa logo.jpg' || url === '/data/durga maa logo.jpg') {
            const logoPath = path.resolve(__dirname, 'data/durga maa logo.jpg')
            if (fs.existsSync(logoPath)) {
              res.setHeader('Content-Type', 'image/jpeg')
              res.setHeader('Cache-Control', 'public, max-age=86400')
              return fs.createReadStream(logoPath).pipe(res)
            }
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 3000,
    fs: {
      allow: ['..', '.']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
})

