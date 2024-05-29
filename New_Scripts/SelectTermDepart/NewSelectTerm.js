import puppeteer from 'puppeteer';
import ObjectsToCsv from 'objects-to-csv';

var bookstoreid = "2918";
var storeid = "";
var storeDispName = "";
var termname = "spring-24";
var campusname = "KLAMATH COMMUNITY COLLEGE";
var storeurl = "http://bookstore.klamathcc.edu/SelectTermDept";

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

var listItems;
var deptItems;
var sectItems;

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
const main = async () => {
    await page.goto(storeurl, { waitUntil: ['domcontentloaded', 'networkidle0'] });

    const itemTexts = [];
    listItems = await page.$$('.term_list li');
    const linkSelector = '.term_name.min-height25em.padding-top5.ordering_enabled';


    for (const listItem of listItems) {
        const text = await listItem.$eval('a.listLink', link => link.textContent.trim());
        itemTexts.push(text);
    }

    for (let i=0; i < itemTexts.length; i++) {
        termname = itemTexts[i];
        console.log("Term: " + termname);

        // clicking on term list
        await selectTerm();
        await page.waitForSelector('ul.dept_list li');

        deptItems = await page.$$eval('ul.dept_list li', deptItem => {
            return deptItem.map(item => item.textContent.trim());
        });

        for (let d = 0; d < deptItems.length; d++) {
            const deptInputSelector = 'input.deptInput';
            const inputElement = await page.$(deptInputSelector);
            if (inputElement) {
                deptName = deptItems[d];
                console.log("Department :", deptName);

                // clicking on dept list
                try {
                    await page.waitForSelector('ul.dept_list li', {timeout: 1000});
                } catch (error) {
                    await page.evaluate(() => {
                        const divs = document.querySelectorAll('div.Dept_Name_Div');
                        if (divs.length > 0) {
                            divs[divs.length - 1].click();
                        }
                    });
                }
                
                try {
                    await page.waitForSelector('ul.dept_list li', {visible: true});
                    await page.type(deptInputSelector, deptName);
                    await page.waitForSelector("ul.dept_list li.order_hover_color_down_up");
                    await page.keyboard.press('Enter');
                    await page.waitForSelector('ul.sect_list li');
                    sectItems = await page.$$eval('ul.sect_list li', sectItem => {
                        return sectItem.map(item => item.textContent.trim());
                    });
                } catch (error) {
                    console.log("Dept error: " + error);
                    const inputElements = await page.$$('input.deptInput');
                    const lastInputElement = inputElements[inputElements.length - 1];
                    const lastInputElementLength = await page.evaluate(element => element.value.length, lastInputElement);
                    for (let i = 0; i < lastInputElementLength; i++) {
                        await page.keyboard.press('Backspace');
                    }
                    continue;
                }
            } else {
                console.error('Dept Input element not found.');
            }

            for (let s = 0; s < sectItems.length; s++) {
                console.log("Section :", sectItems[s]);
                const inputSelector = 'input.courseId';
                const inputElement = await page.$(inputSelector);
                if (inputElement) {
                    await page.evaluate(() => {
                        const inputs = document.querySelectorAll('input.sectInput');
                        if (inputs.length > 0) {
                            inputs[inputs.length - 1].focus();
                        }
                    });

                    const sectLength = sectItems[s].length;
                    for (let index = sectLength-4; index > 0; index -= 2) {
                        const ss = sectItems[s].slice(0, index);
                        await page.type(inputSelector, ss);
                        try {
                            await page.waitForSelector('ul.sect_list li.order_hover_color_down_up', {timeout: 1000});
                            break;
                        } catch (error) {
                            const inputElements = await page.$$('input.sectInput');
                            const lastInputElement = inputElements[inputElements.length - 1];
                            const lastInputElementLength = await page.evaluate(element => element.value.length, lastInputElement);
                            for (let i = 0; i < lastInputElementLength; i++) {
                                await page.keyboard.press('Backspace');
                            }
                        }
                    }
                    await page.keyboard.press('Enter');
                } else {
                    console.error('Section Input element not found.');
                }
                
                try {
                    await page.type(deptInputSelector, deptName);
                    await page.waitForSelector("ul.dept_list li.order_hover_color_down_up");
                    await page.keyboard.press('Enter');
                    await page.waitForSelector('ul.sect_list li');
                } catch (error) {
                    console.log("Dept error in section loop: " + error);
                }
            }
            await page.click('#Get_Materials');
            try {
                await page.waitForNetworkIdle({timeout: 5000});
            } catch (error) {
                console.log("Loading error: "+ error);
                await page.reload({ waitUntil: ['domcontentloaded', 'networkidle0'] });
            }

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
                console.log("Book details error: " + error);
            }

            // clearing cookies
            try {
                const cookies = await page.cookies();
                for (const cookie of cookies) {
                    await page.deleteCookie(cookie);
                }
                const client = await page.target().createCDPSession();
                await client.send('Network.clearBrowserCookies');
                await page.reload({ waitUntil: ['domcontentloaded', 'networkidle0'] });
            } catch (error) {
                console.log("Cookies clear error: " + error);
            }

            // detecting captcha
            try {
                let captchaSelector = '[title="Widget containing a Cloudflare security challenge"]';
                await page.waitForSelector(captchaSelector, { timeout: 2000 });
                console.log('CAPTCHA detected. You need to solve it manually.');
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000});
                await page.waitForSelector("#txtSearch", {timeout: 60000});
            } catch (error) {
                console.log('No CAPTCHA detected. Page is fully loaded.');
            }
            if (i > 0)
            await selectTerm();
        }
    }
    await browser.close();
}

let today = new Date();
let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;

main();

async function selectTerm() {
    const linkSelector = '.term_name.min-height25em.padding-top5.ordering_enabled';
    await page.evaluate(linkSelector => {
        const link = document.querySelectorAll(linkSelector);
        if (link[1]) {
            link[1].click();
        }

        const inputs = document.querySelectorAll('input.termInput');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }, linkSelector);

    try {
        const inputSelector = 'input.TermId';
        const inputElement = await page.$$(inputSelector);
        if (inputElement) {
            const sh = termname.replace(/\s*\(.*?\)\s*/, '');
            await page.waitForSelector(inputSelector);
            await page.waitForSelector("ul.term_list li", {visible: true});
            await page.type(inputSelector, sh);
            await page.waitForSelector("ul.term_list li.order_hover_color_down_up");
            await page.keyboard.press('Enter');
        } else {
            console.error('Term Input element not found.');
        }
    } catch (error) {
        console.log("Term error: " + error);
    }
}

async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    await csv
        .toDisk(`./csv/Selecttermdepart_${bookstoreid}_${storeName}.csv`, {
            append: true,
        })
        .then(console.log("Succesfully Data save into CSV"));
}