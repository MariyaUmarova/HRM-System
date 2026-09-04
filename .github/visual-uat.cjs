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

const report = {
  baseUrl: base,
  sourceAppHead: 'add4ea807a037a7ece3d52e34b32aa2370903186',
  desktop: [],
  mobile: [],
  helpers: {},
  errors: [],
};
const settle = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

function fail(scope, message) {
  report.errors.push({ scope, message });
}

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
      visualViewportWidth: window.visualViewport?.width ?? null,
      screenWidth: window.screen.width,
      devicePixelRatio: window.devicePixelRatio,
      viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
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
      mode,
      status: response?.status() ?? null,
      ...metrics,
      horizontalOverflow: Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) > metrics.innerWidth + 1,
      viewportMismatch: mode === 'mobile' && Math.abs(metrics.innerWidth - 390) > 1,
      errors: localErrors,
      screenshot: filename,
    };

    report[mode].push(item);
    localErrors.forEach((message) => fail(`${slug}:${mode}`, message));
    if (item.viewportMismatch) {
      fail(`${slug}:${mode}`, `Mobile layout viewport is ${metrics.innerWidth}px instead of 390px`);
    }
    await page.close();
  }

  async function setAriaValue(page, ariaLabel, value) {
    const found = await page.evaluate(({ ariaLabel, value }) => {
      const element = document.querySelector(`[aria-label="${ariaLabel.replaceAll('"', '\\"')}"]`);
      if (!element) return false;
      const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (!setter) return false;
      setter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, { ariaLabel, value });
    if (!found) fail('helper-input', `Control not found: ${ariaLabel}`);
    await settle(120);
    return found;
  }

  async function clickButtonByText(page, text) {
    const clicked = await page.evaluate((text) => {
      const button = [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === text);
      if (!button) return false;
      button.click();
      return true;
    }, text);
    if (!clicked) fail('helper-button', `Button not found: ${text}`);
    await settle(350);
    return clicked;
  }

  async function buttonState(page, text) {
    return page.evaluate((text) => {
      const button = [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === text);
      return button ? { found: true, disabled: button.disabled } : { found: false, disabled: null };
    }, text);
  }

  async function runInterviewHelperUat() {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}/interview-analysis`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await settle();

    const requestsDuringAnalysis = [];
    let trackingRequests = false;
    const appOrigin = new URL(base).origin;
    page.on('request', (request) => {
      if (!trackingRequests) return;
      const requestUrl = request.url();
      try {
        if (new URL(requestUrl).origin !== appOrigin) requestsDuringAnalysis.push(requestUrl);
      } catch {
        requestsDuringAnalysis.push(requestUrl);
      }
    });

    await setAriaValue(page, 'Локальный анализ — вакансия', 'Инженер поддержки');
    await setAriaValue(
      page,
      'Локальный анализ — критерии',
      'Опыт работы во второй линии поддержки\nСистемная диагностика технических проблем\nВозраст до 30 лет',
    );
    await setAriaValue(
      page,
      'Локальный анализ — материал',
      'Кандидат: Последние два года я работал во второй линии поддержки. Я проверял журнал событий и воспроизводил проблемы на тестовом стенде.',
    );
    await setAriaValue(page, 'Локальный анализ — дополнительные проверки', 'Опыт сложной эскалации');

    trackingRequests = true;
    await clickButtonByText(page, 'Сформировать предварительный анализ');
    await settle(500);
    trackingRequests = false;

    const beforeCopy = await buttonState(page, 'Скопировать проверенный текст');
    const beforeHuntflow = await buttonState(page, 'Отправить в Huntflow');
    const result = await page.evaluate(() => {
      const body = document.body.innerText;
      const draft = document.querySelector('[aria-label="Локальный анализ — черновик Huntflow"]')?.value || '';
      return {
        hasResult: body.includes('Локальный evidence-based результат'),
        blockedAgeVisible:
          body.includes('Возраст до 30 лет') &&
          body.includes('исключён из автоматического сопоставления'),
        draft,
        resultText: body.includes('Локальный предварительный анализ сформирован'),
      };
    });

    const confirmed = await page.evaluate(() => {
      const label = [...document.querySelectorAll('label')].find((node) =>
        node.textContent?.includes('Я проверил(а) цитаты, выводы, пробелы и текст черновика.'),
      );
      const checkbox = label?.querySelector('input[type="checkbox"]');
      if (!checkbox) return false;
      checkbox.click();
      return true;
    });
    await settle(300);
    const afterCopy = await buttonState(page, 'Скопировать проверенный текст');
    const afterHuntflow = await buttonState(page, 'Отправить в Huntflow');

    const checks = {
      http200: response?.status() === 200,
      resultRendered: result.hasResult,
      localStatusRendered: result.resultText,
      sensitiveCriterionBlocked: result.blockedAgeVisible,
      sensitiveCriterionAbsentFromDraft: !result.draft.toLocaleLowerCase('ru-RU').includes('возраст'),
      copyDisabledBeforeConfirmation: beforeCopy.found && beforeCopy.disabled === true,
      huntflowDisabledBeforeConfirmation: beforeHuntflow.found && beforeHuntflow.disabled === true,
      confirmationControlWorked: confirmed,
      copyEnabledAfterConfirmation: afterCopy.found && afterCopy.disabled === false,
      huntflowStillDisabledAfterConfirmation: afterHuntflow.found && afterHuntflow.disabled === true,
      noExternalRequestsDuringLocalAnalysis: requestsDuringAnalysis.length === 0,
    };

    for (const [name, passed] of Object.entries(checks)) {
      if (!passed) fail('interview-helper', name);
    }

    await page.screenshot({ path: path.join(outDir, 'interview-analysis-result-desktop.png'), fullPage: true });
    report.helpers.interviewAnalysis = {
      checks,
      externalRequestsDuringAnalysis: requestsDuringAnalysis,
      draftContainsSensitiveCriterion: result.draft.toLocaleLowerCase('ru-RU').includes('возраст'),
      screenshot: 'interview-analysis-result-desktop.png',
    };
    await page.close();
  }

  async function runOfferHelperUat() {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}/offer-center`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await settle();

    const initial = await page.evaluate(() => {
      const page1 = document.querySelector('[aria-label="Предпросмотр оффера, страница 1"]')?.textContent || '';
      const page2 = document.querySelector('[aria-label="Предпросмотр оффера, страница 2"]')?.textContent || '';
      const byText = (text) => [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === text);
      return {
        page1Greeting: page1.includes('Алексей, привет!'),
        page2Tasks: page2.includes('Твои задачи'),
        pdfDisabled: byText('Скачать PDF')?.disabled === true,
        pngDisabled: byText('Все страницы PNG')?.disabled === true,
        pptxDisabled: byText('Скачать PPTX')?.disabled === true,
      };
    });

    const selected = await page.evaluate(() => {
      const label = [...document.querySelectorAll('label')].find((node) =>
        node.textContent?.trim().startsWith('Заявка в поиске'),
      );
      const select = label?.querySelector('select');
      if (!select) return false;
      select.value = 'req-3';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    await settle(450);

    const prefill = await page.evaluate(() => {
      const controlValue = (labelText) => {
        const label = [...document.querySelectorAll('label')].find((node) =>
          node.textContent?.trim().startsWith(labelText),
        );
        return label?.querySelector('input, textarea')?.value ?? null;
      };
      return {
        position: controlValue('Должность'),
        department: controlValue('Подразделение'),
        candidate: controlValue('Имя кандидата'),
      };
    });

    const confirmationClicked = await page.evaluate(() => {
      const label = [...document.querySelectorAll('label')].find((node) =>
        node.textContent?.includes('Я проверил(а) все страницы, даты, формат работы, оплату и задачи'),
      );
      const checkbox = label?.querySelector('input[type="checkbox"]');
      if (!checkbox) return false;
      checkbox.click();
      return true;
    });
    await settle(500);

    const exportsAfterConfirmation = await page.evaluate(() => {
      const byText = (text) => [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === text);
      return {
        pdfEnabled: byText('Скачать PDF')?.disabled === false,
        pngEnabled: byText('Все страницы PNG')?.disabled === false,
        pptxEnabled: byText('Скачать PPTX')?.disabled === false,
      };
    });

    const checks = {
      http200: response?.status() === 200,
      previewPage1Rendered: initial.page1Greeting,
      previewPage2Rendered: initial.page2Tasks,
      exportsDisabledBeforeConfirmation: initial.pdfDisabled && initial.pngDisabled && initial.pptxDisabled,
      requestSelectionWorked: selected,
      requestPositionPrefilled: prefill.position === 'Инженер техподдержки 2-й линии',
      requestDepartmentPrefilled: prefill.department === 'Инфраструктура',
      candidateNotOverwritten: prefill.candidate === 'Алексей',
      confirmationControlWorked: confirmationClicked,
      exportsEnabledAfterConfirmation:
        exportsAfterConfirmation.pdfEnabled &&
        exportsAfterConfirmation.pngEnabled &&
        exportsAfterConfirmation.pptxEnabled,
    };

    for (const [name, passed] of Object.entries(checks)) {
      if (!passed) fail('offer-helper', name);
    }

    await page.screenshot({ path: path.join(outDir, 'offer-center-confirmed-desktop.png'), fullPage: true });
    report.helpers.offerBuilder = {
      checks,
      prefill,
      exportsAfterConfirmation,
      screenshot: 'offer-center-confirmed-desktop.png',
    };
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
    fail('mobile-menu', 'Mobile menu button not found');
  }
  await drawer.close();

  await runInterviewHelperUat();
  await runOfferHelperUat();

  const badStatuses = [...report.desktop, ...report.mobile].filter((item) => item.status !== 200);
  const overflows = [...report.desktop, ...report.mobile].filter((item) => item.horizontalOverflow);
  badStatuses.forEach((item) => fail(`${item.slug}:${item.mode}`, `Unexpected HTTP status ${item.status}`));
  overflows.forEach((item) => fail(`${item.slug}:${item.mode}`, 'Horizontal overflow detected'));

  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log('VISUAL_UAT_REPORT_START');
  console.log(JSON.stringify(report, null, 2));
  console.log('VISUAL_UAT_REPORT_END');

  await browser.close();
  if (report.errors.length) process.exitCode = 1;
})().catch(async (error) => {
  report.errors.push({ scope: 'runner', message: error?.stack || String(error) });
  try {
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  } catch {}
  console.error(error);
  process.exit(1);
});
