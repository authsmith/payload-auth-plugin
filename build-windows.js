// build-windows.js
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Clean dist directory
console.log("Cleaning dist directory...")
try {
  const distPath = path.join(__dirname, "dist")
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true })
  }
  fs.mkdirSync(path.join(distPath, "esm", "providers"), { recursive: true })
  fs.mkdirSync(path.join(distPath, "esm", "client"), { recursive: true })
  fs.mkdirSync(path.join(distPath, "types", "providers"), { recursive: true })
  fs.mkdirSync(path.join(distPath, "types", "client"), { recursive: true })
} catch (err) {
  console.error("Error cleaning dist directory:", err)
}

// Run TypeScript compilation
console.log("Compiling TypeScript...")
try {
  // Build type declarations
  execSync(
    "tsc --outDir dist/types --declaration --emitDeclarationOnly --declarationMap",
    {
      stdio: "inherit",
      shell: true,
    },
  )

  // Build ESM version
  execSync("tsc --outDir dist/esm", {
    stdio: "inherit",
    shell: true,
  })

  console.log("Build completed successfully!")
} catch (err) {
  console.error("Build failed:", err)
  process.exit(1)
}

// Make sure our exports paths are correct
console.log("Ensuring exports paths are correct...")
const ensureDirectoryExists = (dir) => {
  const fullPath = path.join(__dirname, dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`Created directory: ${fullPath}`)
  }
}

ensureDirectoryExists("dist/esm/providers")
ensureDirectoryExists("dist/esm/client")
ensureDirectoryExists("dist/types/providers")
ensureDirectoryExists("dist/types/client")

console.log("Build process complete!")
