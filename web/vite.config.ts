import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitLab project Pages sites are served below /<project-name>/.
  // Relative assets also keep local and custom-domain deployments working.
  base: './',
  plugins: [react()],
})
