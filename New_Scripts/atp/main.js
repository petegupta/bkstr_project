import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
puppeteer.use(StealthPlugin());

let webUrl = 'https://atp.pmi.org/provider-directory';
let apiUrl = 'https://atp.pmi.org/api/providers/directory';
getDataFromWebpage(webUrl, apiUrl, {pageSize: 1000})
    .then((data) => {
        data = (JSON.parse(data)).results;
        let bookstoreData = [];
        data.forEach(element => {
            let courses = [];
            (element.courseTypes).forEach(course => {
                courses.push(course.description);
            });
            bookstoreData.push({
                id: element.partyId,
                org_name: element.name,
                website: element.website,
                address: element.city + ' ' + element.province + ' ' + element.country,
                courses: courses.join(';')
            })
        });

        const csvFilePath = 'data_22JAN2024_amzad.csv';

        // Convert the data to CSV format
        const csvData = bookstoreData.map(entry => ({
            id: entry.id,
            org_name: entry.org_name,
            website: entry.website,
            address: entry.address,
            courses: entry.courses,
        }));

        // Write CSV file
        fs.writeFileSync(csvFilePath, 'id,org_name,website,address,courses\n');
        csvData.forEach(entry => {
            fs.appendFileSync(
                csvFilePath,
                `${entry.id},"${entry.org_name}","${entry.website}","${entry.address}","${entry.courses}"\n`
            );
        });

        console.log(`CSV file created as ${csvFilePath}`);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

async function getDataFromWebpage(webUrl, api_url, params = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            await page.setViewport({ width: 1420, height: 1080 });
            const customTimeout = 80000;
            await page.setDefaultNavigationTimeout(customTimeout);

            page.on('request', (request) => {
                if (request.resourceType() === 'xhr' && request.url() === api_url) {
                    let postData = request.postData();
                    let postDataObj = postData ? JSON.parse(postData) : {};
                    for (let key in params) {
                        postDataObj[key] = params[key];
                    }
                    request.continue({
                        method: 'POST',
                        postData: JSON.stringify(postDataObj),
                    });
                } else {
                    request.continue();
                }
            });

            let xhrResponseData;

            const responsePromise = new Promise(async (responseResolve) => {
                page.on('response', async (response) => {
                    if (response.request().resourceType() === 'xhr') {
                        if (response.url() === api_url) {
                            try {
                                xhrResponseData = await response.text();
                                responseResolve();
                            } catch (err) {
                                xhrResponseData = 'Error retrieving response body: ' + err.message;
                                responseResolve();
                            }
                        }
                    }
                });
            });

            await page.goto(webUrl, { waitUntil: 'load', timeout: 0 });
            await responsePromise;
            await browser.close();

            resolve(xhrResponseData);
        } catch (error) {
            reject(error);
        }
    });
}