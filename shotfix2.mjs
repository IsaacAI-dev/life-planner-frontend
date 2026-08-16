import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 950 });
await page.goto('http://localhost:3210/', { waitUntil: 'networkidle0' });
const contact = await page.$('#lp-contact');
if (contact) await contact.scrollIntoView();
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: '/tmp/contact-section.png' });

// Open the topic select specifically (find by nearby label text)
const topicSelect = await page.evaluateHandle(() => {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find((l) => l.textContent?.includes("WHAT'S IT ABOUT"));
  return label ? label.querySelector('select') : null;
});
if (topicSelect) {
  const box = await topicSelect.asElement()?.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: '/tmp/contact-dropdown-open.png' });
  }
}

await page.goto('http://localhost:3210/careers', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: '/tmp/careers-roles.png' });

await browser.close();
console.log('done');
