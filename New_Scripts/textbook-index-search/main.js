import fetch  from 'node-fetch'
import cheerio from 'cheerio'
import ObjectsToCsv from "objects-to-csv";
const storeName = "ivccbookstore"
const bookstoreId = "3719"
const campusName = "Illinois Valley Community College"
const storeUrl = `https://www.${storeName}.com/textbook/index/search`;

var termName;
var deptName;
var deptCode;
var courseName;
var courseCode;
var sectionCode; 
var sectionName; 
var instructorName;
var bookRequired; 
var bookImg; 
var bookTitle; 
var author;
var publisher; 
var ISBN; 
var isRequired; 
var price; 
var row = [];
async function getBookData(){
    const allTerm = await makeGETRequest();
    if(allTerm == undefined){
        console.log("term = 0")
    }
    for(let term = 0;term<allTerm.length;term++){
        termName = allTerm[term].termName; 
        const allDept = await getDept(`https://www.ivccbookstore.com/rest/V1/resero/get_department?term_id=${allTerm[term].termId}`);
        if(allDept == undefined){
            console.log("dept = 0");
            continue
        }
        // console.log(allDept)
        for(let dept = 0;dept<allDept.length;dept++){
            deptName = allDept[dept].name;
            deptCode = allDept[dept].code;
            const allCourse = await getCourse(`https://www.ivccbookstore.com/rest/V1/resero/get_course?department_id=${allDept[dept]["@attributes"]["ref"]}`)
            if(allCourse == undefined){
                console.log("course = 0")
                continue
            }
            // console.log(allCourse);
            for(let course = 0;course<allCourse.length;course++){
                courseName = allCourse[course].name;
                courseCode = allCourse[course].code;
                const allSection = await getSection(`https://www.ivccbookstore.com/rest/V1/resero/get_section?course_id=${allCourse[course]["@attributes"]["ref"]}`)
                if(allSection == undefined){
                    console.log("section = 0");
                    continue
                }
                // console.log(allSection);
                for(let section = 0;section<allSection.length;section++){
                    sectionCode = allSection[section].code;
                    sectionName = allSection[section].name;
                    instructorName = allSection[section].instructor["@attributes"]["name"];
                    bookRequired = allSection[section].booksRequired;
                    const allBooks = await getBooks(`https://www.ivccbookstore.com/textbook/index/books?section_code=${allSection[section]["@attributes"]["ref"]}`)
                    // const allBooks = await getBooks(`https://www.ivccbookstore.com/textbook/index/books?section_code=10069093`)
                    console.log(termName," ",term," ",deptName," ",dept," ",courseName," ",course," ",sectionName," ",section," collecting books");
                    if(allBooks == undefined || allBooks.length == 0){
                        console.log("books = 0");
                        continue
                    }
                    for(let book = 0;book<allBooks.length;book){
                        bookImg = allBooks[book].imgUrl;
                        bookTitle = allBooks[book].title;
                        author = allBooks[book].author;
                        publisher = allBooks[book].publisher;
                        ISBN = allBooks[book].ISBN;
                        isRequired = allBooks[book].status;
                        price = allBooks[book].price;

                        row.push({
                            bookrow_id: "",
                            bookstoreid: bookstoreId,
                            storeid: "",
                            storenumber:"", 
                            storedisplayname: storeName,
                            termname: termName,
                            campusname: campusName,
                            department: deptCode,
                            departmentname: deptName,
                            coursename: courseName,
                            section: sectionCode,
                            sectionname: sectionName,
                            instructor: instructorName,
                            schoolname: campusName,
                            bookimage: bookImg,
                            title: bookTitle,
                            edition: "",
                            author: author,
                            isbn: ISBN,
                            materialtype: "",
                            requirementtype: isRequired,
                            publisher: publisher,
                            publishercode: "",
                            copyrightyear: "",
                            pricerangedisplay: price,
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
                    console.log("all books done for this section moving to next section");
                }
                console.log("all books course for this course moving to next section");
            }
            console.log("all dept course for this dept moving to next section");
        }
        console.log("all term course for this term moving to next section");

    }
    console.log("All data collected successfully")
    
}

getBookData()

async function makeGETRequest() {
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
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
    const response = await fetch(storeUrl, {
      method: 'GET',
      headers: headers,
    });

    if (response.status === 200) {
      const htmlContent = await response.text();
      // Handle the HTML content as needed
      const $ = cheerio.load(htmlContent);

      const termOptions = [];
      $('#term option').each((index, element) => {
        const value = $(element).attr('value');
        const text = $(element).text().trim();
    
        if (value !== '-1') { // Exclude the "Please select" option
          termOptions.push({ termId: value, termName: text });
        }
      });
      return termOptions;
    } else {
      console.error('Request did not return a 200 status code.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


async function getDept(url) {
    // const url = 'https://www.ivccbookstore.com/rest/V1/resero/get_department?term_id=10000216&_=1697620633542';
    
    const headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
      'Cookie': 'PHPSESSID=qn6uuiib1d4mddfg02du1749ig; X-Magento-Vary=f242363fc53fc23b271c46423967cc55f6c2878e; form_key=nNmJFogrAeN8ock8; mage-cache-storage=%7B%7D; mage-cache-storage-section-invalidation=%7B%7D; mage-cache-sessid=true; mage-messages=; recently_viewed_product=%7B%7D; recently_compared_product=%7B%7D; recently_compared_product_previous=%7B%7D; product_data_storage=%7B%7D; form_key=nNmJFogrAeN8ock8; section_data_ids=%7B%22cart%22%3A1697620634%7D',
      'Pragma': 'no-cache',
    //   'Referer': 'https://www.ivccbookstore.com/textbook/index/search/',
      'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    };
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const jsonData = await response.json();
        // Handle the JSON data as needed
        const data = await JSON.parse(jsonData);
        return data
      } else {
        console.error('Request did not return a 200 status code.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
async function getCourse(url) {
    // const url = 'https://www.ivccbookstore.com/rest/V1/resero/get_department?term_id=10000216&_=1697620633542';
    
    const headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
      'Pragma': 'no-cache',
    //   'Referer': 'https://www.ivccbookstore.com/textbook/index/search/',
      'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    };
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const jsonData = await response.json();
        // Handle the JSON data as needed
        const data = await JSON.parse(jsonData);
        return data
      } else {
        console.error('Request did not return a 200 status code.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
async function getSection(url) {
    // const url = 'https://www.ivccbookstore.com/rest/V1/resero/get_department?term_id=10000216&_=1697620633542';
    
    const headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
      'Pragma': 'no-cache',
    //   'Referer': 'https://www.ivccbookstore.com/textbook/index/search/',
      'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    };
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const jsonData = await response.json();
        // Handle the JSON data as needed
        const data = await JSON.parse(jsonData);
        return data
      } else {
        console.error('Request did not return a 200 status code.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
async function getBooks(url) {
    // const url = 'https://www.ivccbookstore.com/rest/V1/resero/get_department?term_id=10000216&_=1697620633542';
    
    const headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
      'Pragma': 'no-cache',
    //   'Referer': 'https://www.ivccbookstore.com/textbook/index/search/',
      'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    };
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const data =await response.text();
        // console.log(data)
        const $ = cheerio.load(data);
  const bookContainers = $('.book-container');

  const bookDataArray = [];

  bookContainers.each((index, element) => {
    const bookContainer = $(element);
    const bookImage = bookContainer.find('.book-image');
    const imgUrl = bookImage.attr('src');
    const title = bookContainer.find('.book-title').text().trim();
    const author = bookContainer.find('.book-detail-left span:contains("Author(s):")').text().replace('Author(s):', '').trim();
    const publisher = bookContainer.find('.book-detail-left span:contains("Publisher:")').text().replace('Publisher:', '').trim();
    const ISBN = bookContainer.find('.book-detail-left span:contains("ISBN-13:")').text().replace('ISBN-13:', '').trim();
    const status = bookContainer.find('.book-detail-left span:contains("Status:")').text().replace('Status:', '').trim();
    const price = bookContainer.find('.book-price-right').text().trim();

    const bookData = {
      imgUrl,
      title,
      author,
      publisher,
      ISBN,
      status,
      price,
    };

    bookDataArray.push(bookData);
    return bookDataArray
  });

  return bookDataArray;
      } else {
        console.error('Request did not return a 200 status code.');
      }
    } catch (error) {
      console.error('Error:', error);
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