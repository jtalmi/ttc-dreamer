import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Exclude git worktrees — parallel agent worktrees live under .claude/worktrees/
    // and should not be scanned by the main repo's test runner.
    exclude: [".claude/worktrees/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
