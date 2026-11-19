import { execFile } from "node:child_process"
import { dirname } from "node:path"
import { promisify } from "node:util"
import type { Plugin } from "@opencode/plugin"

const run = promisify(execFile)

const plugin: Plugin.Plugin = {
    id: "prettier-hook",
    async setup(ctx) {
        await ctx.tool.hook("execute.after", async (event) => {
            if (event.status !== "completed") return
            if (event.tool !== "write" && event.tool !== "edit") return

            const filePath = (event.input as { path?: string } | undefined)?.path
            if (!filePath || !/\.(ts|tsx)$/.test(filePath)) return

            try {
                await run("npx", ["prettier", "--write", filePath], { cwd: dirname(filePath) })
            } catch (err) {
                console.error(`[prettier-hook] Failed to format ${filePath}:`, err)
            }
        })
    },
}

export default plugin
