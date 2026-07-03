import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://<user>.github.io/moji-no-ame/
export default defineConfig({
  base: "/moji-no-ame/",
  plugins: [react()],
});
