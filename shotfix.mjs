import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 950 });

await page.goto('http://localhost:3210/sign-up', { waitUntil: 'networkidle0' });
await page.screenshot({ path: '/tmp/signup-fixed.png' });

await page.click('input[placeholder="you@example.com"]').catch(() => {});
await page.goto('http://localhost:3210/sign-in', { waitUntil: 'networkidle0' });
await page.click('input[type="email"]');
await new Promise((r) => setTimeout(r, 200));
await page.screenshot({ path: '/tmp/signin-focus-fixed.png' });

// Trigger sign-in validation error (empty submit)
await page.click('button ::-p-text(Sign in)').catch(async () => {
  const buttons = await page.$$('button');
});
const signInBtn = await page.evaluateHandle(() => {
  return Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Sign in');
});
if (signInBtn) await signInBtn.click();
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: '/tmp/signin-validation.png' });

await page.goto('http://localhost:3210/', { waitUntil: 'networkidle0' });
const contact = await page.$('#lp-contact');
if (contact) await contact.scrollIntoView();
await new Promise((r) => setTimeout(r, 300));
const select = await page.$('select');
const selects = await page.$$('select');
// the topic select is the 3rd select typically (country picker in pricing appears first)
for (const s of selects) {
  const box = await s.boundingBox();
  if (box) console.log('select box', box.y);
}
await page.screenshot({ path: '/tmp/contact-before-open.png' });

await browser.close();
console.log('done');
