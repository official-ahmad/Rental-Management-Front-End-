import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Enable minification for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["mdb-react-ui-kit", "styled-components"],
          utils: ["axios", "react-hot-toast", "sweetalert2"],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (optional, remove for smaller build)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "mdb-react-ui-kit",
    ],
  },
  // Server optimization
  server: {
    hmr: {
      overlay: false, // Disable error overlay for faster dev
    },
  },
});
