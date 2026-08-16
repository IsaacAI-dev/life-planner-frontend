import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1000 });
await page.goto('http://localhost:3210/', { waitUntil: 'networkidle0' });
const pricing = await page.$('#lp-pricing');
if (pricing) await pricing.scrollIntoView();
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: '/tmp/pricing-actual.png' });

const faq = await page.$('#lp-faq');
if (faq) await faq.scrollIntoView();
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: '/tmp/faq-actual.png' });

const contact = await page.$('#lp-contact');
if (contact) await contact.scrollIntoView();
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: '/tmp/contact-actual.png' });

await page.goto('http://localhost:3210/about', { waitUntil: 'networkidle0' });
await page.screenshot({ path: '/tmp/about-actual.png' });

await page.goto('http://localhost:3210/terms', { waitUntil: 'networkidle0' });
await page.screenshot({ path: '/tmp/terms-actual.png' });

await page.setViewport({ width: 390, height: 844, isMobile: true });
await page.goto('http://localhost:3210/', { waitUntil: 'networkidle0' });
await page.screenshot({ path: '/tmp/mobile-hero.png' });

await browser.close();
console.log('done');
