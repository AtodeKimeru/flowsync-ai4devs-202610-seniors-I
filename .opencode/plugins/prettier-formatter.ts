import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export default function prettierPlugin(opencode: any) {
  opencode.hook("tool:after", async (event: { tool_name: string; tool_input?: { file_path?: string }; tool_response?: { filePath?: string } }) => {
    // 1. Matcher: Only intercept Write or Edit tool operations
    const normalizedTool = event.tool_name.toLowerCase();
    if (normalizedTool !== "write" && normalizedTool !== "edit") {
      return;
    }

    // 2. Extract target file path
    const targetFile = event.tool_response?.filePath || event.tool_input?.file_path;
    if (!targetFile) return;

    const projectDir = process.env.OPENCODE_PROJECT_DIR || process.cwd();
    const frontendDir = path.join(projectDir, "frontend");
    const absoluteTarget = path.resolve(projectDir, targetFile);

    // 3. Filter: Only format files inside the /frontend directory
    if (absoluteTarget.startsWith(frontendDir)) {
      try {
        const prettierBin = path.join(frontendDir, "node_modules", ".bin", "prettier");
        await execAsync(`"${prettierBin}" --write --ignore-unknown "${absoluteTarget}"`, {
          cwd: frontendDir,
          timeout: 30000,
        });
      } catch (err) {
        // Silently catch errors or handle non-zero exit codes smoothly
      }
    }
  });
}
