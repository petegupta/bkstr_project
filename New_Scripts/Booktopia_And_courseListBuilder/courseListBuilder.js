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

//values we need to insert
const bookStoreId = 3003;
const storeDispName = "Wayland University Store";;
const store_url = "https://bookstore.wbu.edu/booklist";
const schoolCampusName = "Wayland Baptist University";
const storeFileName = "wbu";
function collectData() {
    const courseDivs = document.querySelectorAll('div.course');

    courseDivs.forEach(courseDiv => {
        const h3Element = courseDiv.querySelector('h3');
        const [departmentName, courseName] = h3Element.textContent.trim().split(' ');
        const sectionName = courseDiv.querySelector('.section-badge').textContent.trim();
        const facultyName = courseDiv.querySelector('.instructor-badge').textContent.trim();
        const terms = courseDiv.querySelector('.term-and-campus').textContent.trim().split(' | ')[0];
        const requirementType = courseDiv.querySelector('.required-type').textContent.trim();
      
            // Add your custom fields here
        const customFields = {
            bookstoreid:bookStoreId,
            storeid:"",
            storenumber: "",
            storedisplayname: storeDispName,
            termname:terms,
            campusname:schoolCampusName,
            department: "",
            departmentname: departmentName,
            coursename: courseName,
            section: "",
            sectionname: sectionName,
            instructor: facultyName,
            schoolname: schoolCampusName,
            bookimage: "",
            title:departmentName,
            edition:"",
            author:"",
            isbn:"",
            materialtype: "",
            requirementtype: requirementType,
            publisher: "",
            publishercode: "",
            copyrightyear: "",
            pricerangedisplay: "",
            booklink: "",
            store_url,
            user_guid: "",
            course_codes: "",
            created_on: dateTime,
            last_updated_on: dateTime,
            file_code: ""
            };
      
        // Push the object to the main array
        collectedData.push({...customFields});
      });
      // Save the collected data to local storage
    localStorage.setItem('collectedData', JSON.stringify(collectedData));

    // Log the collected data (optional)
    console.log("Collected Data:", collectedData);
}
collectData();

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
    link.download = `courseListBuilder_${storename}.csv`;
    
    document.body.appendChild(link);
    link.click();
    
    // Remove the link from the document
    document.body.removeChild(link);
    }
    
downloadCSV(storeFileName);