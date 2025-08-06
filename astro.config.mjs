// @ts-check
import { defineConfig } from "astro/config"

import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react({
      experimentalReactChildren: false,
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    define: {
      global: "globalThis",
    },
    ssr: {
      external: ["react-dom/server"],
    },
  },
})
