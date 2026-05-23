import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const host = "127.0.0.1";
const port = "5175";
const baseURL = `http://${host}:${port}`;
const outputDir = join("qa", "artifacts", "console-assets");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const cleanRoute = [
  "cell-tofu_1_fresh",
  "cell-tofu_2_fresh",
  "cell-tofu_4_expiring",
  "cell-rice_5_expiring",
  "cell-kimchi_5_expiring",
  "cell-egg_5_expiring"
];

const waitForServer = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120_000) {
    try {
      const response = await fetch(baseURL);

      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting until Vite is ready.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }

  throw new Error(`Timed out waiting for ${baseURL}`);
};

const clickCleanRoute = async (page) => {
  for (const testId of cleanRoute) {
    await page.getByTestId(testId).click();
  }
};

const newMobilePage = async (browser) =>
  browser.newPage({
    viewport: { width: 636, height: 1048 },
    isMobile: true,
    hasTouch: true
  });

const captureViewport = async (page, fileName) => {
  await page.screenshot({
    path: join(outputDir, fileName),
    fullPage: false
  });
};

const readPngDataURL = async (fileName) => {
  const bytes = await readFile(join(outputDir, fileName));
  return `data:image/png;base64,${bytes.toString("base64")}`;
};

const readPngMetadata = async (fileName) => {
  const bytes = await readFile(join(outputDir, fileName));

  return {
    fileName,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length
  };
};

const formatKilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const assetSummary = (assets) => ({
  ready: true,
  outputDir,
  assets: assets.map((asset) => ({
    file: asset.fileName,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    kilobytes: Number((asset.bytes / 1024).toFixed(1))
  }))
});

const printVerifiedAssets = (assets) => {
  console.log("");
  console.log("| Console asset | Dimensions | Size |");
  console.log("| --- | ---: | ---: |");

  for (const asset of assets) {
    console.log(`| ${asset.fileName} | ${asset.width}x${asset.height} | ${formatKilobytes(asset.bytes)} |`);
  }
};

const verifyAssetDimensions = async () => {
  const expectedAssets = [
    ["logo-600x600.png", 600, 600],
    ["thumbnail-1932x828.png", 1932, 828],
    ["screenshot-01-first-playable-636x1048.png", 636, 1048],
    ["screenshot-02-completion-result-636x1048.png", 636, 1048],
    ["screenshot-03-recipe-book-636x1048.png", 636, 1048]
  ];
  const verifiedAssets = [];

  for (const [fileName, expectedWidth, expectedHeight] of expectedAssets) {
    const metadata = await readPngMetadata(fileName);
    const { width, height } = metadata;

    if (width !== expectedWidth || height !== expectedHeight) {
      throw new Error(`${fileName} is ${width}x${height}, expected ${expectedWidth}x${expectedHeight}`);
    }

    verifiedAssets.push(metadata);
  }

  return verifiedAssets;
};

const captureLogo = async (browser) => {
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  const svg = await readFile(join("public", "icon.svg"), "utf8");

  await page.setContent(`
    <style>
      html,
      body {
        margin: 0;
        width: 600px;
        height: 600px;
        background: #f7fbf8;
      }

      .logo {
        width: 600px;
        height: 600px;
        display: grid;
        place-items: center;
      }

      svg {
        width: 600px;
        height: 600px;
        display: block;
      }
    </style>
    <main class="logo">${svg}</main>
  `);
  await page.screenshot({
    path: join(outputDir, "logo-600x600.png"),
    fullPage: false
  });
  await page.close();
};

const captureVerticalScreenshots = async (browser) => {
  const firstPage = await newMobilePage(browser);
  await firstPage.goto(baseURL);
  await captureViewport(firstPage, "screenshot-01-first-playable-636x1048.png");
  await firstPage.close();

  const resultPage = await newMobilePage(browser);
  await resultPage.goto(baseURL);
  await clickCleanRoute(resultPage);
  await resultPage.getByTestId("best-route").waitFor();
  await captureViewport(resultPage, "screenshot-02-completion-result-636x1048.png");
  await resultPage.close();

  const bookPage = await newMobilePage(browser);
  await bookPage.goto(baseURL);
  await bookPage.getByTestId("recipe-book-open").click();
  await bookPage.getByTestId("recipe-book-panel").waitFor();
  await captureViewport(bookPage, "screenshot-03-recipe-book-636x1048.png");
  await bookPage.close();
};

const captureThumbnail = async (browser) => {
  const page = await browser.newPage({ viewport: { width: 1932, height: 828 } });
  const first = await readPngDataURL("screenshot-01-first-playable-636x1048.png");
  const result = await readPngDataURL("screenshot-02-completion-result-636x1048.png");
  const book = await readPngDataURL("screenshot-03-recipe-book-636x1048.png");

  await page.setContent(`
    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        width: 1932px;
        height: 828px;
        background: #f7fbf8;
        color: #14291d;
        font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      }

      .thumbnail {
        width: 1932px;
        height: 828px;
        display: grid;
        grid-template-columns: 570px 1fr;
        align-items: center;
        gap: 64px;
        padding: 72px 96px;
        overflow: hidden;
      }

      .copy {
        display: grid;
        gap: 28px;
      }

      .brand {
        color: #287c49;
        font-size: 58px;
        font-weight: 900;
        letter-spacing: 0;
      }

      h1 {
        margin: 0;
        max-width: 540px;
        font-size: 104px;
        line-height: 1.02;
        letter-spacing: 0;
      }

      .tagline {
        margin: 0;
        color: #3d5147;
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 0;
      }

      .screens {
        height: 700px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 28px;
        align-items: center;
      }

      .phone {
        height: 700px;
        padding: 18px;
        border: 4px solid #1d3a29;
        border-radius: 48px;
        background: #ffffff;
        box-shadow: 0 18px 40px rgba(30, 70, 46, 0.18);
        overflow: hidden;
      }

      .phone:nth-child(2) {
        transform: translateY(-24px);
      }

      .phone img {
        width: 100%;
        height: 100%;
        border-radius: 32px;
        object-fit: cover;
        object-position: top center;
        display: block;
      }
    </style>
    <main class="thumbnail">
      <section class="copy" aria-label="Thumbnail copy">
        <div class="brand">오늘의 냉장고</div>
        <h1>10초 냉파 퍼즐</h1>
        <p class="tagline">정리하고, 완성하고, 오늘 기록 경쟁</p>
      </section>
      <section class="screens" aria-label="Gameplay screenshots">
        <div class="phone"><img src="${first}" alt="First playable screen" /></div>
        <div class="phone"><img src="${result}" alt="Completion result screen" /></div>
        <div class="phone"><img src="${book}" alt="Recipe book screen" /></div>
      </section>
    </main>
  `);
  await page.screenshot({
    path: join(outputDir, "thumbnail-1932x828.png"),
    fullPage: false
  });
  await page.close();
};

const server = spawn(npmCommand, ["run", "dev", "--", "--host", host, "--port", port], {
  stdio: jsonOutput ? "ignore" : "inherit",
  shell: process.platform === "win32"
});

try {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await waitForServer();

  const browser = await chromium.launch();
  await captureLogo(browser);
  await captureVerticalScreenshots(browser);
  await captureThumbnail(browser);
  const verifiedAssets = await verifyAssetDimensions();
  if (jsonOutput) {
    console.log(JSON.stringify(assetSummary(verifiedAssets), null, 2));
  } else {
    printVerifiedAssets(verifiedAssets);
  }
  await browser.close();

  if (!jsonOutput) {
    console.log(`Saved console assets to ${outputDir}`);
  }
} finally {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore"
    });
  } else {
    server.kill("SIGTERM");
  }
}
