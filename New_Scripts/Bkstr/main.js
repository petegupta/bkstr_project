import fetch from "node-fetch";
import * as fs from "fs";
// Define "require"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// json to csv modules
const csvToJsonData = require("csvtojson");
const jsonToCsvData = require("json2csv").parse;
//stcloudstatestore	9
const storeNames = ["stcloudstatestore"]; // Enter your store name here which you want to scrape and go to line 83
var storeUrl = `https://www.bkstr.com/${storeNames}/home`
const bookstoreID = "9";
var storeIdHere ;
const currentDate = new Date();
const createdOn = currentDate.toISOString();
const fetchData = async () => {
  try {
    for (let i = 0; i < storeNames.length; i++) {
      let storeName = storeNames[i];
      let strId = await getStore(storeName);
      await waitRandomTime();
      let storeId = strId.storeId;
      let J = 0;
      if (typeof storeId == "undefined") {
        console.log("blocked");
        process.exit(0);
      }
      console.log(storeId);
      let term_id = await getTerm(storeId);
      await waitRandomTime();
      for (let j = 0; j < term_id.length; j++) {
        console.log(term_id[j]);
        let termId = term_id[j].termId;
        let programId = term_id[j].programId;
        if (typeof termId == "undefined") {
          console.log("blocked");
          process.exit(0);
        }
        if (isNaN(termId)) {
          console.log("no data");
        } else {
          let fullData = [];
          let k = 0;
          let depName;
          let courseName;
          let div = await getDepartment(storeId, termId, storeName);
          await waitRandomTime();
          for (let c = 0; c < div.length; c++) {
            let department = div[c].department;
            if (typeof department == "undefined") {
              console.log("blocked");
              process.exit(0);
            }
            var depFile = JSON.stringify(department);
            fs.writeFile(
              "./bkstr_deps/bkstr_" +
                storeName.split(" ").join("") +
                "_" +
                storeId.split(" ").join("") +
                "_" +
                termId.split(" ").join("") +
                "_department.json",
              depFile,
              function (err) {
                if (err) throw err;
                console.log("Department Saved");
              }
            );
            // let l = 0;
            for (let m = 0; m < department.length; m++) {
              depName = department[m].depName;
              let courses = department[m].course;
              for (let n = 0; n < courses.length; n++) {
                courseName = courses[n].courseName;
                let sections = courses[n].section;
                for (let a = 0; a < sections.length; a++) {
                  let section = sections[a].sectionName;
                  let course = {
                    secondaryvalues: depName + "/" + courseName + "/" + section,
                    divisionDisplayName: "",
                    departmentDisplayName: depName,
                    courseDisplayName: courseName,
                    sectionDisplayName: section,
                  };
                  if (k < 28) {
                    fullData.push(course);
                    k++;
                  } else {
                    J++;
                    // First go to the bkstr folder and check the last modified file number at the last of the file name and accordingly set the value of in line 83 (J > value) and uncomment the line 83 and 100 do this only when blocked else keep 83 and 100 lines commented
                    //if (J > 74) {
                      try {
                        // get and store course data
                        console.log("IN Store Data Function");
                        await storeData(
                          storeName,
                          storeId,
                          termId,
                          programId,
                          depName,
                          courseName,
                          J,
                          fullData
                        );
                      } catch (err) {
                        console.log(err);
                      }
                    //}
                    k = 0;
                    fullData = [];
                  }
                }
              }
            }
          }
          if (k > 0) {
            J++;
            console.log("IN Store Data Function");
            await storeData(
              storeName,
              storeId,
              termId,
              programId,
              depName,
              courseName,
              J,
              fullData
            );
            await waitRandomTime();
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

fetchData();
//get storeId from link of arrays.
async function getStore(storeName) {
  const str = await fetch(
    `https://svc.bkstr.com/store/config?storeName=${storeName}`,
    {
      method: "GET",
      mode: "cors",
      headers: getHeaderString(),
    }
  );

  const ret = await str.json();
  return ret;
}

//get termId and programId from storeId
async function getTerm(storeId) {
  //https://svc.bkstr.com/courseMaterial/info?storeId=166904
  const str = await fetch(
    `https://svc.bkstr.com/courseMaterial/info?storeId=${storeId}`,
    {
      method: "GET",
      mode: "cors",
      headers: getHeaderString(),
    }
  );
  const ret = await str.json();
  var termData = [];
  console.log("term id and program id");
  let camp = ret.finalData?.campus;
  if (!camp || typeof camp == "undefined") {
    console.log("no campus or you are blocked");
    process.exit(0);
  } else {
    camp.forEach(function (val, index) {
      let campusId = val.campusId;
      val.program.forEach(function (val2, index2) {
        val.program[index2].term.forEach(function (val3, index3) {
          let termId = val3.termId;
          let programId = val.program[index2].programId;
          termData.push({ campusId, termId, programId });
        });
      });
    });
    // console.log(termData);
    return termData;
  }
}

async function getDepartment(storeId, termId) {
  //https://svc.bkstr.com/courseMaterial/courses?storeId=166904&termId=100070759
  const d = await fetch(
    `https://svc.bkstr.com/courseMaterial/courses?storeId=${storeId}&termId=${termId}`,
    {
      method: "GET",
      mode: "cors",
      headers: getHeaderString(),
    }
  );
  const ret = await d.json();
  console.log("dpartment");
  // console.log(ret.finalDDCSData?.division[0]?.department);
  let dep = ret.finalDDCSData?.division[0]?.department;
  let div = [];
  ret.finalDDCSData?.division.forEach(function (val, ind) {
    div[ind] = val;
  });
  console.log(div);
  // console.log(dep);
  return div;
}

async function getCourses(storeId, termId, programId, fullData, J) {
  const rest = await fetch(
    `https://svc.bkstr.com/courseMaterial/results?storeId=${storeId}&langId=-1&requestType=DDCSBrowse`,
    {
      method: "POST",
      headers: getHeaderString(),
      body:
        '{"storeId":' +
        storeId +
        ',"termId":' +
        termId +
        ',"programId":' +
        programId +
        ',"courses":' +
        fullData +
        "}",
    }
  );
  const ret = await rest.json();
  return ret;
}


async function storeData(
  storeName,
  storeId,
  termId,
  programId,
  depName,
  courseName,
  J,
  fullData
) {
  console.log(
    "Sending 20-data of ",
    storeName,
    ", ",
    storeId,
    ", ",
    termId,
    ", ",
    depName,
    ", ",
    courseName,
    " and section send to get course and book details."
  );
  //console.log('fullData',fullData);
  const newData = JSON.stringify(fullData);
  let store_data = await getCourses(storeId, termId, programId, newData, J);
  // console.log('course details and books of given data.', store_data);
  // let storeId = trim(storeId);
  const data = JSON.stringify(store_data);
  let cmdata = store_data;
  if (cmdata.blockScript) {
    console.log("you are blocked");
    process.exit(0);
  }
  
  fs.writeFile(
    "./bkstr/bkstr_" +
      storeName
        .split(" ")
        .join("")
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "") +
      "_" +
      storeId
        .split(" ")
        .join("")
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "") +
      "_" +
      termId
        .split(" ")
        .join("")
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "") +
      "_" +
      depName
        .split(" ")
        .join("")
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "") +
      "_" +
      courseName
        .split(" ")
        .join("")
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "") +
      "_" +
      J +
      ".json",
    data,
    function (err) {
      if (err) {
        console.log(err);
      }
      console.log("storeData Saved");
      // wait();
    }
  );
  if (!cmdata || cmdata.length < 1) {
    console.log("course is empty");
  } else {
    csvToJsonData()
      .fromFile("./csv/bkstr.csv")
      .then(async (source) => {
        let source2 = [];
        for (let i = 0; i < cmdata.length; i++) {
          const row = getBlankRow();
          row["storeid"] = cmdata[i].storeId;
          row["storenumber"] = cmdata[i].storeNumber;
          row["storedisplayname"] = cmdata[i].storeDisplayName;
          row["created_on"] = createdOn;
          storeIdHere = cmdata[i].storeId
          if (!cmdata[i].courseSectionDTO) {
            source.push(row);
            source2.push(row);
          } else {
            let courseSection = cmdata[i].courseSectionDTO;
            for (let j = 0; j < courseSection.length; j++) {
              const row1 = getBlankRow();
              row1["storeid"] = cmdata[i].storeId;
              storeIdHere = cmdata[i].storeId
              row1["storenumber"] = cmdata[i].storeNumber;
              row1["storedisplayname"] = cmdata[i].storeDisplayName;
              row1["termname"] = "spring-24";
              row1["campusname"] = courseSection[j].campusName;
              row1["department"] = courseSection[j].department;
              row1["departmentname"] = courseSection[j].departmentName;
              row1["coursename"] = courseSection[j].courseName;
              row1["section"] = courseSection[j].section;
              row1["sectionname"] = courseSection[j].sectionName;
              row1["instructor"] = courseSection[j].instructor;
              row1["schoolname"] = courseSection[j].institutionName;
              row1["store_url"] = storeUrl;
              row1["bookstoreid"] = bookstoreID;
              row1["created_on"] = createdOn;
              if (!courseSection[j].courseMaterialResultsList) {
                source.push(row1);
                source2.push(row1);
              } else {
                let courseMaterialResults =
                  courseSection[j].courseMaterialResultsList;
                for (let k = 0; k < courseMaterialResults.length; k++) {
                  const row2 = getBlankRow();
                  row2["storeid"] = cmdata[i].storeId;
                  storeIdHere = cmdata[i].storeId
                  row2["storenumber"] = cmdata[i].storeNumber;
                  row2["storedisplayname"] = cmdata[i].storeDisplayName;
                  row2["termname"] = "spring-24";
                  row2["campusname"] = courseSection[j].campusName;
                  row2["department"] = courseSection[j].department;
                  row2["departmentname"] = courseSection[j].departmentName;
                  row2["coursename"] = courseSection[j].courseName;
                  row2["section"] = courseSection[j].section;
                  row2["sectionname"] = courseSection[j].sectionName;
                  row2["instructor"] = courseSection[j].instructor;
                  row2["schoolname"] = courseSection[j].institutionName;
                  row2["bookimage"] = courseMaterialResults[k].bookImage;
                  row2["title"] = courseMaterialResults[k].title;
                  row2["edition"] = courseMaterialResults[k].edition;
                  row2["author"] = courseMaterialResults[k].author;
                  row2["isbn"] = courseMaterialResults[k].isbn;
                  row2["materialtype"] = courseMaterialResults[k].materialType;
                  row2["requirementtype"] =
                    courseMaterialResults[k].requirementType;
                  row2["publisher"] = courseMaterialResults[k].publisher;
                  row2["publishercode"] =
                    courseMaterialResults[k].publisherCode;
                  row2["copyrightyear"] =
                    courseMaterialResults[k].copyRightYear || "";
                  row2["pricerangedisplay"] =
                    courseMaterialResults[k].priceRangeDisplay;
                  row2["store_url"] = storeUrl;
                  row2["bookstoreid"] = bookstoreID;
                  row2["created_on"] = createdOn;
                  source.push(row2);
                  source2.push(row2);
                }
              }
            }
          }
        }
        const csv = jsonToCsvData(source, {
          fields: [
            "bookrow_id",
            "bookstoreid",
            // "storeid",
            // "storenumber",
            // "storedisplayname",
            "termname",
            "campusname",
            // "department",
            "departmentname",
            "coursename",
            // "section",
            "sectionname",
            "instructor",
            // "schoolname",
            "bookimage",
            "title",
            "edition",
            "author",
            "isbn",
            "materialtype",
            "requirementtype",
            "publisher",
            // "publishercode",
            "copyrightyear",
            "pricerangedisplay",
            "booklink",
            // "store_url",
            "user_guid",
            "course_codes",
            "created_on",
            "last_updated_on",
            "file_code",
            "title_id",
          ],
        });
        fs.appendFileSync(`./csv/${storeNames}_${storeIdHere}.csv`, csv);
        console.log("saved json data in csv");
      });
  }
}

function getHeaderString() {
  return {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
  };
}

function getBlankRow() {
  return {
      bookrow_id: "",
      bookstoreid: "",
      // storeid: "",
      // storenumber: "",
      // storedisplayname: "",
      termname: "",
      campusname: "",
      // department: "",
      departmentname: "",
      coursename: "",
      // section: "",
      sectionname: "",
      instructor: "",
      // schoolname: "",
      bookimage: "",
      title: "",
      edition: "",
      author: "",
      isbn: "",
      materialtype: "",
      requirementtype: "",
      publisher: "",
      // publishercode: "",
      copyrightyear: "",
      pricerangedisplay: "",
      booklink: "",
      // store_url: "",
      user_guid: "",
      course_codes: "",
      created_on: "",
      last_updated_on: "",
      file_code: "",
      title_id: "",
  }
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitRandomTime() {
  // Generate a random wait time between 1 to 5 seconds (in milliseconds)
  const minDelay = 2000; // 1 second = 1000 milliseconds
  const maxDelay = 3000; // 5 seconds = 5000 milliseconds
  const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
  
  // Use the 'delay' function to introduce the delay
  await delay(randomDelay);
  
}
