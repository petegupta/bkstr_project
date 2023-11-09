import puppeteer from "puppeteer";
import ObjectsToCsv from "objects-to-csv";

var bookstoreid = "";
var storeid = "";
var storeDispName = "";
var termname = "Fall 2023";
var campusname = "";
var store_url = "https://nwc.textbooktech.com/";

var row = [];

var deptCode;
var deptName;
var courseCode;
var courseName;
var section;
var instructorName;
var bookRequired;
var bookImg;
var bookName;
var publisherName;
var publisherCode = "";
var author;
var edition;
var price;
var pubDate;
var isbn;
var allSection = "";


async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    try {
        await page.goto(store_url); // Replace with your target URL
        await page.waitForTimeout(2000);

        const Element = await page.$('a[href="#textbook-lookup-course"]');
        if (Element) {

            await page.click('a[href="#textbook-lookup-course"]');
            await page.waitForTimeout(2000);
        }

        await page.waitForSelector("#lookup_department_0", { visible: true });
        const depoptions = await page.evaluate(() => {
            const select = document.querySelector("#lookup_department_0");
            return Array.from(select.options).map((option) =>
                option.textContent.trim()
            );
        });

        // Loop through the options and select each one
        for (let i = 1; i < depoptions.length; i++) {
            // Perform any actions with the selected option here
            try {
                await page.click("#lookup_department_0");
                await page.waitForTimeout(1000);
                await page.keyboard.press("ArrowDown");
                await page.keyboard.press("Enter");
                await page.waitForTimeout(2000);

                await page.waitForSelector("#lookup_course_0", { visible: true });
            } catch (error) {
                console.log("Department error", error);
            }
            const couoptions = await page.evaluate(() => {
                const select = document.querySelector("#lookup_course_0");
                return Array.from(select.options).map((option) =>
                    option.textContent.trim()
                );
            });
            for (let j = 1; j < couoptions.length; j++) {
                try {
                    await page.click("#lookup_course_0");
                    await page.waitForTimeout(1000);
                    await page.keyboard.press("ArrowDown");
                    await page.keyboard.press("Enter");

                    await page.waitForTimeout(2000);

                    await page.waitForSelector("#lookup_section_0", { visible: true });
                } catch (error) {
                    console.log("Course Error", error);
                }
                const secoptions = await page.evaluate(() => {
                    const select = document.querySelector("#lookup_section_0");
                    return Array.from(select.options).map((option) =>
                        option.textContent.trim()
                    );
                });

                for (let k = 1; k < secoptions.length; k++) {
                    try {
                        await page.click("#lookup_section_0");
                        await page.waitForTimeout(1000);
                        await page.keyboard.press("ArrowDown");
                        await page.keyboard.press("Enter");

                        await page.waitForTimeout(2000);

                        await page.evaluate(() => {
                            const submitButton = document.querySelector('input[type="submit"][name="commit"][value="Lookup Courses"]');
                            if (submitButton) {
                                submitButton.click();
                            } else {
                                console.error('Submit button not found');
                            }
                        });

                        await page.waitForTimeout(4000);
                        try {
                            price = await page.$eval('span[itemprop="price"]', (element) => element ? element.textContent.trim() : " ");
                            bookName = await page.$eval('.product-info h3', (element) => element ? element.textContent.trim() : " ");
                            bookRequired = await page.$eval('.product-required', (element) => element ? element.textContent.trim() : " ");
                            bookImg = await page.$eval('.product-page-image img', (element) => element ? element.getAttribute('src') : " ");
                            const productAttributes = await page.$$eval('.product-attributes .standard-attribute', (elements) => {
                                return elements.map((element) => {
                                    const key = element.querySelector('strong').textContent.replace(':', '').trim();
                                    const value = element.textContent.split(':')[1].trim();
                                    return { key, value };
                                });
                            });

                            // Accessing individual attributes
                            author = (productAttributes.find(attr => attr.key === 'Author') || {}).value || '';
                            publisherName = (productAttributes.find(attr => attr.key === 'Publisher') || {}).value || '';
                            edition = (productAttributes.find(attr => attr.key === 'Edition') || {}).value || '';
                            isbn = (productAttributes.find(attr => attr.key === 'ISBN') || {}).value || '';


                            const courseCode = await page.$eval('.course-info div', (element) => {
                                return element.textContent;
                            });

                            // Split the text using "-"
                            const parts = courseCode.split('-');

                            // Get the third part (ACCT)
                            deptName = parts[2].trim();
                            console.log("departmentName: " + deptName);

                            row.push({
                                bookrow_id: "",
                                bookstoreid: bookstoreid,
                                storeid: storeid,
                                storenumber: "",
                                storedisplayname: storeDispName,
                                termname: termname,
                                campusname: campusname,
                                department: deptCode,
                                departmentname: deptName,
                                coursename: courseName,
                                section: "",
                                sectionname: "",
                                instructor: instructorName,
                                schoolname: campusname,
                                bookimage: bookImg,
                                title: bookName,
                                edition: edition,
                                author: author,
                                isbn: isbn,
                                materialtype: "",
                                requirementtype: bookRequired,
                                publisher: publisherName,
                                publishercode: "",
                                copyrightyear: "",
                                pricerangedisplay: price,
                                booklink: "",
                                store_url: store_url,
                                user_guid: "",
                                course_codes: "",
                                created_on: dateTime,
                                last_updated_on: dateTime,
                                file_code: ""
                            })
                            CsvWriter(row)
                            row = [];
                        } catch (error) {
                            console.log("NO Book Found: " + error);
                        }

                        await page.goBack();
                    } catch (error) {
                        console.log("sectionError:", error);
                    }



                }

            }

            // Add a delay (for example, 1 second) to see the effect (optional)
            await page.waitForTimeout(2000);
        }
    } catch (error) {
        console.log("ErrorMain: " + error.message);
    } finally {
        await browser.close();
    }
}

async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    console.log("CSV Creating...");
    await csv
        .toDisk(`./csv/Lookup_textbooks_${bookstoreid}.csv`, {
            append: true,
        })
        .then(console.log("Succesfully Data save into CSV"));
}

let today = new Date();
let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;

main();