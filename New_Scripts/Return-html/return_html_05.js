import fetch from "node-fetch";
import * as cheerio from "cheerio";
import ObjectsToCsv from "objects-to-csv";

let fullData = [];

let storeName = "miamioh";
let bookstore_id = 2681;
let storeid = "B00082";

let store_url = `https://${storeName}.ecampus.com/`;

async function fetchData() {
  let terms = await getTerm(storeName);
  //term.length set this zero initially then change to where the script stopped
  for (let t = 0; t < terms.length; t++) {
    let termName = terms[t].termName;
    let termId = terms[t].termId;
    if (!terms) {
      console.log("Term Not found");
    } else {
      let campuses = await getCampus(termId);
      if (!campuses) {
        console.log("No campuses");
      } else {
        //campuses.length set this zero initially then change to where the script stopped
        for (let cs = 0; cs < 1; cs++) {
          let campusesName = campuses[cs];
          let department = await getDepartments(termId, campusesName);
          if (!department) {
            console.log("No courses");
          } else {
            //department.length set this zero initially then change to where the script stopped
            for (let d = 0; d < 10; d++) {
              let departmentName = department[d];
              let courses = await getCourses(
                termId,
                campusesName,
                departmentName
              );
              if (!courses) {
                console.log("No courses Found");
              } else {
                //courses.length set this zero initially then change to where the script stopped
                for (let c = 0; c < courses.length; c++) {
                  let coursesName = courses[c];
                  let sections = await getSection(
                    termId,
                    campusesName,
                    departmentName,
                    coursesName
                  );
                  if (!sections) {
                    console.log("No sections Found");
                  } else {
                    for (let s = 0; s < sections.length; s++) {
                      const sectionId = sections[s].sectionId;
                      const sectionName = sections[s].sectionName;
                      console.log(departmentName, coursesName, sectionId);
                      let bookdetails = await getBooksDetails(sectionId);
                      let $ = cheerio.load(bookdetails);
                      console.log(
                        "Total Books",
                        $(`#course-books-${sectionId} > div.course-book`).length
                      );
                      let bookLength = $(
                        `#course-books-${sectionId} > div.course-book`
                      ).length;

                      let displayName = $(
                        `#course-list-v2-body > div:nth-child(${2}) > header > div > div.title-bar.with-logo > div.logo > a > img`
                      ).attr("alt");
                      if (bookLength > 0) {
                        for (let b = 0; b < bookLength; b++) {
                          const requirement = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(`div.importance-required > div.sr-only`)
                            .text();
                          const bookImage = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-image > img`
                            )
                            .attr("src");
                          const bookName = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.title > h3`
                            )
                            .text();
                          const author = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.author`
                            )
                            .text();
                          const isbnRow = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.book-data-wrapper div.isbn`
                            )
                            .text()
                            .trim();
                          const isbn = isbnRow
                            .slice(isbnRow.indexOf(":") + 1)
                            .replace(/\s/g, "");
                          const editionRow = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.book-data-wrapper div.edition`
                            )
                            .text();
                          const edition = editionRow
                            .slice(editionRow.indexOf(":") + 1)
                            .replace(/\s/g, "");
                          const publisherRow = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.book-data-wrapper div.publisher`
                            )
                            .text();
                          const publisher = publisherRow
                            .slice(publisherRow.indexOf(":") + 1)
                            .replace(/\s/g, "");
                          const copyrightRow = $(
                            `#course-books-${sectionId} > div.course-book`
                          )
                            .eq(b)
                            .find(
                              `div.course-book-info > div.course-book-details > div.book-data-wrapper div.cl-copyright`
                            )
                            .text();
                          const copyRight = copyrightRow
                            .slice(copyrightRow.indexOf(":") + 1)
                            .replace(/\s/g, "");
                          const price =
                            $(`#course-books-${sectionId} > div.course-book`)
                              .eq(b)
                              .find(`div.pricing`)
                              .find("ul.option-sortable > li")
                              .eq(1)
                              .attr("data-sort-price") + "$";
                          fullData.push({
                            bookrow_id: "",
                            bookstoreid: bookstore_id,
                            termname: "spring-24",
                            campusname: "",
                            departmentname: departmentsName,
                            coursename: CoursesName,
                            sectionname: sectionName,
                            instructor: "",
                            bookimage: bookImage,
                            title: bookName,
                            edition: edition,
                            author: author,
                            isbn: isbn,
                            materialtype: "",
                            requirementtype: requirement,
                            publisher: publisher,
                            copyrightyear: copyRight,
                            pricerangedisplay: price,
                            booklink: "",
                            user_guid: "",
                            course_codes: "",
                            created_on: dateTime,
                            last_updated_on: dateTime,
                            file_code: "",
                            title_id: "",
                          });
                          console.log(
                            '"Found"',
                            storeName,
                            storeid,
                            termName,
                            t,
                            campusesName,
                            cs,
                            "Depart " + departmentName,
                            d,
                            "Course " + coursesName,
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
                          departmentname: departmentsName,
                          coursename: CoursesName,
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
                          campusesName,
                          cs,
                          "Depart " + departmentName,
                          d,
                          "Course " + coursesName,
                          c,
                          "section " + sectionName,
                          s
                        );
                      }
                    }
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
    .toDisk(`return_html_${storeName}_des01.csv`, { append: true })
    .then(console.log("Succesfully Data save into CSV"));
}

async function getBooksDetails(sectionId) {
  let res = "";
  try {
    let str = await fetch(
      `https://${storeName}.ecampus.com/course-list?sbc=1&c=${sectionId}|`,
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

async function getSection(termId, campusesName, departmentName, coursesName) {
  let res = "";
  let setions = [];
  try {
    let str = await fetch(
      `https://${storeName}.ecampus.com/include/get-course-levels-options?s=${termId}&c1=${campusesName}&c2=${departmentName}&c3=${coursesName}`
    );
    res = await str.text();
  } catch (error) {
    console.log("Course API", error);
  }
  let $ = cheerio.load(res);
  for (let s = 0; s < $("option").length; s++) {
    const sectionName = $("option").eq(s).text();
    const sectionId = $("option").eq(s).attr("value");
    setions.push({ sectionName, sectionId });
  }
  return setions;
}

async function getCourses(termId, campusName, departmentName) {
  let res = "";
  let courses = [];
  try {
    let str = await fetch(
      `https://${storeName}.ecampus.com/include/get-course-levels-options?s=${termId}&c1=${campusName}&c2=${departmentName}`
    );
    res = await str.text();
  } catch (error) {
    console.log("Course API", error);
  }
  let $ = cheerio.load(res);
  for (let c = 0; c < $("option").length; c++) {
    const course = $("option").eq(c).text();
    courses.push(course);
  }
  return courses;
}

async function getDepartments(termId, campusName) {
  let res = "";
  let departments = [];
  try {
    let str = await fetch(
      `https://${storeName}.ecampus.com/include/get-course-levels-options?s=${termId}&c1=${campusName}`
    );
    res = await str.text();
  } catch (error) {
    console.log("Department API", error);
  }
  let $ = cheerio.load(res);
  for (let d = 0; d < $("option").length; d++) {
    const dep = $("option").eq(d).text();
    departments.push(dep);
  }
  return departments;
}

async function getCampus(termId) {
  let res = "";
  let campuses = [];
  try {
    let str = await fetch(
      `https://${storeName}.ecampus.com/include/get-course-levels-options?s=${termId}`
    );
    res = await str.text();
  } catch (error) {
    console.log("campus API", error);
  }
  let $ = cheerio.load(res);
  for (let cs = 0; cs < $("option").length; cs++) {
    const campus = $("option").eq(cs).text();
    campuses.push(campus);
  }
  return campuses;
}

async function getTerm(storeName) {
  let res = "";
  let terms = [];
  try {
    let str = await fetch(`https://${storeName}.ecampus.com/shop-by-course`);
    res = await str.text();
  } catch (error) {
    console.log("Department API", error);
  }
  let $ = cheerio.load(res);
  for (let t = 0; t < $("#selSemesters > option").length; t++) {
    const termName = $("#selSemesters > option").eq(t).text();
    const termId = $("#selSemesters > option").eq(t).attr("value");
    terms.push({ termName, termId });
  }
  return terms;
}

const headers = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US, en; q=0.9",
  "Content-Type": "text/html; charset=utf-8",
  Connection: "keep-alive",
  gzip: true,
};

let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;
