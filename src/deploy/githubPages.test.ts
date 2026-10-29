import { readFileSync } from "fs";
import path from "path";
import { githubPagesBase } from "./githubPages";

const repoRoot = path.join(__dirname, "../..");

describe("GitHub Pages", () => {
  it("publishes the app under the battle-ship project path", () => {
    expect(githubPagesBase).toBe("/battle-ship/");

    const viteConfig = readFileSync(path.join(repoRoot, "vite.config.ts"), "utf8");
    expect(viteConfig).toContain("githubPagesBase");
  });

  it("deploys the production build when master is pushed", () => {
    const workflow = readFileSync(
      path.join(repoRoot, ".github/workflows/deploy.yml"),
      "utf8",
    );

    expect(workflow).toContain('branches: ["master"]');
    expect(workflow).toContain("path: dist");
    expect(workflow).toContain("actions/deploy-pages@v4");
  });
});
