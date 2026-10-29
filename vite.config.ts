import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { githubPagesBase } from "./src/deploy/githubPages";

export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
});
