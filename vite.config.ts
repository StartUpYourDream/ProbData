import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: {
      // Polymarket Gamma API
      '/api/gamma': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gamma/, ''),
        secure: false,
      },
      // Polymarket CLOB API
      '/api/clob': {
        target: 'https://clob.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clob/, ''),
        secure: false,
      },
      // Blockchain.com BTC charts and current network stats
      '/api/blockchain': {
        target: 'https://api.blockchain.info',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blockchain/, ''),
        secure: false,
      },
      // Alternative.me Fear and Greed API
      '/api/alternative': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alternative/, ''),
        secure: false,
      },
      // mempool.space Bitcoin API
      '/api/mempool': {
        target: 'https://mempool.space/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mempool/, ''),
        secure: false,
      },
      // FRED public CSV endpoints
      '/api/fred': {
        target: 'https://fred.stlouisfed.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fred/, ''),
        secure: false,
      },
      // DefiLlama stablecoin supply API
      '/api/defillama-stable': {
        target: 'https://stablecoins.llama.fi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/defillama-stable/, ''),
        secure: false,
      },
      // DefiLlama token price API
      '/api/llama-prices': {
        target: 'https://coins.llama.fi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llama-prices/, ''),
        secure: false,
      },
      // CoinLore public crypto market API
      '/api/coinlore': {
        target: 'https://api.coinlore.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coinlore/, ''),
        secure: false,
      },
      // Sina US stock quote endpoint
      '/api/sina-hq': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina-hq/, ''),
        headers: {
          referer: 'https://finance.sina.com.cn',
        },
        secure: false,
      },
      // Sina US stock daily K-line endpoint
      '/api/sina-stock': {
        target: 'https://stock.finance.sina.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina-stock/, ''),
        headers: {
          referer: 'https://finance.sina.com.cn',
        },
        secure: false,
      },
      // SEC XBRL company facts for public financial statements
      '/api/sec-data': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sec-data/, ''),
        headers: {
          'user-agent': 'personal-investment-dashboard chenfeng@example.com',
        },
        secure: false,
      },
    },
  },
})
