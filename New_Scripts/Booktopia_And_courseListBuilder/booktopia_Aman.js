// Initialize an array to store the collected data
let collectedData = [];

let today = new Date();
let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;

// Load previously stored data from local storage
const storedData = localStorage.getItem('collectedData');
if (storedData) {
collectedData = JSON.parse(storedData);
}

function collectData() {
// Declare bookstoreid within the function
let bookstoreid = "3618";

const titleElements = document.querySelectorAll('a.title');
const salePriceElements = document.querySelectorAll('.sale-price');
const imgElements = document.querySelectorAll('img.loaded');
const authorsElements = document.querySelectorAll('.authors');
const depart = document.querySelectorAll('.course-results-header h2');

// Example values (you can replace these with actual values)
const storeid = "";
const storeDispName = "southern-cross-university-scu";
const termname = "Fall 2023";
const campusname = "southern-cross-university";
const deptCode = "";
const deptName = depart;
const instructorName = "";
const edition = "";
const isbn = "";
const bookRequired = "";
const publisherName = "";
const price = salePriceElements;
const store_url = "";

// Ensure that all arrays have the same length
const minLength = Math.min(
    titleElements.length,
);


// Iterate through the elements and push data to the array
for (let index = 0; index < minLength; index++) {
    const title = titleElements[index]?.textContent?.trim() || '';
    const dpt = depart[0]?.textContent?.trim() || '';
    const salePrice = salePriceElements[index]?.textContent?.trim() || '';
    const author = (authorsElements[index]?.textContent?.trim() || '').replace(/,/g, '');
    const imgSrc = imgElements[index]?.src || '';

    // Add your custom fields here
    const customFields = {
    bookstoreid,
    storeid,
    storenumber: "",
    storedisplayname: storeDispName,
    termname,
    campusname,
    department: deptCode,
    departmentname: dpt,
    coursename: "",
    section: "",
    sectionname: "",
    instructor: instructorName,
    schoolname: campusname,
    bookimage: imgSrc,
    title:title,
    edition,
    author:author,
    isbn,
    materialtype: "",
    requirementtype: bookRequired,
    publisher: publisherName,
    publishercode: "",
    copyrightyear: "",
    pricerangedisplay: salePrice,
    booklink: "",
    store_url,
    user_guid: "",
    course_codes: "",
    created_on: dateTime,
    last_updated_on: dateTime,
    file_code: ""
    };

    // Push data for each item as an object
    collectedData.push({ ...customFields });
}

// Save the collected data to local storage
localStorage.setItem('collectedData', JSON.stringify(collectedData));

// Log the collected data (optional)
console.log("Collected Data:", collectedData);

// Return bookstoreid for later use
return storeDispName;
}

function downloadCSV(storename) {
const headers = Object.keys(collectedData[0]);

// Create a CSV string from the collected data
const csvContent = [
    headers.join(","),
    ...collectedData.map(row => headers.map(header => row[header]).join(","))
].join("\n");

// Create a Blob and a link to trigger the download
const blob = new Blob([csvContent], { type: "text/csv" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);

// Set the filename for the download
link.download = `Booktopia_${storename}.csv`;

document.body.appendChild(link);
link.click();

// Remove the link from the document
document.body.removeChild(link);
}

// Example: Call collectData and pass the result to downloadCSV
const storename = collectData();
downloadCSV(storename);