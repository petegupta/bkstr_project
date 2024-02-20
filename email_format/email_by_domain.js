import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { readCSV, writeCSV } from "../New_Scripts/csv_file_manager/index.js";

const fileName = 'sample.csv';
const output_file = 'results.csv';

(async () => {
    const records = await readCSV(fileName);

    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        userDataDir: "/Users/mac/Library/Application Support/Google/Chrome/Profile 4"
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1420, height: 1080 });
    const customTimeout = 80000; // 80 seconds in milliseconds
    await page.setDefaultNavigationTimeout(customTimeout);

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const domain = (record.url).replace('http://', '').replace('https://', '').replace('www.', '');

        const searchQuery = `${domain}  cs/it department email`;

        try {
            await page.goto('https://www.google.com');
            await page.waitForSelector('textarea[name=q]');
            await page.type('textarea[name=q]', searchQuery);
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            let captchaDetected = false;

            while (!captchaDetected) {
                // Get the current URL and print it
                const currentUrl = await page.url();

                if (currentUrl.includes('https://www.google.com/sorry/')) {
                    console.log('Detected CAPTCHA page. Waiting for captcha resolution...');
                    await page.waitForNavigation();
                } else {
                    captchaDetected = true;
                }
            }

            const pageContent = await page.evaluate(() => document.body.textContent);
            const emailRegex = new RegExp(`\\b[A-Za-z0-9._%+-]+@${domain}\\b`, 'g');
            const allEmails = pageContent.match(emailRegex) || [];
            const uniqueEmailsSet = new Set(allEmails);
            const uniqueEmailsArray = [...uniqueEmailsSet];
            record.email = uniqueEmailsArray[0];
            const recordArray = Object.values(record);
            console.log(i);
            writeCSV(recordArray, output_file);
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }
    console.log('Data saved to ' + output_file);
    await browser.close();
})();