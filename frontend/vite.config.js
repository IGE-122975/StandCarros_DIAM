import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Reencaminha /api/* e /media/* para o Django em vez de o Vite tentar servir.
      // Isto permite usar URLs relativas (ex: '/api/vehicles/') em todo o frontend
      // sem ter de repetir 'http://127.0.0.1:8000' em cada pedido.
      // O cookie CSRF fica na mesma origem (localhost:5173) e é lido
      // corretamente por getCSRFToken().
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
