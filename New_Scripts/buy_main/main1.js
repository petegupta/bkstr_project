import fetch from 'node-fetch'
import { parseString } from 'xml2js';
import cheerio  from 'cheerio';
export async function getXmlResponse(campusId,termId,bookstoreName) {
  const url = `https://bookstore.${bookstoreName}.edu/textbooks_xml.asp?control=campus&campus=${campusId}&term=${termId}`;
  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Host': `bookstore.${bookstoreName}.edu`,
    'Pragma': 'no-cache',
    'Referer': `https://bookstore.${bookstoreName}.edu/buy_courselisting.asp?`,
    'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (response.status === 200) {
      const responseBody = await response.text();
      return new Promise((resolve, reject) => {
      parseString(responseBody, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err);
          return;
        }
  
        // Extract department information from the parsed XML
        const departments = result.departments.department;
  
        // Create an array of objects with id and name properties
        const departmentArray = departments.map(department => ({
          id: department.$.id,
          name: department.$.name,
        }));
  
        // Print the array of department objects
        // console.log(departmentArray)
        resolve(departmentArray);
      });
    })
    } else {
      console.error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}



// https://bookstore.columbustech.edu/textbooks_xml.asp?control=department&dept=127&term=50&t=1697439381680

export async function getAllCourse(deptId,termId,bookstoreName){
    const url = `https://bookstore.columbustech.edu/textbooks_xml.asp?control=department&dept=${deptId}&term=${termId}`;
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': `bookstore.${bookstoreName}.edu`,
        'Pragma': 'no-cache',
        'Referer': `https://bookstore.${bookstoreName}.edu/buy_courselisting.asp?`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      };
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const responseBody = await response.text();
        // console.log(responseBody)
        return new Promise((resolve, reject) => {
        parseString(responseBody, (err, result) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return;
          }
    
          // Extract department information from the parsed XML
          const courses = result.courses.course;
    
          // Create an array of objects with id and name properties
          const courseArray = courses.map(course => ({
            id: course.$.id,
            name: course.$.name,
          }));
    
          resolve(courseArray);
        });
      })
      } else {
        console.error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}

// https://bookstore.columbustech.edu/textbooks_xml.asp?control=course&course=18577&term=50&t=1697441286152
export async function getAllSection(courseId,termId,bookstoreName){
    const url = `https://bookstore.${bookstoreName}.edu/textbooks_xml.asp?control=course&course=${courseId}&term=${termId}`;
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': `bookstore.${bookstoreName}.edu`,
        'Pragma': 'no-cache',
        'Referer': `https://bookstore.${bookstoreName}.edu/buy_courselisting.asp?`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      };
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const responseBody = await response.text();
        // console.log(responseBody)
        return new Promise((resolve, reject) => {
        parseString(responseBody, (err, result) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return;
          }
    
          // Extract department information from the parsed XML
          const sections = result.sections.section;
    
          // Create an array of objects with id and name properties
          const sectionArray = sections.map(section => ({
            id: section.$.id,
            name: section.$.name,
            instructor: section.$.instructor
          }));
    
          resolve(sectionArray);
        });
      })
      } else {
        console.error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}


// https://bookstore.columbustech.edu/textbooks_xml.asp?control=section&section=32531&t=1697442261609

export async function getBooks(sectionId,bookstoreName){
    const url = `https://bookstore.columbustech.edu/textbooks_xml.asp?control=section&section=${sectionId}`;
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': `bookstore.${bookstoreName}.edu`,
        'Pragma': 'no-cache',
        'Referer': `https://bookstore.${bookstoreName}.edu/buy_courselisting.asp?`,
        'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      };
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
  
      if (response.status === 200) {
        const responseBody = await response.text();
        // console.log(responseBody)
        const $ = cheerio.load(responseBody);

// Select the <tr> element
const bookTr = $('tr.book-container');
let booksData = [];
bookTr.each((i,book)=>{
    const bookDetails = {
        bookTitle: $(book).find('.book-title').text(),
        bookAuthor: $(book).find('.book-author').text(),
        isbn: $(book).find('.isbn').text(),
        bookPublisher: $(book).find('.book-publisher').text(),
        bookEdition: $(book).find('.book-edition').text(),
        bookReq: $(book).find('.book-req').text(),
        priceNew: $(book).find('td.price label[for="radio-New_1"]').text(),
      };
      booksData.push(bookDetails);
})

return booksData;
       
      } else {
        console.error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}