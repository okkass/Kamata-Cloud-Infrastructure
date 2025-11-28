import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const DEFAULT_OPENAPI = "docs/openapi/openapi.yml";
const DEFAULT_PATHS_DIR = "docs/openapi/paths";

function parseArgs() {
  const argv = process.argv.slice(2);
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--openapi" && argv[i + 1]) {
      args.openapi = argv[++i];
    } else if (argv[i] === "--paths" && argv[i + 1]) {
      args.paths = argv[++i];
    } else if (argv[i] === "--dry") {
      args.dry = true;
    }
  }
  return args;
}

async function walkDir(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await walkDir(full);
      files.push(...sub);
    } else if (e.isFile() && e.name.endsWith(".yml")) {
      files.push(full);
    }
  }
  return files;
}

function filePathToOpenapiPath(filePath) {
  // filePath ends with .../paths/<subdirs>/name_part.yml
  // basename without ext, split by '_' and join with '/'
  const base = path.basename(filePath, ".yml");
  const segments = base.split("_").map((s) => s);
  // join keeping braces as-is, produce e.g. /api/images/{imageId}
  return "/api/" + segments.join("/");
}

function refPathRelative(openapiDir, filePath) {
  const rel = path.relative(openapiDir, filePath).replace(/\\/g, "/");
  return rel;
}

async function main() {
  const args = parseArgs();
  const openapiFile = args.openapi || DEFAULT_OPENAPI;
  const pathsDir = args.paths || DEFAULT_PATHS_DIR;

  if (!fs.existsSync(openapiFile)) {
    console.error("openapi.yml が見つかりません:", openapiFile);
    process.exit(1);
  }
  if (!fs.existsSync(pathsDir)) {
    console.error("paths ディレクトリが見つかりません:", pathsDir);
    process.exit(1);
  }

  const openapiDir = path.dirname(openapiFile);
  const files = await walkDir(pathsDir);

  const generatedPaths = {};
  for (const f of files) {
    const key = filePathToOpenapiPath(f);
    // If duplicate keys occur, last one wins; you can change behavior if needed
    generatedPaths[key] = { $ref: refPathRelative(openapiDir, f) };
  }

  const docRaw = fs.readFileSync(openapiFile, "utf8");
  const doc = yaml.load(docRaw);

  doc.paths = generatedPaths;

  const outYaml = yaml.dump(doc, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });

  if (args.dry) {
    console.log(outYaml);
  } else {
    fs.writeFileSync(openapiFile, outYaml, "utf8");
    console.log("openapi.yml の paths を更新したよ✨:", openapiFile);
    console.log(Object.keys(generatedPaths).length, "個のパスを生成");
  }
}

main().catch((err) => {
  console.error("エラー:", err);
  process.exit(1);
});
