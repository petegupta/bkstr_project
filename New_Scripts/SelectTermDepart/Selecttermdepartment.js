import puppeteer from 'puppeteer';
import ObjectsToCsv from 'objects-to-csv';

var bookstoreid = "3653";
var storeid = "";
var storeDispName = "";
var termname = "spring-24";
var campusname = "Cisco College";
var storeurl = "https://www.ciscocollegebookstore.com/SelectTermDept";

const parts = storeurl.split('/');
const domain = parts[2];
var storeName = domain.split('.')[0];

var row = [];
var rows = [];

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
var price = [];
var pubDate;
var isbn;
var allSection = "";

var i = 0;
var d = 0;
var s = 0;
var cond = true;

var listItems;
var deptItems;
var sectItems;


const main = async() => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    try {
        // Go to the URL
        await page.goto(storeurl); // Replace with your target URL
        await page.waitForTimeout(2000);

        const itemTexts = [];
        listItems = await page.$$('.term_list li');
        const linkSelector = '.term_name.min-height25em.padding-top5.ordering_enabled';

        await page.evaluate(linkSelector => {
            const link = document.querySelectorAll(linkSelector);
            if (link[1]) {
                link[1].click();
            }
        }, linkSelector);


        for (const listItem of listItems) {
            const text = await listItem.$eval('a.listLink', link => link.textContent.trim());
            itemTexts.push(text);
        }



        for (i; i < itemTexts.length; i++) {
            try {
                console.log(itemTexts[i]);
                const inputSelector = 'input.TermId';
                const inputElement = await page.$(inputSelector);
                if (inputElement) {
                    // Simulate a click to bring the input element into focus
                    const sh = itemTexts[i].slice(0, 3);
                    await waitForTwoSecondsAsync()
                    await page.type(inputSelector, sh);
                    await waitForTwoSecondsAsync()
                    await page.keyboard.press('Enter');
                    await page.waitForSelector('ul.dept_list li');
                } else {
                    console.error('Input element not found.');
                }
            } catch (error) {
                console.log("termError: " + error);
            } // Optional: Add a delay to allow time for the action to complete.

            if (deptItems == null) {
                deptItems = await page.$$eval('ul.dept_list li', deptItem => {
                    return deptItem.map(item => item.textContent.trim());
                });
            }
            for (d; d < deptItems.length; d++) {



                try {
                    const inputSelector = 'input.deptInput';
                    const inputElement = await page.$(inputSelector);

                    if (cond) {

                        if (inputElement) {
                            console.log("Department :", deptItems[d]);
                            deptName = deptItems[d];
                            s = 0;
                            await page.type(inputSelector, deptItems[d]);
                            await waitForTwoSecondsAsync()
                            await page.keyboard.press('Enter');
                            await waitForTwoSecondsAsync()
                            await page.waitForSelector('ul.sect_list li');
                            sectItems = await page.$$eval('ul.sect_list li', sectItem => {
                                return sectItem.map(item => item.textContent.trim());
                            });
                        } else {
                            console.error('Input element not found.');
                        }
                    } else {
                        d--;
                        if (inputElement) {
                            console.log("Department :", deptItems[d]);
                            await page.type(inputSelector, deptItems[d]);
                            await waitForTwoSecondsAsync()
                            await page.keyboard.press('Enter');
                            await waitForTwoSecondsAsync()
                            await page.waitForSelector('ul.sect_list li');

                        } else {
                            console.error('Input element not found.');
                        }
                    }
                } catch (error) {
                    console.log("deptError: " + error);
                }

                if (sectItems == null) {
                    sectItems = await page.$$eval('ul.sect_list li', sectItem => {
                        return sectItem.map(item => item.textContent.trim());
                    });
                }
                if (s < sectItems.length) {
                    for (s; s < sectItems.length; s++) {
                        try {
                            console.log("Section :", sectItems[s]);
                            const inputSelector = 'input.courseId';
                            const inputElement = await page.$(inputSelector);

                            if (inputElement) {
                                const ss = sectItems[s].slice(0, 8);
                                await waitForTwoSecondsAsync()
                                await page.type(inputSelector, ss);
                                await waitForTwoSecondsAsync()
                                await page.keyboard.press('Enter');
                                await waitForTwoSecondsAsync()
                                await page.keyboard.press('Enter');


                                cond = false;
                                if (s == (sectItems.length - 1)) {
                                    cond = true;
                                    await page.click('#Get_Materials');
                                    await page.waitForTimeout(2000);



                                    try {
                                        bookRequired = await page.$$eval('.red.Course_With_Material_Required', (elements) => {
                                            return elements.map(element => {
                                                return element.textContent.trim();
                                            });
                                        });
                                        bookImg = await page.$$eval('img.img-thumbnail', (elements) => {
                                            return elements.map(element => {
                                                return element.getAttribute('src');
                                            });
                                        });

                                        author = await page.$$eval('.small.Book_Author', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('Author:', '').trim();
                                            });
                                        });
                                        instructorName = await page.$$eval('.No_Material_Course_Instructor', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                const startIndex = text.indexOf('Instructor:') + 'Instructor:'.length;
                                                const name = text.substring(startIndex, text.length - 2).trim();
                                                return name;
                                            });
                                        });

                                        isbn = await page.$$eval('.small.Book_ISBN', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('ISBN:', '').trim();
                                            });
                                        });
                                        bookName = await page.$$eval('h2.Book_Title', (elements) => {
                                            return elements.map(element => {
                                                return element.textContent.trim();
                                            });
                                        });
                                        publisherName = await page.$$eval('.small.Book_Publisher', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('Publisher:', '').trim();
                                            });
                                        });
                                        edition = await page.$$eval('.small.Book_Edition', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('Edition:', '').trim();
                                            });
                                        });
                                        courseCode = await page.$$eval('.No_Material_Course_ID', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('Course ID:', '').trim();
                                            });
                                        });
                                        pubDate = await page.$$eval('.small.Book_Published', (elements) => {
                                            return elements.map(element => {
                                                const text = element.textContent.trim();
                                                return text.replace('Published Date:', '').trim();
                                            });
                                        });

                                        const labelElements = await page.$$('label');
                                        if (labelElements.length > 0) {
                                            for (const labelElement of labelElements) {
                                                // Extract the text content from the <strong> element inside each <label>.
                                                const iprice = await page.evaluate(labelElement => {
                                                    const strongElement = labelElement.querySelector('strong');
                                                    if (strongElement) {
                                                        const strongText = strongElement.textContent.trim();
                                                        // Use a regular expression to check if strongText contains a dollar amount.
                                                        if (/\$\d+\.\d{2}/.test(strongText)) {
                                                            return strongText;
                                                        }
                                                    }
                                                    return null;
                                                }, labelElement);
                                                if (iprice) {
                                                    price.push(iprice);
                                                } else {
                                                    price.push(" ");
                                                }
                                            }
                                        } else {
                                            console.log('No label elements with prices found');
                                        }

                                        const numRows = bookImg.length; // You can choose any array here.


                                        for (let i = 0; i < numRows; i++) {
                                            row = {
                                                bookrow_id: "",
                                                bookstoreid: bookstoreid,
                                                // storeid: storeid,
                                                // storenumber: "",
                                                // storedisplayname: storeDispName,
                                                termname: termname,
                                                campusname: campusname,
                                                // department: deptCode,
                                                departmentname: deptName,
                                                coursename: courseName,
                                                // section: section,
                                                sectionname: "",
                                                instructor: instructorName[i],
                                                // schoolname: campusname,
                                                bookimage: bookImg[i],
                                                title: bookName[i],
                                                edition: edition[i],
                                                author: author[i],
                                                isbn: isbn[i],
                                                materialtype: "",
                                                requirementtype: bookRequired[i],
                                                publisher: publisherName[i],
                                                // publishercode: "",
                                                copyrightyear: pubDate[i],
                                                pricerangedisplay: price[i],
                                                booklink: allSection,
                                                // store_url: storeurl,
                                                user_guid: "",
                                                course_codes: "",
                                                created_on: dateTime,
                                                last_updated_on: dateTime,
                                                file_code: "",
                                                title_id: "",
                                            };

                                            rows.push(row);
                                        }
                                        CsvWriter(rows)
                                        rows = [];

                                    } catch (error) {
                                        console.log("bookdetails error", error);
                                    }



                                    const cookies = await page.cookies();
                                    for (const cookie of cookies) {
                                        await page.deleteCookie(cookie);
                                    }

                                    // Use CDP to clear cookies
                                    const client = await page.target().createCDPSession();
                                    await client.send('Network.clearBrowserCookies');

                                    // Refresh the page to see the effects
                                    await page.reload();

                                    const linkSelector = '.deptId.dept_value';

                                    await page.evaluate(linkSelector => {
                                        const link = document.querySelectorAll(linkSelector);
                                        if (link[1]) {
                                            link[1].click();
                                        }
                                    }, linkSelector);
                                    await page.waitForTimeout(2000);
                                }
                                s++;
                                break;

                            } else {
                                console.error('Input element not found.');
                            }
                        } catch (error) {
                            console.log("sectError: " + error);
                        }
                    }
                } else {
                    cond = true;
                }
            }
        }


    } catch (error) {
        console.error('An error occurred:', error);
    }
};

async function waitForTwoSecondsAsync() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(); // Resolve the Promise to indicate that the waiting is done.
        }, 2000); // 2000 milliseconds = 2 seconds
    });
}

async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    console.log("CSV Creating...");
    await csv
        .toDisk(`./csv/Selecttermdepart_${bookstoreid}_${storeName}.csv`, {
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