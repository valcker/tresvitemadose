const { webkit } = require("playwright");
const notifier = require("node-notifier");
const chalk = require("chalk");

const log = console.log;

const vaccineArg = process.argv[2];
if (vaccineArg !== "pfizer" && vaccineArg !== "moderna") {
  log(
    `Usage: npm start {vaccin name} {area}, where acceptable vaccins are ${chalk.yellow(
      "pfizer"
    )} or ${chalk.yellow("moderna")}.`
  );
  process.exit(1);
}

// Should correspond to the city/area part of the URL on Doctolib.
// Example: https://www.doctolib.fr/vaccination-covid-19/chamonix-mont-blanc?ref_visit_motive_ids[]=6970&ref_visit_motive_ids[]=7005&force_max_limit=2
// For the above URL, the area would be _chamonix-mont-blanc_
const area = process.argv[3];

const maxPages = 3;
const baseUrls = {
  pfizer: `https://www.doctolib.fr/vaccination-covid-19/${area}?force_max_limit=2&ref_visit_motive_id=6970&ref_visit_motive_ids%5B%5D=6970&ref_visit_motive_ids%5B%5D=7005`,
  moderna: `https://www.doctolib.fr/vaccination-covid-19/${area}?force_max_limit=2&ref_visit_motive_id=7005&ref_visit_motive_ids%5B%5D=6970&ref_visit_motive_ids%5B%5D=7005`,
};

const vaccineName = vaccineArg;

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

(async () => {
  const browser = await webkit.launch({ headless: true });
  const page = await browser.newPage();

  log(`Searching free slots for ${chalk.yellow(vaccineName)}.`);

  let currPageNumber = 1;

  while (true) {
    await page.setViewportSize({
      width: 1024,
      height: 1000,
    });

    log(
      chalk.gray(`[${vaccineName}] `) + `Searching on page ${currPageNumber}.`
    );

    const url = `${baseUrls[vaccineName]}&page=${currPageNumber}`;
    await page.goto(url);
    await delay(1000);

    page.evaluate(() => Didomi.setUserAgreeToAll());
    page.$eval("body", (element) => element.click());

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(1000);
    await page.evaluate(() => window.scrollTo(0, 200));
    await delay(10000);

    found = await page.$$(".Tappable-inactive.availabilities-slot");
    if (found.length > 0) {
      log(
        chalk.red(`Found vaccines for ${vaccineName}!`) + chalk.gray(`\t${url}`)
      );

      await page.evaluate(() => window.scrollTo(0, 0));

      let now = new Date();
      let filename =
        vaccineName +
        "-" +
        now.getMonth() +
        1 +
        "-" +
        now.getDate() +
        "_" +
        now.getHours() +
        "-" +
        now.getMinutes() +
        ".png";

      notifier.notify({
        title: "Très vite ma dose !",
        message: "RDV disponibles pour " + vaccineName,
        sound: true,
        open: url,
        wait: true,
      });

      await page.screenshot({ path: filename, fullPage: true });
    }

    currPageNumber = currPageNumber >= maxPages ? 1 : ++currPageNumber;
    await delay(getRandomArbitrary(5000, 25000));
  }
})();
