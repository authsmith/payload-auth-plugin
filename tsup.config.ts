import { defineConfig } from "tsup"
import pkg from "./package.json"

function getEntriesFromExports(exportsField: any) {
  const entries: string[] = []

  for (const key in exportsField) {
    const value = exportsField[key]

    if (typeof value === "object" && value.import) {
      const path = value.import
        .replace("./dist/esm/", "./src/")
        .replace(/\.js$/, ".ts")

      entries.push(path)
    }
  }

  return entries
}

export default defineConfig(() => {
  const entries = getEntriesFromExports(pkg.exports)

  return {
    entry: entries,
    format: ["esm"],
    dts: true,
    outDir: "dist/esm",
    sourcemap: true,
    clean: true,
    splitting: false,
    external: ["payload"],
  }
})
