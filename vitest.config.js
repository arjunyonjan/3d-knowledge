import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
