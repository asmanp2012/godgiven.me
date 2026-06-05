import tailwindPlugin from "bun-plugin-tailwind";
import { watch } from "fs";
import { devNull } from "os";

const config = {
  watchFils: new Set(['css', 'html']),
  input: ['./assets/css/style.css'],
  outDir: "./assets/css",
  outFile: "all.css",
  external: ["*.woff2", "*.woff", "*.ttf", "*.eot", "*.svg"],
  debounce: 100
}

let isBuilding = false;
let lasBuildTime = 0;

// console.log("🚀 Starting html build process...");
const buildCSS = async () => {
  if (isBuilding) {
    console.log("⏳ Build already in progress, skipping...");
    return;
  }
  const minNextBuildTime = lasBuildTime + config.debounce;
  const now = new Date().getTime();
  if(now < minNextBuildTime)
  {
    console.log("⏳ try a few second later ...");
    return;
  }
  
  isBuilding = true;
  console.log("📦 Bundling styles via bun-plugin-tailwind...");

  try {
    await Bun.build({
      entrypoints: config.input,
      outdir: config.outDir,
      naming: config.outFile, // output to style.css or page.css
      minify: false,
      plugins: [tailwindPlugin],
      external: config.external
    });

    console.log("📦 Applying autoprefixer...");
    const cssPath = "./assets/css/all.css";
    const cssContent = await Bun.file(cssPath).text();
    await Bun.write(cssPath, cssContent);

    console.log("✨ Build finished successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
  } finally {
    isBuilding = false;
  }
}

const watchFile = async () => {
  console.log("👀 Watching HTML and CSS files...");
  const watcher = watch("./", { recursive: true }, async (event, filename) => {

    if(!filename){ return; }
    if (filename.endsWith(config.outFile)) {
      // console.log(`🚫 Ignoring output file: ${filename}`);
      return;
    }
    const ext = filename.split(".").pop();
    if(!ext) { return; }
    if ( config.watchFils.has(ext) || config.watchFils.has('*') )
    {
      console.log(`📝 ${filename} changed`);
      await buildCSS();
    }
  });
  
  console.log("Press Ctrl+C to stop");
  
  process.on("SIGINT", () => {
    console.log("\n👋 Stopping watcher...");
    watcher.close();
    process.exit(0);
  });
}

await buildCSS();

if (process.argv.includes("--watch")) {
  await watchFile();
}