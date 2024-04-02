//store with url https://mchs.textbookx.com/institutiol/index.php

import  fetch from 'node-fetch';
import ObjectsToCsv from "objects-to-csv";

const storeName = "mchs";
const bookstoreId = "1133";
const campusName = "Mercy College of Health Science";
const termCodeList = [
{
    name:"Fall-2023-10-week-term",
    termcode:"528377"
},
{
    name:"Fall Semester 2023",
    termcode:"525704"
}
];
// Headers for the POST request
const headers = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': `https://${storeName}.textbookx.com`,
  'Referer': `https://${storeName}.textbookx.com/institutional/index.php?action=browse`,
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'X-Requested-With': 'XMLHttpRequest'
};

// POST request options
const options = {
  method: 'POST',
  headers: headers,
};

var row = [];

var storeUrl = `https://${storeName}.textbookx.com/institutiol/index.php`
var termName;
var deptCode;
var deptName;
var courseCode;
var courseName;
var sectionCode;
var sectionName;
var instructor;
var isbn;
var title;
var author;
var publisher;
var publishDate;
var edition;
var listPrice;
var required;


async function getBookData(){
    for(let termId = 0;termId<termCodeList.length;termId++){
        console.log(termCodeList[termId].name);
        termName = termCodeList[termId].name ? termCodeList[termId].name : "";
        waitRandom();
        const allDepartments = await getDepartmentsAndCourses(termCodeList[termId].termcode);
        // console.log(allDepartments.departments.length);
        // return
        if(allDepartments.departments.length == 0){
            console.log("depts = 0");
            continue;
        }
        for(let dept = 0; dept < allDepartments.departments.length;dept++){
            deptCode = allDepartments.departments[dept].code ? allDepartments.departments[dept].code : "";
            deptName = allDepartments.departments[dept].name ? allDepartments.departments[dept].name : "";
            // console.log(allDepartments.departments[dept].id)
            waitRandom();
            const allCourse = await getDepartmentsAndCourses(allDepartments.departments[dept].id);
            if(allCourse.courses.length == 0){
                console.log("courses = 0");
                continue;
            }
            for(let course = 0 ;course < allCourse.courses.length;course++){
                // console.log(allCourse.courses[course].id)
                courseCode = allCourse.courses[course].code ? allCourse.courses[course].code  : "";
                courseName = allCourse.courses[course].name ? allCourse.courses[course].name : "";
                instructor = allCourse.courses[course].user_name ?  allCourse.courses[course].user_name : "";
                sectionCode = allCourse.courses[course].section ? allCourse.courses[course].section : "";
                waitRandom();
                const allBooks = await getBook(allCourse.courses[course].id);
                if(allBooks.length == 0){
                    console.log("books = 0");
                    continue;
                }
                for(let book = 0 ;book < allBooks.length ; book++){
                    console.log(deptName," ",dept," ",courseName, " ",course," book ",book);
                    isbn = allBooks[book].isbn ? allBooks[book].isbn : "";
                    title = allBooks[book].title ? allBooks[book].title : "";
                    author = allBooks[book].author ? allBooks[book].author : "";
                    publisher =  allBooks[book].publisher ? allBooks[book].publisher : "";
                    publishDate = allBooks[book].publish_date ? allBooks[book].publish_date : "";
                    edition = allBooks[book].edition ? allBooks[book].edition : "";
                    listPrice = allBooks[book].list_price ? allBooks[book].list_price : "";
                    required = allBooks[book].book_type ? allBooks[book].book_type : "";
                    row.push({
                      bookrow_id: "",
                      bookstoreid: bookstoreid,
                      // storeid: storeid,
                      // storenumber: "",
                      // storedisplayname: storeDispName,
                      termname: "Spring-24",
                      campusname: campusname,
                      // department: deptCode,
                      departmentname: deptName,
                      coursename: courseName,
                      // section: sectionData,
                      sectionname: sectionName,
                      instructor: instructorName,
                      // schoolname: campusname,
                      bookimage: bookImg,
                      title: bookName,
                      edition: "",
                      author: author,
                      isbn: isbn,
                      materialtype: "",
                      requirementtype: bookRequired,
                      publisher: "",
                      // publishercode: "",
                      copyrightyear: "",
                      pricerangedisplay: price,
                      booklink: "",
                      // store_url: store_url,
                      user_guid: "",
                      course_codes: "",
                      created_on: dateTime,
                      last_updated_on: dateTime,
                      file_code: "",
                      title_id: "",
                  })
                    CsvWriter(row)
                    row = [];
                }
                console.log("All books done for this course moving to next course")
            }
            console.log("This course done moving to next department")  
        }
        console.log("This Department done moving to next term")  
    }
    console.log("All data is collected successfully");
}

getBookData()

async function getDepartmentsAndCourses(id){
    let res;
    try {
        let data = await fetch(`https://${storeName}.textbookx.com/tools/ajax/misc_ajax.php/getDepartmentsAndCourses/${id}`,options);
        res = await data.json();
    } catch (error) {
        console.log("Books Details API", error);
    }

    return res;
}


// Headers for the GET request
const headersGetReq = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': `https://${storeName}.textbookx.com/institutional/index.php?action=browse`,
    'Sec-Ch-Ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  };
  
  // GET request options
  const optionsGetReq = {
    method: 'GET',
    headers: headersGetReq
  };
  

async function getBook(id){
    let res;
    try {
        let data = await fetch(`https://mchs.textbookx.com/institutional/tool.php?action=books&cid=${id}&page=undefined&jsonRequest=true`,optionsGetReq);
        let textData = await data.text();
        res = await JSON.parse(textData).course_data[id].books
    } catch (error) {
        console.log("Books Details API", error);
    }
    return res;
}

let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;

async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    console.log("CSV Creating...");
    await csv
      .toDisk(`./textbookx_${storeName}_${bookstoreId}.csv`, {
        append: true,
      })
      .then(console.log("Succesfully Data save into CSV"));
  }

  function waitRandom() {
    const min = 1000; // 1 second in milliseconds
    const max = 3000; // 3 seconds in milliseconds
    const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
  
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, randomTime);
    });
  }