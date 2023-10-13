import cheerio from "cheerio";
import fetch from "node-fetch";

export default async function getBookDetails(storeName,sectionId){
    try {

      const url = `https://bookstore.${storeName}.edu/textbook_express.asp?mode=2&step=2`;

      const headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': `bookstore.${storeName}.edu`,
        'Origin': `https://bookstore.${storeName}.edu`,
        'Pragma': 'no-cache',
        'Referer': `https://bookstore.${storeName}.edu/buy_textbooks.asp?`,
        'Sec-Ch-Ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 with payload mode: 2',
      };

      const formData = {
        'generate-book-list': 'Get Your Books',
        sectionIds: sectionId,
      };

      // Encode form data into URL-encoded format
      const encodedFormData = new URLSearchParams(formData).toString();

      const resp = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: encodedFormData,
      })
      const htmlData =await  resp.text();
      const $ = cheerio.load(htmlData);
    // Select all <tr> elements with class 'book-container'
    const bookDetails = [];
    const bookContainers = $('.book-container'); // Use $ here, not dom
    bookContainers.each((index, bookContainer) => {
      // Extract specific information from the book container
      const title = $(bookContainer).find('.book-title').text();
      const author = $(bookContainer).find('.book-author').text();
      const isbn = $(bookContainer).find('.isbn').text();
      const edition = $(bookContainer).find('.book-edition').text();
      const publisher = $(bookContainer).find('.book-publisher').text();
      const price = $(bookContainer).find('.book-price-list').text();
  
      // Do something with the extracted data
      bookDetails.push({
        title,
        author,
        isbn,
        edition,
        publisher,
        price
      })
    });
    // console.log(bookDetails)
    return bookDetails
    } catch (error) {
      console.log(error);
    }
  }


