const fs = require('fs');

// Specify the file to update
const fileName = 'data_csv/msstate_5.csv';

// Read the data from the file
let data = fs.readFileSync(fileName, 'utf-8');

// Split the data into lines
const lines = data.split('\n');

// Filter out empty lines
const nonEmptyLines = lines.filter(line => line.trim() !== '');

// Join the non-empty lines back together
data = nonEmptyLines.join('\n');

// Define the header row
const header = "bookrow_id,bookstoreid,termname,campusname,departmentname,coursename,sectionname,instructor,bookimage,title,edition,author,isbn,materialtype,requirementtype,publisher,copyrightyear,pricerangedisplay,booklink,user_guid,course_codes,created_on,last_updated_on,file_code,title_id";

// Prepend the header to the data
data = header + '\n' + data;

// Write the cleaned data with the header back to the same file
fs.writeFileSync(fileName, data, 'utf-8');

console.log('Header added, empty lines removed, and file updated.');