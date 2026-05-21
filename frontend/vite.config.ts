import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // loadEnv avec prefix '' charge TOUTES les vars, y compris sans VITE_
  // EPIC_COOKIE reste côté Node.js (proxy) et n'est jamais exposé dans le bundle client
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/epic-api': {
          target: 'https://accounts.epicgames.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/epic-api/, ''),
          secure: true,
          headers: {
            'Cookie': env.EPIC_COOKIE ?? '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://accounts.epicgames.com/account/transactions/purchases',
            'Origin': 'https://accounts.epicgames.com',
            'X-Requested-With': 'XMLHttpRequest',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
          },
        },
      },
    },
  }
})
