import  fetch from 'node-fetch';
import  { parseString } from 'xml2js';
import {fetchData} from './getTermId.js';
import ObjectsToCsv from "objects-to-csv";
import getBookDetails from './main1.js'

const storeName = "elac";
const bookstoreId = "3876";
const storeUrl = "https://bookstore.elac.edu/buy_textbooks.asp??"

var campusName;
var termName;
var deptName;
var courseName;
var instructorName ;
var sectionName;


var row = [];
async function getBookData() {
  waitRandom()
  const allCampusAndTerms = await fetchData(storeName); // Assuming fetchData returns a promise
  // console.log(allCampusAndTerms);
  // return
  for (let campTerm = 0; campTerm < allCampusAndTerms.length; campTerm++) {
    campusName = allCampusAndTerms[campTerm].campusName;
    termName = allCampusAndTerms[campTerm].termName;
    // console.log(allCampusAndTerms[campTerm].campusId, allCampusAndTerms[campTerm].termId)
    waitRandom();
    const allDep = await getDept(allCampusAndTerms[campTerm].campusId, allCampusAndTerms[campTerm].termId);
    // console.log(allDep)
    // return
    if(allDep == undefined) continue;
    if(allDep.length == 0){
      console.log("Dept == 0");
      continue;
    }
    for(let dept = 0;dept<allDep.length;dept++){
      deptName = allDep[dept].name;
      waitRandom()
      const allCourse = await getCourse(allDep[dept].id,allCampusAndTerms[campTerm].termId);
      // console.log(allCourse)
      // return
      if(allCourse == undefined) continue;
      if(allCourse.length == 0){
        console.log("Course == 0");
        continue;
      }
     
      for(let course = 0;course<allCourse.length;course++){
        courseName = allCourse[course].name;
        waitRandom()
        const getSections = await getSection(allCourse[course].id,allCampusAndTerms[campTerm].termId);
        if(getSections == undefined) continue;
        if(getSections.length == 0){
          console.log("Sec = 0");
          continue;
        }
        // console.log(getSections)
        // return
        for(let section = 0 ; section<getSections.length;section++){
          instructorName = getSections[section].instructor;
          sectionName = getSections[section].name;
          waitRandom()
          const bookData = await getBookDetails(storeName,getSections[section].id);
          if(bookData == undefined) continue;
          if(bookData.length == 0){
            console.log("books == 0");
            continue;
          }
          // return
          for(let book = 0;book<bookData.length;book++){
            console.log("Term ",termName," Dept ",deptName," Course ",courseName," section ",sectionName," book ",bookData[book].title)
            row.push({
              bookrow_id: "",
              bookstoreid: bookstoreId,
              storeid: "",
              storenumber:"", 
              storedisplayname: storeName,
              termname: termName,
              campusname: campusName,
              department: "",
              departmentname: deptName,
              coursename: courseName,
              section: "",
              sectionname: sectionName,
              instructor: instructorName,
              schoolname: campusName,
              bookimage: "",
              title: bookData[book].title,
              edition: bookData[book].edition,
              author: bookData[book].author,
              isbn: bookData[book].isbn,
              materialtype: "",
              requirementtype: "",
              publisher: bookData[book].publisher,
              publishercode: "",
              copyrightyear: "",
              pricerangedisplay: bookData[book].price,
              booklink: "",
              store_url: storeUrl,
              user_guid: "",
              course_codes: "",
              created_on: dateTime,
              last_updated_on: dateTime,
              file_code: ""
            })
            CsvWriter(row)
            row = [];

          }
         
          console.log("books done for this section moving to next section");
        }
        console.log("books done for this course moving to next course");
      }
      console.log("books done for this department moving to next department");
    }
    console.log("books done for this campus/term moving to next campus/term");
  }
}

getBookData();






const headers = {
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Host': `bookstore.${storeName}.edu`,
  'Pragma': 'no-cache',
  'Referer': `https://bookstore.${storeName}.edu/buy_textbooks.asp?`,
  'Sec-Ch-Ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

// Make the GET request
async function getDept(campusId, termId) {
  try {
    //https://www.uwwhitewaterbookstore.com/textbooks_xml.asp?control=campus&campus=5&term=245
    const response = await fetch(`https://bookstore.${storeName}.edu/textbooks_xml.asp?control=campus&campus=${campusId}&term=${termId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(`XML parsing error: ${err.message}`);
        }
        const departments = result.departments.department.map(department => ({
          id: department.$.id,
          abrev: department.$.abrev,
          name: department.$.name
        }));

        resolve(departments);
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
async function getCourse(deptId, termId) {
  try {
    const response = await fetch(`https://bookstore.${storeName}.edu/textbooks_xml.asp?control=department&dept=${deptId}&term=${termId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(`XML parsing error: ${err.message}`);
        }
        const coursesArray = result.courses.course.map(course => ({
          id: course.$.id,
          name: course.$.name,
        }));

        resolve(coursesArray);
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}
async function getSection(courseId, termId) {
  try {
    const response = await fetch(`https://bookstore.${storeName}.edu/textbooks_xml.asp?control=course&course=${courseId}&term=${termId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();

    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(`XML parsing error: ${err.message}`);
        }
        const sectionsArray = result.sections.section.map(section => ({
          id: section.$.id,
          name: section.$.name,
          instructor: section.$.instructor
        }));

        resolve(sectionsArray);
      });
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
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
      .toDisk(`./buy_textbooks_${storeName}_${bookstoreId}.csv`, {
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