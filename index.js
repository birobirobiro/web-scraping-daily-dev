const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Set the executable path for Puppeteer
      headless: true, // Set headless mode to true for running in headless environment
    });
    const page = await browser.newPage();
    await page.goto('https://app.daily.dev/popular');
    await page.waitForSelector('.Card_title__6axF8');
    const data = await page.$$eval('.Card_card__H4Y_n', (elements) => {
      const titles = [];
      for (let i = 0; i < elements.length && titles.length < 50; i++) {
        const el = elements[i];
        const titleEl = el.querySelector('.Card_title__6axF8');
        const isPromoted = el.querySelector('.typo-footnote')?.textContent === 'Promoted';
        const linkEl = el.querySelector('.small.btn');
        if (titleEl && linkEl && !isPromoted) {
          const title = titleEl.textContent.trim();
          const link = linkEl.getAttribute('href');
          titles.push({ title, link });
        }
      }
      return titles;
    });

    await browser.close();
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
