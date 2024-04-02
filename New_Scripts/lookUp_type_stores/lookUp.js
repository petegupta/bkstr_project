import fetch from "node-fetch";
import * as cheerio from "cheerio";
import ObjectsToCsv from "objects-to-csv";

const headers = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US, en; q=0.9",
  "Content-Type": "text/html; charset=utf-8",
  Connection: "keep-alive",
  gzip: true,
  Cookie: "SESS2e94621a7c50fa67c04ba0df25e666d5=b05d9ja01h8kln6vfkgr9bdk1c",
};
let fullData = [];

// Enter the required data from the google sheet provided to you that uses LookUp script.

let school_display_name = "Oklahoma State University Institute of Technology";
let storeName = "okstate";
let bookstore_id = 2699;
let storeid = "B00100";

async function fetchData() {
  let term = await getTerm(storeName);
  for (let t = 0; t < term.length; t++) {
    //term.length initially set as zero then set it according to where the script is stopped
    let termId = term[t].termid;
    let termName = term[t].termName;
    console.log(termId, termName);
    if (!term) {
      console.log("Term Not found");
    } else {
      let department = await Department(termId);
      if (!department) {
        console.log("No Departments");
      } else {
        //department length initially set as zero then set it according to where the script is stopped
        for (let d = 0; d < department.length; d++) {
          let departmentcode = department[d].departmentCode;
          let departmentName = department[d].departmentName;
          let courses = await getCourse(departmentcode);
          if (!courses) {
            console.log("No courses");
          } else {
            for (let c = 0; c < courses.length; c++) {
              //courses.length initially set as zero then set it according to where the script is stopped
              let courseCode = courses[c].courseCode;
              let corseName = courses[c].corseName;
              let sections = await getSection(courseCode);
              if (!sections) {
                console.log("No sections Found");
              } else {
                for (let s = 0; s < sections.length; s++) {
                  //sections.length initially set as zero then set it according to where the script is stopped
                  let sectionCode = sections[s].sectionCode;
                  let sectionName = sections[s].sectionName;
                  let bookdetails = await getBooksDetails(sectionCode);
                  let $ = cheerio.load(bookdetails);
                  let bookLength = $(
                    "#tcc-product > div > div.tcc-row > div.tcc-section-body.admin-gear > div.req-group.req-choice-0 > div.item.group"
                  ).length;
                  if (bookLength > 0) {
                    console.log("Total Found", bookLength);
                    for (let b = 0; b < bookLength; b++) {
                      let bookRequired = $(".req-group")
                        .eq(b)
                        .find(".title")
                        .text()
                        .trim();
                      for (
                        let i = 0;
                        i < $(".req-group").eq(b).find(".item").length;
                        i++
                      ) {
                        let bookName = $(".req-group")
                          .eq(b)
                          .find(".item")
                          .eq(i)
                          .find(".tcc-product-title")
                          .text()
                          .trim();
                        let nid = $(".req-group")
                          .eq(b)
                          .find(".item")
                          .eq(i)
                          .find(`.chooser-product`)
                          .attr("nid");
                        let cadoption = $(".req-group")
                          .eq(b)
                          .find(".item")
                          .eq(i)
                          .find(`.chooser-product`)
                          .attr("cadoption_id");
                        let bookInfos = await bookInfo(nid, cadoption);
                        let price = $(".req-group")
                          .eq(b)
                          .find(".item")
                          .eq(i)
                          .find(
                            "div.chooser-product > a.tcc-product-link > span.product-type-price"
                          )
                          .text();
                        fullData.push({
                          bookrow_id: "",
                          bookstoreid: bookstore_id,
                          termname: "spring-24",
                          campusname: "",
                          departmentname: departmentName,
                          coursename: corseName,
                          sectionname: sectionName,
                          instructor: "",
                          bookimage: bookInfos.bookimage,
                          title: bookName,
                          edition: bookInfos.edition,
                          author: bookInfos.author,
                          isbn: bookInfos.isbn,
                          materialtype: "",
                          requirementtype: bookRequired,
                          publisher: bookInfos.publisher,
                          copyrightyear: "",
                          pricerangedisplay: price,
                          booklink: "",
                          user_guid: "",
                          course_codes: "",
                          created_on: dateTime,
                          last_updated_on: dateTime,
                          file_code:"",
                          title_id:"",
                        });
                      }
                      console.log(
                        '"Found"',
                        storeName,
                        storeid,
                        termName,
                        t,
                        "Depart " + departmentName,
                        d,
                        "Course " + corseName,
                        c,
                        "section " + sectionName,
                        s,
                        b
                      );
                    }
                  } else {
                    fullData.push({
                      bookrow_id: "",
                      bookstoreid: bookstore_id,
                      termname: "spring-24",
                      campusname: "",
                      departmentname: departmentName,
                      coursename: corseName,
                      sectionname: sectionName,
                      instructor: "",
                      bookimage: "",
                      title: "",
                      edition: "",
                      author: "",
                      isbn: "",
                      materialtype: "",
                      requirementtype: "",
                      publisher: "",
                      copyrightyear: "",
                      pricerangedisplay: "",
                      booklink: "",
                      user_guid: "",
                      course_codes: "",
                      created_on: dateTime,
                      last_updated_on: dateTime,
                      file_code: "",
                      title_id: "",
                    });
                    console.log(
                      '"Not Found"',
                      storeName,
                      storeid,
                      termName,
                      t,
                      "Depart " + departmentName,
                      d,
                      "Course " + corseName,
                      c,
                      "section " + sectionName,
                      s
                    );
                  }
                }
              }
              CsvWriter(fullData);
              fullData = [];
            }
          }
        }
      }
    }
  }
}

fetchData();

async function CsvWriter() {
  const csv = new ObjectsToCsv(fullData);
  console.log("CSV Creating...");
  await csv
    .toDisk(`./lookUpTypeData/LookUpType_${storeName}_des01.csv`, {
      append: true,
    })
    .then(console.log("Succesfully Data save into CSV"));
}

async function bookInfo(nid, cadoption) {
  let res = "";
  try {
    let str = await fetch(
      `https://osuitbookstore.${storeName}.edu//timber/college/details/${nid}/${cadoption}`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.text();
  } catch (error) {
    console.log("Books Details API", error);
  }
  let $ = cheerio.load(res);
  let author = $(".view-content").find(".field-author").find(".data").text();
  let isbn = $(".view-content").find(".field-isbn").find(".data").text();
  let edition = $(".view-content").find(".field-edition").find(".data").text();
  let publisher = $(".view-content")
    .find(".field-publisher")
    .find(".data")
    .text();
  let publish_date = $(".view-content")
    .find(".field-pub-date")
    .find(".data")
    .text();
  let bookimage = $(".views-field").find(".field-image > img").attr("src");

  return {
    author,
    isbn,
    edition,
    publisher,
    publish_date,
    bookimage,
  };
}

async function getBooksDetails(bookCode) {
  let res = "";
  try {
    let str = await fetch(
      //osuitbookstore.okstate.edu
      `https://osuitbookstore.${storeName}.edu//timber/college/ajax?l=%2Fcollege_section%2F${bookCode}`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.text();
  } catch (error) {
    console.log("Books Details API", error);
  }
  return res;
}

async function getSection(sectionCode) {
  let res = "";
  let sections = [];
  try {
    let str = await fetch(
      `https://osuitbookstore.${storeName}.edu//timber/college/ajax?l=%2Fcollege_course%2F${sectionCode}`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.text();
  } catch (error) {
    console.log("Section API", error);
  }
  let $ = cheerio.load(res);
  for (
    let index = 1;
    index <= $("#tcc-college_section > div > div.tcc-row > div.item").length;
    index++
  ) {
    let sectionPath = $(
      `#tcc-college_section > div > div.tcc-row > div:nth-child(${index}) > a`
    ).attr("url");
    let sectionName = $(
      `#tcc-college_section > div > div.tcc-row > div:nth-child(${index})`
    ).text();
    sections.push({
      sectionCode: sectionPath.substring(sectionPath.lastIndexOf("/") + 1),
      sectionName: sectionName,
    });
  }
  return sections;
}

async function getCourse(department_Code) {
  let res = "";
  let courses = [];
  try {
    let str = await fetch(
      `https://osuitbookstore.${storeName}.edu//timber/college/ajax?l=%2Fcollege_dept%2F${department_Code}`,
      {
        Method: "GET",
        headers: headers,
      }
    );
    res = await str.text();
  } catch (error) {
    console.log("course API", error);
  }
  let $ = cheerio.load(res);
  for (
    let index = 1;
    index <= $("#tcc-college_course > div > div.tcc-row > div.item").length;
    index++
  ) {
    let CourseName = $(
      `#tcc-college_course > div > div.tcc-row > div:nth-child(${index})`
    ).text();
    let coursePath = $(
      `#tcc-college_course > div > div.tcc-row > div:nth-child(${index}) > a`
    ).attr("url");
    courses.push({
      courseCode: coursePath.substring(coursePath.lastIndexOf("/") + 1),
      corseName: CourseName,
    });
  }
  return courses;
}

async function Department(term) {
  let res = "";
  let departments = [];
  try {
    let str = await fetch(
      `https://osuitbookstore.${storeName}.edu//timber/college/ajax?l=%2Fcollege_term%2F${term}`
    );
    res = await str.text();
  } catch (error) {
    console.log("Department API", error);
  }
  let $ = cheerio.load(res);
  for (
    let index = 1;
    index <= $("#tcc-college_dept > div > div.tcc-row > div").length;
    index++
  ) {
    let departmentName = $(
      `#tcc-college_dept > div > div.tcc-row > div:nth-child(${index})`
    ).text();
    let departmentPath = $(
      `#tcc-college_dept > div > div.tcc-row > div:nth-child(${index}) > a`
    ).attr("url");

    departments.push({
      departmentCode: departmentPath.substring(
        departmentPath.lastIndexOf("/") + 1
      ),
      departmentName: departmentName,
    });
  }
  return departments;
}

async function getTerm(storeName) {
  let res = "";
  let term = [];
  try {
    let str = await fetch(
      `https://osuitbookstore.${storeName}.edu//timber/college`
    );
    res = await str.text();
  } catch (error) {
    console.log("term API", error);
  }
  let $ = await cheerio.load(res);
  let termLength = $("#tcc-college_term > div > div.tcc-row > div.item").length;
  console.log("Total terms", termLength);
  for (let i = 0; i < termLength; i++) {
    let termUrl = $("#tcc-college_term > div > div.tcc-row > div > a")
      .eq(i)
      .attr("url");
    term.push({
      termid: termUrl.substring(termUrl.lastIndexOf("/") + 1),
      termName: $("#tcc-college_term > div > div.tcc-row > div > a")
        .eq(i)
        .text(),
    });
  }
  return term;
}

let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;
