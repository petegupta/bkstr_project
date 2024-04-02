import fetch from 'node-fetch';
import cheerio from 'cheerio';
import ObjectsToCsv from "objects-to-csv";

let storeName = 'grinnell';
var bookstoreid = "2900";
var storeid = "";
var storeDispName = storeName;
var termname = "Spring-24";
var campusname = "Grinnell College";

let terms = [];
var row = [];

var deptCode;
var deptName;
var courseCode;
var courseName;
var sectionData;
var sectionName = "";
var instructorName;
var bookRequired;
var bookImg;
var bookName;
var publisherName;
var publisherCode;
var author;
var edition;
var price;
var pubDate;
var isbn;
var sectionIds;

let store_url = `https://${storeName}.verbacompare.com`;
(async() => {
    try {
        // Fetch the store's main page using fetch
        const response = await fetch(store_url);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        // Extract and parse cookies from the response headers
        const cookies = response.headers.raw()['set-cookie'];
        // console.log('Cookies:', cookies);

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract terms from the HTML using Cheerio
        const scriptRegex = /var\s+terms\s+=\s+new\s+Verba\.Compare\.Collections\.Terms\(([\s\S]*?)\);/i;
        const scriptMatch = html.match(scriptRegex);

        if (scriptMatch && scriptMatch.length >= 2) {
            const jsonData = scriptMatch[1];
            const termsID = JSON.parse(jsonData);

            // Extract the 'id' values from the terms
            terms = termsID.map(term => term.id);
            // console.log(termsID);
        } else {
            console.log('JSON data not found in the script tag.');
        }

        // Extract the CSRF token from the page
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        // console.log('CSRF Token:', csrfToken);
        await fetchData(csrfToken, cookies);
    } catch (error) {
        console.log('Error fetching data:', error);
    }
})();

async function fetchData(csrfToken, cookies) {
    for (let t = 0; t < terms.length; t++) {
        if (!terms[t]) {
            console.log('Term Not found');
        } else {
            let departments = await getDepartments(terms[t], csrfToken, cookies);
            // console.log(departments);
            await delay();
            if (!departments) {
                console.log("No depattments");
            } else {
                for (let d = 0; d < departments.length; d++) {
                    deptCode = departments[d].id ? departments[d].id : "";
                    deptName = departments[d].name ? departments[d].name : "";
                    let departmentsid = departments[d].id;
                    let Courses = await getCourses(terms[t], departmentsid, csrfToken, cookies);
                    // console.log(Courses);
                    // console.log(Courses[d].name);
                    sectionIds = [];
                    Courses.forEach(course => {
                        course.sections.forEach(section => {
                            sectionIds.push(section.id);
                        });
                    });

                    console.log('Section IDs:', sectionIds);
                    await delay()
                    if (!Courses) {
                        console.log("No courses");
                    } else {
                        for (let s = 0; s < sectionIds.length; s++) {
                            sectionData = sectionIds[s]
                            console.log(sectionData);
                            await delay();
                            let bookdetails = await getBooksDetails(sectionData);
                            try {
                                const html = bookdetails;
                                const $ = cheerio.load(html);
                                // Find the script containing JSON data
                                const script = $('script').filter((index, element) => {
                                    return $(element).html().includes('var sections = new Verba.Compare.Collections.Sections');
                                });

                                if (script.length) {
                                    // Extract the JSON data
                                    // Initialize an empty array to store book information
                                    const jsonScriptContent = script.html().trim();
                                    const startIndex = jsonScriptContent.indexOf('Sections(') + 9;
                                    const endIndex = jsonScriptContent.lastIndexOf(']') + 1;
                                    const jsonData = jsonScriptContent.substring(startIndex, endIndex);
                                    const newjson = JSON.parse(jsonData);
                                    // console.log(jsonData);
                                    const bookInformation = [];

                                    // Loop through the data and extract book information
                                    newjson.forEach((course) => {
                                        const inst = course.instructor;
                                        if (course.books) {
                                            course.books.forEach((book) => {
                                                bookName = book.title;
                                                author = book.author;
                                                isbn = book.isbn;
                                                price = book.offers && book.offers[0] ? book.offers[0].total : null;
                                                bookRequired = book.required;
                                                bookImg = book.cover_image_url;
                                                instructorName = inst;


                                                row.push({
                                                    bookrow_id: "",
                                                    bookstoreid: bookstoreid,
                                                    termname: "Spring-24",
                                                    campusname: campusname,
                                                    departmentname: deptName,
                                                    coursename: courseName,
                                                    sectionname: sectionName,
                                                    instructor: instructorName,
                                                    bookimage: bookImg,
                                                    title: bookName,
                                                    edition: "",
                                                    author: author,
                                                    isbn: isbn,
                                                    materialtype: "",
                                                    requirementtype: bookRequired,
                                                    publisher: "",
                                                    copyrightyear: "",
                                                    pricerangedisplay: price,
                                                    booklink: "",
                                                    user_guid: "",
                                                    course_codes: "",
                                                    created_on: dateTime,
                                                    last_updated_on: dateTime,
                                                    file_code: "",
                                                    title_id: "",
                                                })
                                            });

                                            CsvWriter(row)
                                            row = [];
                                        }
                                    });



                                } else {
                                    console.error('JSON data not found in the HTML for section ID: ' + sectionData);
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error);
                            }


                        }
                    }
                }
            }
        }
    }
}
async function getDepartments(termId, csrfToken, cookies) {
    try {
        const headers = {
            'X-Csrf-Token': csrfToken,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US, en; q=0.9',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: store_url,
            'Sec-Fetch-Mode': 'cors',
            Cookie: cookies.join('; '), // Include cookies in the request
        };

        // Make an HTTP GET request using fetch
        const response = await fetch(
            `https://${storeName}.verbacompare.com/compare/departments/?term=${termId}`, {
                method: 'GET', // Change the method to 'POST' if you intend to send data
                headers: headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const departments = await response.json();

        return departments;
    } catch (error) {
        console.log('Error fetching departments:', error);
        await ldelay();
        return [];
    }
}

async function getCourses(termId, departmentid, csrfToken, cookies) {
    try {
        const headers = {
            'X-Csrf-Token': csrfToken,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US, en; q=0.9',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: store_url,
            'Sec-Fetch-Mode': 'cors',
            Cookie: cookies.join('; '), // Include cookies in the request
        };

        // Make an HTTP GET request using fetch

        const response = await fetch(
            `https://${storeName}.verbacompare.com/compare/courses/?id=${departmentid}&term_id=${termId}`, {
                method: 'GET', // Change the method to 'POST' if you intend to send data
                headers: headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const courses = await response.json();
        // console.log(courses);        
        return courses;
    } catch (error) {
        console.log('Error fetching Courses:', error);
        await ldelay();

        return [];
    }
}
async function getSection(termId, departmentid, courseid, csrfToken, cookies) {
    try {
        const headers = {
            'X-Csrf-Token': csrfToken,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US, en; q=0.9',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: store_url,
            'Sec-Fetch-Mode': 'cors',
            Cookie: cookies.join('; '), // Include cookies in the request
        };

        // Make an HTTP GET request using fetch

        const response = await fetch(
            `https://${storeName}.verbacompare.com/compare/sections/?id=${courseid}&department_id=${departmentid}$term_id=${termId}`, {
                method: 'GET', // Change the method to 'POST' if you intend to send data
                headers: headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const sections = await response.json();
        // console.log(sections);
        return sections;
    } catch (error) {
        console.log('Error fetching Section:', error);
        await ldelay();
        return [];
    }
}

async function getBooksDetails(sectionId) {
    let bookdetails = "";
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US, en; q=0.9',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: store_url,
            'Sec-Fetch-Mode': 'cors',
        };
        const url = `https://${storeName}.verbacompare.com/comparison?id=${sectionId}`;
        const response = await fetchWithRetry(url, headers);
        bookdetails = await response.text();
    } catch (error) {
        console.log("Error fetching bookdetails", error);
        await ldelay();
    }
    return bookdetails;
}



async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    console.log("CSV Creating...");
    await csv
        .toDisk(`./datacsv/verbacampus_${storeName}.csv`, {
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

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

function delay() {
    const min = 1000; // 1 second in milliseconds
    const max = 3000; // 3 seconds in milliseconds
    const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, randomTime);
    });
}

function ldelay() {
    const randomTime = 8000;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, randomTime);
    });
}
async function fetchWithRetry(url, headers) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (response.status === 429) {
            // If a 429 error is received, wait for a while and then retry
            console.log('Received a 429 error. Retrying after a delay...');
            await ldelay() // Wait for 5 seconds (adjust the delay as needed)
            return fetchWithRetry(url, headers); // Retry the request
        }

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Error in fetchWithRetry:', error);
        await ldelay();
        throw error;
    }
}