import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const src = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Bare imports like "components/Footer" resolve to src/. Keep in sync
    // with "paths" in jsconfig.json, which the editor reads.
    alias: {
      LangContext: src("LangContext"),
      assets: src("assets"),
      components: src("components"),
      data: src("data"),
      hooks: src("hooks"),
      lib: src("lib"),
      locales: src("locales"),
      pages: src("pages"),
      styles: src("styles"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    // netlify.toml publishes "build".
    outDir: "build",
    // Vite inlines assets under 4 KB as data: URIs — that would include the
    // smaller font subsets, which the CSP (font-src 'self') blocks. Always
    // emit fonts as real files; other assets keep the default behavior.
    assetsInlineLimit: (filePath) =>
      /\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined,
  },
});
