import fetch from 'node-fetch'
import cheerio from 'cheerio'
import {getXmlResponse,getAllCourse,getAllSection,getBooks} from './main1.js'
import ObjectsToCsv from "objects-to-csv";

const bookstoreName = "msun";
const bookstoreId = "2879";

var campusName;
var termName;
var deptName;
var sectionName;
var courseName
var instructorName;
var bookTitle;
var bookAuthor;
var isbn;
var bookPublisher;
var bookEdition;
var bookReq;
var priceNew;
var storeUrl = `https://bookstore.${bookstoreName}.edu/buy_main.asp`
var row = [];
async function getBookData(){
    const { csrfToken, termOptions } = await getCampusTerm(bookstoreName);
    if(termOptions==undefined || termOptions == 0){
        console.log("terms = 0");
    }
    for(let term=10;term<termOptions.length;term++){
        campusName = termOptions[term].campusName;
        termName = termOptions[term].termName;
        const allDept =await getXmlResponse(termOptions[term].campusId,termOptions[term].termId,bookstoreName)
        if(allDept == undefined || allDept ==0){
            console.log("dept =0");
            continue;
        }
        for(let dept =0;dept<allDept.length;dept++){
            deptName = allDept[dept].name;
            const allCourse = await getAllCourse(allDept[dept].id,termOptions[term].termId,bookstoreName)
            if(allCourse == undefined || allCourse ==0){
                console.log("course =0");
                continue;
            }
            for(let course = 0;course<allCourse.length;course++){
                courseName = allCourse[course].name;
                const allSection = await getAllSection(allCourse[course].id,termOptions[term].termId,bookstoreName)
                if(allSection == undefined || allSection ==0){
                    console.log("section =0");
                    continue;
                }
                for(let section = 0;section<allSection.length;section++){
                    instructorName = allSection[section].instructor;
                    sectionName = allSection[section].name;
                    for(let book = 0;book<allSection.length;book++){
                        const allBooks = await getBooks(allSection[section].id,bookstoreName);
                        if(allBooks == undefined || allBooks ==0){
                            console.log("book =0");
                            continue;
                        }
                        for(let bkDetail = 0;bkDetail<allBooks.length;bkDetail++){
                            console.log(termName," ",term," ",deptName," ",dept," ",courseName," ",course," ",sectionName," ",section," book",bkDetail)
                            bookTitle = allBooks[bkDetail].bookTitle;
                            bookAuthor = allBooks[bkDetail].bookAuthor;
                            bookEdition = allBooks[bkDetail].bookEdition
                            isbn = allBooks[bkDetail].isbn;
                            bookPublisher = allBooks[bkDetail].bookPublisher;
                            bookReq = allBooks[bkDetail].bookReq;
                            priceNew = allBooks[bkDetail].priceNew;
                            row.push({
                                bookrow_id: "",
                                bookstoreid: bookstoreId,
                                termname: "spring-24",
                                campusname: campusName,
                                departmentname: deptName,
                                coursename: courseName,
                                sectionname: sectionName,
                                instructor: instructorName,
                                bookimage: "",
                                title: bookTitle,
                                edition: bookEdition,
                                author: bookAuthor,
                                isbn: isbn,
                                materialtype: "",
                                requirementtype: bookReq,
                                publisher: bookPublisher,
                                copyrightyear: "",
                                pricerangedisplay: priceNew,
                                booklink: "",
                                user_guid: "",
                                course_codes: "",
                                created_on: dateTime,
                                last_updated_on: dateTime,
                                file_code: "",
                                title_id: "",
                            })
                            CsvWriter(row);
                            row = [];
                        }
                    }
                    console.log("all books done for",sectionName, "this section moving to new section")
                }
                console.log("all sections done for this",courseName ,"course moving to next course");
            }
            console.log("all course done for this", deptName,"dept moving to next dept");
        }
        console.log("all dept done for this", termName,"term moving to next term");
        
    }
    console.log("All data collected successfully");
}

getBookData()




async function getCampusTerm(bookstoreName){
    const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': `bookstore.${bookstoreName}.edu`,
        'Pragma': 'no-cache',
        'Referer': `https://bookstore.${bookstoreName}.edu/buy_main.asp?`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      };
  
    try {
      const response = await fetch(`https://bookstore.${bookstoreName}.edu/buy_main.asp`, { method: 'GET', headers });
      const html = await response.text();
      const $ = cheerio.load(html);
  
      const csrfToken = $('#__CSRFToken').attr('value');
  
      const termOptions = $('#fTerm option').toArray().map(option => {
        const value = $(option).attr('value').split('|');
        const termId = value[1];
        const campusId = value[0];
        const input1 = $(option).text();
        const parts1 = input1.split(' - ');
        let campusName;
        let termName;
        if (parts1.length === 2) {
            campusName = parts1[0];
            termName = parts1[1];
          }
        return { campusId, termId, termName ,campusName};
      });
  
      return { csrfToken, termOptions };
    } catch (error) {
      throw new Error('Error fetching campus terms: ' + error.message);
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
      .toDisk(`./buy_main_${bookstoreName}_${bookstoreId}.csv`, {
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