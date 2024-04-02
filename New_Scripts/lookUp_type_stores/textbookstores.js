// stores with url : https://bookstore.sautech.edu/textbooks

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import ObjectsToCsv from "objects-to-csv";

const headers = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US, en; q=0.9",
    "Content-Type": "application/json",
    Connection: "keep-alive",
};

var row = [];
// enter the info here
var bookstoreid ="";
var storeid ="";
var storeName = "sautech";
var storeDispName ="Southern Arkansas University Tech Bookstore";
var termname = "Fall 2023";
var campusname = "Southern Arkansas University Tech	Community College";
var storeurl = "https://bookstore.sautech.edu/textbooks";
let id = 766;


var deptCode ;
var deptName ;
var courseCode ;
var courseName ;
var sectionData ;
var instructorName ;
var bookRequired ;
var bookImg ;
var bookName ;
var publisherName ;
var publisherCode ;
var author ;
var edition ;
var price ;
var pubDate ;
var isbn ;

async function getBookData(){
    const url = `https://api.studentstore.com/webcomm-rest/catalog/departments?term-id=${id}`
    const allDepartments = await getDataFromAPI(url);
    if(allDepartments.length == 0) return "Departments = 0"
    for(let dept = 0 ; dept<allDepartments.length;dept++){
        deptCode = allDepartments[dept].code ? allDepartments[dept].code : "";
        deptName = allDepartments[dept].name ? allDepartments[dept].name : "";
        await waitRandom();
        const allCourses =await getDataFromAPI(allDepartments[dept].coursesUrl)
        if(allCourses.length == 0) {
            console.log("Course = 0");
            continue;
        }
        for(let course = 0 ; course<allCourses.length;course++){
            courseCode = allCourses[course].code ? allCourses[course].code : "";
            courseName = allCourses[course].name ? allCourses[course].name : "";
            await waitRandom();
            const allSection = await getDataFromAPI(allCourses[course].sectionsUrl);
            if(allSection.length == 0){
                console.log("Section = 0")
                continue;
            }
            for(let section = 0 ;section<allSection.length;section++){
                instructorName = allSection[section].instructorName ? allSection[section].instructorName : "";
                sectionData = allSection[section].code ? allSection[section].code : "";
                await waitRandom();
                console.log("Dept : ",dept , deptName ," Course : ",course, courseName," Section : ",section, sectionData);
                console.log("Now collecting books for this section !");
                const allBooks = await getDataFromAPI(allSection[section].adoptionsUrl);
                if(allBooks.length == 0){
                    console.log("Books length = ",allBooks.length)
                    continue;
                }
                for(let books = 0;books<allBooks.length ; books++){
                    bookImg = allBooks[books].imageUrl ? allBooks[books].imageUrl : "";
                    bookName =  allBooks[books].name ? allBooks[books].name : "";
                    bookRequired = allBooks[books].requiredStatus ? allBooks[books].requiredStatus : "";
                    publisherName = allBooks[books].publisher ? allBooks[books].publisher : "";
                    author = allBooks[books].author ? allBooks[books].author : "";
                    edition = allBooks[books].edition ? allBooks[books].edition : "";
                    price = allBooks[books].eBookOptionsAvailableFrom ? allBooks[books].eBookOptionsAvailableFrom : "";
                    isbn = allBooks[books].productCode ? allBooks[books].productCode : "";
                    pubDate = allBooks[books].pubDate ? allBooks[books].pubDate : "";
                    row.push({
                        bookrow_id:"",
                        bookstoreid:bookstoreid,
                        termname:termname,
                        campusname:campusname,
                        departmentname:deptName,
                        coursename:courseName,
                        sectionname:"",
                        instructor:instructorName,
                        bookimage:bookImg,
                        title:bookName,
                        edition:edition,
                        author:author,
                        isbn:isbn,
                        materialtype:"",
                        requirementtype:bookRequired,
                        publisher:publisherName,
                        copyrightyear:pubDate,
                        pricerangedisplay:price,
                        booklink:allSection[section].adoptionsUrl,
                        user_guid:"",
                        course_codes:"",
                        created_on:dateTime,
                        last_updated_on:dateTime,
                        file_code:"",
                        title_id:"",
                    })
                    CsvWriter(row)
                    row = [];

                }

                
            }
            
        }
       
    }
    console.log("All data is collected!")
}

getBookData()





async function getDataFromAPI(url) {
    let res;
    try {
      let str = await fetch(
        url,
        {
          method: "GET",
          mode: "cors",
          headers: headers,
        }
      );
      str = await str.text();
      res = JSON.parse(str);

    } catch (error) {
      console.log("Books Details API", error);
    }
    return res;
  }


  async function CsvWriter(row) {
    const csv = new ObjectsToCsv(row);
    console.log("CSV Creating...");
    await csv
      .toDisk(`./lookUpTypeData/testbookStores_${storeName}_des01.csv`, {
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
