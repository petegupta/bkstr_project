import fetch from 'node-fetch'
import ObjectsToCsv from "objects-to-csv";

const storeName = "messiah";
const bookstoreId = "3240";
const campusName = "Messiah University Campus Store";
const termCodeList = [
{
    name:"2023 FAll MES Graduate Program",
    termcode:"1000000009054"
},
{
    name:"2023 FAll MES Under-Graduate Program",
    termcode:"1000000009051"
}
];
const urlCode = "42";
var storeUrl = `https://${storeName}.slingshotedu.com/#/buy-books`
var termName;
var deptName;   
var courseName;
var courseCode;
var sectionCode;
var sectionName;
var isRequired;
var bookImg;
var author;
var edition;
var isbn;
var title;
var price;

var row = [];
async function getBookData(){
    for(let term=0;term<termCodeList.length;term++){
        termName = termCodeList[term].name;
        const allDept = await makeGetRequest(termCodeList[term].termcode);
        if(allDept.length == 0){
            console.log("dept = 0")
            continue
        }
        for(let dept = 0;dept<allDept.length;dept++){
            deptName = await allDept[dept].displayName;
            const allCourse = await getCourse(allDept[dept].id);
            // console.log(allCourse)
            if(allCourse.length == 0){
                console.log("course = 0")
                continue
            }
            for(let course =0;course<allCourse.length;course++){
                courseName = allCourse[course].name;
                courseCode = allCourse[course].code;
                const allSection = await getSection(allCourse[course].id);
                if(allSection.length == 0){
                    console.log("section = 0")
                    continue
                }
                for(let section =0;section<allSection.length;section++){
                  sectionCode = allSection[section].code;
                  sectionName = allSection[section].displayName;
                  const allBook = await getBooks(allSection[section].id);
                  if(allBook.length == 0){
                    console.log("books =0")
                    continue;
                  }
                  for(let book =0;book<allBook.length;book++){
                    console.log(termName," ",term," ",deptName," ",dept," ",courseName," ",course," ",sectionName," ",section," book ",book);
                    isRequired = allBook[book].required;
                    bookImg = allBook[book]?.title?.imageUrl;
                    author = allBook[book]?.title?.author;
                    edition = allBook[book]?.title?.edition;
                    isbn = allBook[book]?.title?.isbn;
                    title = allBook[book]?.title?.title;
                    price = allBook[book]?.title?.price?.listPrice;

                    row.push({
                        bookrow_id: "",
                        bookstoreid: bookstoreId,
                        termname: "spring-24",
                        campusname: campusName,
                        departmentname: deptName,
                        coursename: courseName,
                        sectionname: sectionName,
                        instructor: "",
                        bookimage: "",
                        title: title,
                        edition: edition,
                        author: author,
                        isbn: isbn,
                        materialtype: "",
                        requirementtype: isRequired,
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
                    CsvWriter(row)
                    row = [];
                  }
                  console.log("All books done for this section moving to next section")
                }
                console.log("All books done for this course moving to next course")
              }
              console.log("All books done for this dept moving to next dept")
            }
            console.log("All books done for this term moving to next term")
    }
    console.log("Collected all data successfully");
}

getBookData()


async function makeGetRequest(termId) {
  const url = `https://rest.slingshotedu.com/app-rest/portal/v1/${urlCode}/catalog/department?termId=${termId}`;
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Origin': `https://${storeName}.slingshotedu.com`,
    'Pragma': 'no-cache',
    'Referer': `https://${storeName}.slingshotedu.com/`,
    'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
  };
  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (response.status === 200) {
      const data = await response.json();
      // Process the data as needed
      return data?.results
    } else {
        console.error('Request failed with status:', response.status);
        return []
    }
  } catch (error) {
      console.error('Error:', error.message);
      return []
  }
}

async function getCourse(deptId){
    const url = `https://rest.slingshotedu.com/app-rest/portal/v1/${urlCode}/catalog/course?departmentId=${deptId}`
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': `https://${storeName}.slingshotedu.com`,
        'Pragma': 'no-cache',
        'Referer': `https://${storeName}.slingshotedu.com/`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      };
      try {
        const response = await fetch(url, { method: 'GET', headers });
        if (response.status === 200) {
          const data = await response.json();
          // Process the data as needed
          return data?.results
        } else {
            console.error('Request failed with status:', response.status);
            return []
        }
      } catch (error) {
          console.error('Error:', error.message);
          return []
      }
}
async function getSection(courseId){
    const url = `https://rest.slingshotedu.com/app-rest/portal/v1/${urlCode}/catalog/section?courseId=${courseId}`
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': `https://${storeName}.slingshotedu.com`,
        'Pragma': 'no-cache',
        'Referer': `https://${storeName}.slingshotedu.com/`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      };
      try {
        const response = await fetch(url, { method: 'GET', headers });
        if (response.status === 200) {
          const data = await response.json();
          // Process the data as needed
          return data?.results
        } else {
            console.error('Request failed with status:', response.status);
            return []
        }
      } catch (error) {
          console.error('Error:', error.message);
          return []
      }
}
async function getBooks(sectionId){
    const url = `https://rest.slingshotedu.com/app-rest/portal/v1/${urlCode}/catalog/listing?sectionId=${sectionId}`
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': `https://${storeName}.slingshotedu.com`,
        'Pragma': 'no-cache',
        'Referer': `https://${storeName}.slingshotedu.com/`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      };
      try {
        const response = await fetch(url, { method: 'GET', headers });
        if (response.status === 200) {
          const data = await response.json();
          // Process the data as needed
          return data?.results
        } else {
            console.error('Request failed with status:', response.status);
            return []
        }
      } catch (error) {
          console.error('Error:', error.message);
          return []
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
      .toDisk(`./buy_book_${storeName}_${bookstoreId}.csv`, {
        append: true,
      })
      .then(console.log("Succesfully Data save into CSV"));
  }