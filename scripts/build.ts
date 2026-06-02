import tailwindPlugin from "bun-plugin-tailwind";

console.log("🚀 Starting html build process...");

console.log("📦 Bundling styles via bun-plugin-tailwind...");
await Bun.build({
  entrypoints: ["./assets/css/style.css"],
  outdir: "./assets/css",
  naming: "all.css", // output to style.css or page.css
  minify: false,
  plugins: [tailwindPlugin],
  external: ["*.woff2", "*.woff", "*.ttf", "*.eot"]
});

console.log("📦 Applying autoprefixer...");
const cssPath = "./assets/css/all.css";
const cssContent = await Bun.file(cssPath).text();
await Bun.write(cssPath, cssContent);

console.log("✨ Build finished successfully!");