import fetch from "node-fetch";
import * as fs from "fs";
import { createRequire } from "module";
const require = createRequire(
    import.meta.url);
import csvwriter from "csv-writer";
const cheerio = require("cheerio");

let fullData = [];
let csvData = 0;
let csvDataNotFound = 0;
let countfullData = [];
let countNotFoundData = [];

const storeNames = ["nsubooks"]; //Enter Store name Here in between these two brakes and inverted comma's.

const store_id = "1"; // Enter the store store Id here
const fetchBooksData = async() => {
    try {
        let campusesCode = await getStore(storeNames);
        console.log(campusesCode);
        console.log("Total Compus:", campusesCode.length);
        for (let c = 0; c < campusesCode.length; c++) {
            //campusesCode.length always set this to 0 when starting new store
            let campusCode = campusesCode[c].code;
            let campusName = campusesCode[c].name;
            console.log("Line No:31 Campus Name: ", campusesCode[c].name);
            if (!campusCode) {
                console.log("Blocked Campus Name API");
            } else {
                let terms = await getTerm(storeNames, campusCode);
                if (!terms) {
                    console.log("Blocked terms Name API");
                } else {
                    let counter = 0;
                    for (let t = 0; t < terms.length; t++) {
                        //terms.length always set this to 0 when starting new store
                        let termsCode = terms[t].code;
                        let termsName = terms[t].name;
                        let departments = await getDepartment(
                            storeNames,
                            campusCode,
                            termsCode
                        );
                        counter += departments.length;
                        if (!departments) {
                            console.log("Blocked departments API");
                        } else {
                            var depFile = JSON.stringify(departments);
                            if (!fs.existsSync(`bn_deps/${storeNames[0]}_deps`)) {
                                fs.mkdirSync(`bn_deps/${storeNames[0]}_deps`);
                            }
                            fs.writeFile(
                                "./bn_deps/" +
                                storeNames[0] +
                                "_deps/bn_" +
                                campusCode.split(" ").join("") +
                                "_" +
                                termsCode.split(" ").join("") +
                                "_department.json",
                                depFile,
                                function(err) {
                                    if (err) throw err;
                                    console.log("line No:57" + "Department Saved");
                                }
                            );
                            // Department loop changed always set this to 0 when starting new
                            const dp = departments.length;
                            for (let d = 0; d < departments.length; d++) {
                                let departmentCode = departments[d].code;
                                let departmentName = departments[d].name;
                                let courses =
                                    (await getCourses(storeNames, termsCode, departmentCode)) ||
                                    "";
                                if (!courses) {
                                    console.log("Blocked courses API");
                                } else {
                                    // course loop changed
                                    for (let cs = 0; cs < courses.length; cs++) {
                                        let courseCode = courses[cs].code;
                                        let courseName = courses[cs].name;

                                        let sections = await getSections(
                                            storeNames,
                                            termsCode,
                                            departmentCode,
                                            courseCode
                                        );
                                        if (!sections) {
                                            console.log("line No:86 Blocked sections API");
                                        } else {
                                            // section loop always set this to 0 when starting new
                                            for (let s = 0; s < sections.length; s++) {
                                                let sectionCode = sections[s].code;
                                                let sectionName = sections[s].name;
                                                console.log("Department Code:", departmentName);
                                                let codes;
                                                let schoolName = await getSchoolName(storeNames);
                                                let url =
                                                    "https://" + storeNames[0] + ".bncollege.com/";
                                                let booksLength;
                                                let $;
                                                let code;
                                                for (let index = 1; index < 100; index++) {
                                                    let codes =
                                                        termsCode +
                                                        departmentCode.substr(
                                                            departmentCode.lastIndexOf("_"),
                                                            departmentCode.length
                                                        ) +
                                                        "_" +
                                                        courseCode +
                                                        "_" +
                                                        index;
                                                    let data = await getFinaldata(
                                                        storeNames,
                                                        termsCode,
                                                        codes,
                                                        sectionCode
                                                    );
                                                    $ = cheerio.load(data);
                                                    booksLength = $(".bned-collapsible-container")
                                                        .eq(0)
                                                        .find(".bned-cm-item-main-container").length;
                                                    if (booksLength > 0) {
                                                        code = codes;
                                                        break;
                                                    } else {
                                                        let tdcs_code = $(
                                                            ".bned-collapsible-head > h2 > a"
                                                        ).text();
                                                        if (
                                                            termsName.replace(/\s/g, "") +
                                                            departmentName +
                                                            courseName +
                                                            sectionName ==
                                                            tdcs_code.replace(/\s/g, "")
                                                        ) {
                                                            let notfoundcode = $(
                                                                ".bned-collapsible-head > h2 > a"
                                                            ).attr("href");
                                                            console.log("href", notfoundcode);
                                                            code = notfoundcode.substring(
                                                                notfoundcode.split("_", 2).join("_").length + 1
                                                            );
                                                            console.log(
                                                                "Books not Found",
                                                                tdcs_code.replace(/\s/g, ""),
                                                                "==",
                                                                termsName.replace(/\s/g, "") +
                                                                departmentName +
                                                                courseName +
                                                                sectionName,
                                                                code
                                                            );
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (booksLength > 0) {
                                                    console.log(
                                                        "Line No:89 Total Found Books",
                                                        booksLength
                                                    );
                                                    console.log("Found Books course_code", code);
                                                    for (let i = 0; i < booksLength; i++) {
                                                        let data = {};
                                                        data["Course_code"] = code;
                                                        data["bookrow_id"] = "";
                                                        data["bookstoreid"] = "3310";
                                                        // data["storeid"] = store_id;
                                                        // data["storenumber"] = " ";
                                                        // data["storedisplayname"] = schoolName;
                                                        // data["termid"] = termsCode;
                                                        data["termname"] = "Spring-24";
                                                        // data["termnumber"] = " ";
                                                        // data["programid"] = " ";
                                                        // data["programname"] = " ";
                                                        // data["campusid"] = campusCode;
                                                        data["campusname"] = campusName;
                                                        // data["department"] = departmentCode;
                                                        data["departmentname"] = departmentName;
                                                        // data["division"] = " ";
                                                        // data["divisionname"] = " ";
                                                        // data["courseid"] = courseCode;
                                                        data["coursename"] = courseName;
                                                        // data["section"] = sectionCode;
                                                        data["sectionname"] = sectionName;
                                                        data["instructor"] = $(".professor").text();
                                                        // data["schoolname"] = schoolName;
                                                        // data["cmid"] = " ";
                                                        // data["mtcid"] = " ";
                                                        let bookimage;
                                                        let productsDetail;
                                                        try {
                                                            productsDetail = await JSON.parse(
                                                                $(".js-bned-cm-cached-product-analytics-data")
                                                                .eq(i)
                                                                .text()
                                                            );
                                                        } catch (error) {
                                                            console.log("productsDetail", error);
                                                            continue;
                                                        }

                                                        let mbs =
                                                            productsDetail[0].productInfo.baseProductID;
                                                        bookimage = await getImage(storeNames, mbs);

                                                        data["bookimage"] = bookimage;
                                                        data["title"] = $(".bned-cm-item-main-container")
                                                            .eq(i)
                                                            .find("span.js-bned-item-name-text")
                                                            .eq(0)
                                                            .text(); //book
                                                        let length = $(".bned-cm-item-main-container")
                                                            .eq(i)
                                                            .find(".bned-item-attributes-wp")
                                                            .find(".bned-item-attribute").length;
                                                        if (length / 2 == 2) {
                                                            data["edition"] = "Not Found";
                                                            data["author"] = $(".bned-cm-item-main-container")
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".author")
                                                                .eq(0)
                                                                .text()
                                                                .replace(/\s/g, "");
                                                            data["isbn"] = $(".bned-cm-item-main-container")
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".bned-item-attribute")
                                                                .eq(1)
                                                                .find("span")
                                                                .eq(1)
                                                                .text();
                                                            data["materialtype"] = " ";
                                                            data["requirementtype"] = $(
                                                                    ".bned-cm-item-main-container"
                                                                )
                                                                .eq(i)
                                                                .find(".badge")
                                                                .text()
                                                                .replace(/\s/g, "");
                                                            data["publisher"] = $(
                                                                    ".bned-cm-item-main-container"
                                                                )
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".bned-item-attribute")
                                                                .eq(0)
                                                                .find("span")
                                                                .eq(1)
                                                                .text();
                                                        } else if (length / 2 == 3) {
                                                            data["edition"] = $(
                                                                    ".bned-cm-item-main-container"
                                                                )
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".bned-item-attribute")
                                                                .eq(0)
                                                                .find("span")
                                                                .eq(1)
                                                                .text();
                                                            data["author"] = $(".bned-cm-item-main-container")
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".author")
                                                                .eq(0)
                                                                .text()
                                                                .replace(/\s/g, "");
                                                            data["isbn"] = $(".bned-cm-item-main-container")
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".bned-item-attribute")
                                                                .eq(2)
                                                                .find("span")
                                                                .eq(1)
                                                                .text();
                                                            data["materialtype"] = " ";
                                                            data["requirementtype"] = $(
                                                                    ".bned-cm-item-main-container"
                                                                )
                                                                .eq(i)
                                                                .find(".badge")
                                                                .text()
                                                                .replace(/\s/g, "");
                                                            data["publisher"] = $(
                                                                    ".bned-cm-item-main-container"
                                                                )
                                                                .eq(i)
                                                                .find(".bned-item-attributes-wp")
                                                                .find(".bned-item-attribute")
                                                                .eq(1)
                                                                .find("span")
                                                                .eq(1)
                                                                .text();
                                                        }

                                                        // data["publishercode"] = " ";
                                                        // data["productcatentryid"] = " ";
                                                        data["copyrightyear"] = " ";
                                                        let mbsId = productsDetail[0].productInfo.productID;
                                                        let price = await getPrice(
                                                            storeNames,
                                                            mbsId,
                                                            termsCode,
                                                            codes
                                                        );
                                                        data["pricerangedisplay"] = price;
                                                        data["booklink"] = " ";
                                                        // data["store_url"] = url;
                                                        data["user_guid"] = " ";
                                                        data["course_codes"] = " ";
                                                        let today = new Date();
                                                        let date =
                                                            today.getFullYear() +
                                                            "-" +
                                                            (today.getMonth() + 1) +
                                                            "-" +
                                                            today.getDate();
                                                        let time =
                                                            today.getHours() +
                                                            ":" +
                                                            today.getMinutes() +
                                                            ":" +
                                                            today.getSeconds();
                                                        let dateTime = date + " " + time;
                                                        data["created_on"] = dateTime;
                                                        data["last_updated_on"] = dateTime;
                                                        fullData.push(data);
                                                        countfullData.push(data);
                                                        csvData += countfullData.length;
                                                        countfullData = [];
                                                        console.log(
                                                            '"Found"',
                                                            storeNames[0],
                                                            store_id,
                                                            campusName,
                                                            c,
                                                            termsName,
                                                            t,
                                                            "Depart " + departmentName,
                                                            d,
                                                            "Course " + courseName,
                                                            cs,
                                                            "section " + sectionName,
                                                            s,
                                                            i
                                                        );
                                                    }
                                                } else {
                                                    let data = {};
                                                    data["bookrow_id"] = " ";
                                                    data["bookstoreid"] = " ";
                                                    // data["storeid"] = store_id;
                                                    // data["storenumber"] = " ";
                                                    // data["storedisplayname"] = schoolName;
                                                    // data["termid"] = termsCode;
                                                    data["termname"] = "Spring-24";
                                                    // data["termnumber"] = " ";
                                                    // data["programid"] = " ";
                                                    // data["programname"] = " ";
                                                    // data["campusid"] = campusCode;
                                                    data["campusname"] = campusName;
                                                    // data["department"] = departmentCode;
                                                    data["departmentname"] = departmentName;
                                                    // data["division"] = " ";
                                                    // data["divisionname"] = " ";
                                                    // data["courseid"] = courseCode;
                                                    data["coursename"] = courseName;
                                                    // data["section"] = sectionCode;
                                                    data["sectionname"] = sectionName;
                                                    data["instructor"] = " ";
                                                    // data["schoolname"] = schoolName;
                                                    // data["cmid"] = " ";
                                                    // data["mtcid"] = " ";
                                                    data["materialtype"] = " ";
                                                    data["requirementtype"] = " ";
                                                    // data["publishercode"] = " ";
                                                    // data["productcatentryid"] = " ";
                                                    data["copyrightyear"] = " ";
                                                    data["booklink"] = " ";
                                                    // data["store_url"] = url;
                                                    data["user_guid"] = " ";
                                                    data["course_codes"] = " ";
                                                    let today = new Date();
                                                    let date =
                                                        today.getFullYear() +
                                                        "-" +
                                                        (today.getMonth() + 1) +
                                                        "-" +
                                                        today.getDate();
                                                    let time =
                                                        today.getHours() +
                                                        ":" +
                                                        today.getMinutes() +
                                                        ":" +
                                                        today.getSeconds();
                                                    let dateTime = date + " " + time;
                                                    data["created_on"] = dateTime;
                                                    data["last_updated_on"] = dateTime;
                                                    data["Course_code"] = code;
                                                    fullData.push(data);
                                                    countNotFoundData.push(data);
                                                    csvDataNotFound += countNotFoundData.length;
                                                    countNotFoundData = [];
                                                    console.log(
                                                        '"Not Found"',
                                                        storeNames[0],
                                                        store_id,
                                                        campusName,
                                                        c,
                                                        termsName,
                                                        t,
                                                        "Depart " + departmentName,
                                                        d,
                                                        "Course " + courseName,
                                                        cs,
                                                        "section " + sectionName
                                                    );
                                                }
                                            }
                                        }
                                        createCsv(fullData);
                                        fullData = [];
                                    }
                                }
                            }
                        }
                    }
                    console.log("Departments counter", counter);
                }
            }
        }
    } catch (error) {
        console.log("line No 224 ", error);
    }
};

fetchBooksData();

const { createObjectCsvWriter } = require('csv-writer');

function createCsv(fullData) {
    console.log("CSV Creating...");
    const csvWriter = createObjectCsvWriter({
        path: `./data_csv/${storeNames}_${store_id}.csv`,
        header: [
            { id: "bookrow_id", title: "bookrow_id" },
            { id: "bookstoreid", title: "bookstoreid" },
            { id: "termname", title: "termname" },
            { id: "campusname", title: "campusname" },
            { id: "departmentname", title: "departmentname" },
            { id: "coursename", title: "coursename" },
            { id: "sectionname", title: "sectionname" },
            { id: "instructor", title: "instructor" },
            { id: "bookimage", title: "bookimage" },
            { id: "title", title: "title" },
            { id: "edition", title: "edition" },
            { id: "author", title: "author" },
            { id: "isbn", title: "isbn" },
            { id: "materialtype", title: "materialtype" },
            { id: "requirementtype", title: "requirementtype" },
            { id: "publisher", title: "publisher" },
            { id: "copyrightyear", title: "copyrightyear" },
            { id: "pricerangedisplay", title: "pricerangedisplay" },
            { id: "booklink", title: "booklink" },
            { id: "user_guid", title: "user_guid" },
            { id: "course_codes", title: "course_codes" },
            { id: "created_on", title: "created_on" },
            { id: "last_updated_on", title: "last_updated_on" },
            { id: "file_code", title: "file_code" },
            { id: "title_id", title: "title_id" }
        ],
        append: true,
    });
    
    // Filter out rows with empty or undefined titles
    const nonEmptyRows = fullData.filter((row) => row.title && row.title.trim() !== '');

    console.log(
        `Data uploaded into csv successfully Found Data length "${nonEmptyRows.length}" not found data length "${fullData.length - nonEmptyRows.length}" = ${
            nonEmptyRows.length + (fullData.length - nonEmptyRows.length)
        }`
    );

    csvWriter
        .writeRecords(nonEmptyRows) // Write the filtered data without empty titles
        .then(() => console.log(`Total length = ${fullData.length}`))
        .catch(error => console.error('Error writing CSV:', error));
}


async function getFinaldata(storeName, termCode, code, section) {
    var campuseCode = termCode.substr(0, termCode.indexOf("_"));
    let res = "";
    section =
        (await section.slice(-1)) == "+" ? section.replace("+", "%2B") : section;
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/course-material-caching/course?campus=${campuseCode}&term=${termCode}&course=${code}&section=${section}&oer=false`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString1(),
            }
        );
        res = await str.text();
    } catch (error) {
        console.log("Line No:89,getFinaldata ", error);
    }
    return res;
}

async function getStore(storeName) {
    let res = "";
    try {
        for (let i = 0; i < storeNames.length; i++) {
            console.log(
                `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_CAMPUS&oer=false`
            );
            const str = await fetch(
                `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_CAMPUS&oer=false`, {
                    method: "GET",
                    mode: "cors",
                    headers: getHeaderString(),
                }
            );
            console.log(str);
            res = await str.json();
        }
    } catch (error) {
        console.log("store name API", error);
    }
    console.log(res);
    return res;
}

async function getTerm(storeName, campusId) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_TERM&campus=${campusId}&oer=false`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        res = await str.json();
    } catch (error) {
        console.log("line No.43 Api error", error);
    }
    return res;
}

async function getDepartment(storeName, campusId, termId) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_DEPARTMENT&campus=${campusId}&term=${termId}&oer=false`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        res = await str.json();
    } catch (error) {
        console.log("line No:52 error", error);
    }
    return res;
}

async function getCourses(storeName, termId, depId) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_COURSE&campus=&term=${termId}&department=${depId}&oer=false`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        res = await str.json();
    } catch (err) {
        console.log("err", err);
    }
    return res;
}

async function getSections(storeName, termId, depId, courseId) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/course-material/findCourse?courseFinderSuggestion=SCHOOL_COURSE_SECTION&campus=&term=${termId}&department=${depId}&course=${courseId}&oer=false`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        res = await str.json();
    } catch (error) {
        console.log("line No:72 Section Api error: ", error);
    }
    return res;
}

async function getSchoolName(storeName) {
    let res = "";
    try {
        const str = await fetch(`https://${storeName}.bncollege.com/`, {
            method: "GET",
            mode: "cors",
            headers: getHeaderString2(),
        });
        const ret = await str.text();
        const $ = cheerio.load(ret);
        res = $(".banner__component").find("a").find("img").attr("alt");
    } catch (error) {
        console.error("Line No:108", error);
    }
    return res;
}

async function getPrice(storeName, mbsId, termId, codes) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/product-price/${mbsId}?campusCode=&termCode=${termId}&courseCode=${codes}`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        const ret = await str.text();
        res = JSON.parse(ret).plpPrice.html;
    } catch (error) {
        console.log("Price API error", error);
    }
    return res;
}

async function getImage(storeName, mbsId) {
    let res = "";
    try {
        const str = await fetch(
            `https://${storeName}.bncollege.com/product-image/${mbsId}?format=product`, {
                method: "GET",
                mode: "cors",
                headers: getHeaderString2(),
            }
        );
        const ret = await str.text();
        const $ = cheerio.load(ret);
        res = $("img").attr("src");
    } catch (error) {
        console.log("Image API Error", error);
    }
    return res;
}

function getHeaderString() {
    return {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "text/plain",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
    };
}

function getHeaderString1() {
    return {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "text/html;charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        gzip: true,
    };
}

function getHeaderString2() {
    return {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
    };
}