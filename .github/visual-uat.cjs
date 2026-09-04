const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const base = process.env.BASE_URL;
const chrome = process.env.CHROME_BIN;
const outDir = path.join(process.cwd(), 'visual-uat');
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  ['home', '/'],
  ['workflow', '/workflow'],
  ['scenarios', '/scenarios'],
  ['scripts', '/scripts'],
  ['templates', '/templates'],
  ['tools', '/tools'],
  ['offer-center', '/offer-center'],
  ['interview-analysis', '/interview-analysis'],
  ['hr-radar', '/hr-radar'],
];

const report = { baseUrl: base, desktop: [], mobile: [], errors: [] };
const settle = () => new Promise((resolve) => setTimeout(resolve, 700));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  async function inspectRoute(slug, route, mode) {
    const page = await browser.newPage();
    const localErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') localErrors.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => localErrors.push(`pageerror: ${err.message}`));
    page.on('response', (response) => {
      if (response.status() >= 500) localErrors.push(`http ${response.status()}: ${response.url()}`);
    });

    if (mode === 'mobile') {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    } else {
      await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    }

    const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await settle();
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || null,
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      fontFamily: getComputedStyle(document.querySelector('.rr-app') || document.body).fontFamily,
      sidebarWidth: document.querySelector('.rr-sidebar') ? getComputedStyle(document.querySelector('.rr-sidebar')).width : null,
      topbarHeight: document.querySelector('.rr-topbar') ? getComputedStyle(document.querySelector('.rr-topbar')).height : null,
    }));

    const filename = `${slug}-${mode}.png`;
    await page.screenshot({ path: path.join(outDir, filename), fullPage: true });

    const item = {
      slug,
      route,
      status: response?.status() ?? null,
      ...metrics,
      horizontalOverflow: Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) > metrics.innerWidth + 1,
      errors: localErrors,
      screenshot: filename,
    };

    report[mode].push(item);
    report.errors.push(...localErrors.map((message) => ({ slug, mode, message })));
    await page.close();
  }

  for (const [slug, route] of routes) {
    await inspectRoute(slug, route, 'desktop');
  }

  for (const [slug, route] of [
    ['home', '/'],
    ['scenarios', '/scenarios'],
    ['tools', '/tools'],
    ['interview-analysis', '/interview-analysis'],
  ]) {
    await inspectRoute(slug, route, 'mobile');
  }

  const drawer = await browser.newPage();
  await drawer.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await drawer.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await settle();
  const menuButton = await drawer.$('button[aria-label="Открыть меню"]');
  if (menuButton) {
    await menuButton.click();
    await settle();
    await drawer.screenshot({ path: path.join(outDir, 'home-mobile-menu-open.png'), fullPage: true });
    report.mobileMenuCaptured = true;
  } else {
    report.mobileMenuCaptured = false;
    report.errors.push({ slug: 'home', mode: 'mobile', message: 'Mobile menu button not found' });
  }
  await drawer.close();

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();

  const badStatuses = [...report.desktop, ...report.mobile].filter((item) => item.status !== 200);
  const overflows = [...report.desktop, ...report.mobile].filter((item) => item.horizontalOverflow);
  if (badStatuses.length || overflows.length || report.errors.length) {
    console.error(JSON.stringify({ badStatuses, overflows, errors: report.errors }, null, 2));
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
