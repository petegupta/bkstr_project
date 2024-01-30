const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const fastcsv = require('fast-csv');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add the Stealth plugin to Puppeteer
puppeteer.use(StealthPlugin());

    (async () => {
        const browser = await puppeteer.launch({ 
            headless: false,
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            userDataDir: "/Users/mac/Library/Application Support/Google/Chrome/Profile 4"
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1420, height: 1080 });

        const customTimeout = 80000; // 80 seconds in milliseconds
        await page.setDefaultNavigationTimeout(customTimeout);

        const csvFileName = 'sample.csv';
        const searchColumnIndex = 5;
        const domainIndex = 2;

        const csvStream = fs.createReadStream(csvFileName, 'utf-8');
        const records = [];

        csvStream
            .pipe(fastcsv.parse({ headers: false }))
            .on('data', row => {
                records.push(row);
            })
            .on('end', async () => {
                const newCsvStream = fastcsv.format({ headers: false });
                newCsvStream.pipe(fs.createWriteStream('results2.csv'));

                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    const fullName = record[searchColumnIndex];
                    const domain = record[domainIndex];
                    const [firstName, ...restName] = fullName ? fullName.split(' ') : ['', ''];
                    const lastName = restName.join(' ');

                    const searchQuery = `email ${domain}  ${fullName}`;

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
                        const allEmails = pageContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

                        const emailRegexArray = [
                            new RegExp(`\\b\\w*${firstName.toLowerCase()}\\w*@${domain}\\b`, 'i'),
                            new RegExp(`\\b\\w*${firstName.toLowerCase()}@${domain}\\b`, 'i'),
                            new RegExp(`${firstName.toLowerCase()}\\w*@${domain}\\b`, 'i'),
                            new RegExp(`\\b\\w*${lastName.toLowerCase()}\\w*@${domain}\\b`, 'i'),
                            new RegExp(`\\b\\w*${lastName.toLowerCase()}@${domain}\\b`, 'i'),
                            new RegExp(`${lastName.toLowerCase()}\\w*@${domain}\\b`, 'i'),
                        ];

                        let bestEmail = '';
                        let bestScore = -1;

                        for (const email of allEmails) {
                            let currentScore = 0;

                            for (const emailRegex of emailRegexArray) {
                                const matches = email.match(emailRegex);

                                if (matches && matches.length > 0) {
                                    const score = calculateScore(matches[0], firstName, lastName);

                                    if (score > currentScore) {
                                        currentScore = score;
                                        bestEmail = email;
                                    }
                                }
                            }
                        }

                        records[i][6] = bestEmail;
                        newCsvStream.write(records[i]);

                    } catch (error) {
                        records[i][6] = '';
                        console.error('Error occurred:', error);
                        newCsvStream.write(records[i]);
                    }
                }

                newCsvStream.end();
                console.log('Data saved to results2.csv');
                await browser.close();
            });
    })();

function calculateScore(matchedEmail, firstName, lastName) {
    let score = 0;

    if (firstName) {
        score += countMatchedCharacters(matchedEmail, firstName);
    }

    if (lastName) {
        score += countMatchedCharacters(matchedEmail, lastName);
    }

    return score;
}

function countMatchedCharacters(email, namePart) {
    return namePart.split('').filter(char => email.includes(char)).length;
}