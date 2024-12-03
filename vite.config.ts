import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsconfigPaths from 'vite-tsconfig-paths' // https://vitejs.dev/config/

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          solana: [
            '@solana/web3.js',
            '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-react',
            '@solana/wallet-adapter-react-ui',
          ],
          jotai: ['jotai'],
          react: ['react', 'react-dom'],
          reactHotToast: ['react-hot-toast'],
          reactRouter: ['react-router', 'react-router-dom'],
          // solanaWeb3: ['@solana/web3.js'],
          // solanaWalletAdapters: [
          //   '@solana/wallet-adapter-base',
          //   '@solana/wallet-adapter-react',
          //   '@solana/wallet-adapter-react-ui',
          // ],
          coral: ['@coral-xyz/anchor'],
          tabler: ['@tabler/icons-react'],
          tanstack: ['@tanstack/react-query'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    // exclude: ['@particle-network/connectkit'],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
        }),
      ],
    },
  },
  plugins: [nodePolyfills(), viteTsconfigPaths(), react()],
})
