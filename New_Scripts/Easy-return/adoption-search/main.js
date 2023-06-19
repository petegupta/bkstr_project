import fetch from "node-fetch";
import ObjectsToCsv from "objects-to-csv";

let fullData = [];
//Enter the following entries according to the google sheet entries of store that uses this return-easy script
let code = 6283135;
let storeName = "ncsu";
let bookstore_id = 2742;
let storeid = "B00143";

let store_url = `https://shop.${storeName}.edu/`;

async function fetchData() {
  let terms = await getTerm(storeName);
  if (!terms) {
    console.log("Term Not found");
  } else {
    let termLength = terms.adoptionSearchParam.Options.length;
    // Enter the term length if script stopped in middle or set this as zero initially
    for (let t = 0; t < termLength; t++) {
      let termName = terms.adoptionSearchParam.Options[t].name;
      let termId = terms.adoptionSearchParam.Options[t].id;
      let departments = await getDepartments(termId);
      if (!departments) {
        console.log("No campuses");
      } else {
        let departmentLength = departments.adoptionSearchParam.Options.length;
        // Enter the department length if script stopped in middle or set this as zero initially
        for (let d = 0; d < departmentLength; d++) {
          let departmentsId = departments.adoptionSearchParam.Options[d].id;
          let departmentsName = departments.adoptionSearchParam.Options[d].name;
          let Courses = await getCourses(termId, departmentsId);
          if (!Courses) {
            console.log("No courses");
          } else {
            let courseLenght = Courses.adoptionSearchParam.Options.length;
            // Enter the course length if script stopped in middle or set this as zero initially
            for (let c = 0; c < courseLenght; c++) {
              let CoursesId = Courses.adoptionSearchParam.Options[c].id;
              let CoursesName = Courses.adoptionSearchParam.Options[c].name;
              let Sections = await getSection(termId, departmentsId, CoursesId);
              if (!Sections) {
                console.log("No Section Found");
              } else {
                let sectionLength = Sections.adoptionSearchParam.Options.length;
                // Enter the section length if script stopped in middle or set this as zero initially
                for (let s = 0; s < sectionLength; s++) {
                  const sectionId = Sections.adoptionSearchParam.Options[s].id;
                  const sectionName =
                    Sections.adoptionSearchParam.Options[s].name;
                  let bookdetails = await getBooksDetails(sectionId);
                  if (!(bookdetails[0].items == null)) {
                    for (let b = 0; b < bookdetails[0].items.length; b++) {
                      const priceId = bookdetails[0].items[b].itemId;
                      const bookPrice = await getPrice(priceId);
                      fullData.push({
                        bookrow_id: "",
                        bookstoreid: bookstore_id,
                        storeid: storeid,
                        storenumber: "",
                        storedisplayname: bookdetails[0].school,
                        termid: termId,
                        termname: termName,
                        termnumber: "",
                        programid: "",
                        programname: "",
                        campusid: "",
                        campusname: "",
                        department: "",
                        departmentname: departmentsName,
                        division: "",
                        divisionname: "",
                        courseid: "",
                        coursename: CoursesName,
                        section: sectionId,
                        sectionname: sectionName,
                        instructor: "",
                        schoolname: bookdetails[0].school,
                        cmid: "",
                        mtcid: "",
                        bookimage: bookdetails[0].items[b].image,
                        title: bookdetails[0].items[b].longTitle,
                        edition: bookdetails[0].items[b].bookEdition,
                        author: bookdetails[0].items[b].bookAuthor,
                        isbn: bookdetails[0].items[b].isbn,
                        materialtype: "",
                        requirementtype:
                          bookdetails[0].items[b].courseMaterialRequirement,
                        publisher: bookdetails[0].items[b].publisher,
                        publishercode: "",
                        publisherDate: " ",
                        productcatentryid: "",
                        copyrightyear: bookdetails[0].items[b].copyrightDate,
                        pricerangedisplay: bookPrice,
                        booklink: "",
                        store_url: store_url,
                        user_guid: "",
                        course_codes: "",
                        created_on: dateTime,
                        last_updated_on: dateTime,
                      });
                      console.log(
                        '"Found"',
                        storeName,
                        storeid,
                        termName,
                        t,
                        "Depart " + departmentsName,
                        d,
                        "Course " + CoursesName,
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
                      storeid: storeid,
                      storenumber: "",
                      storedisplayname: bookdetails[0].school,
                      termid: termId,
                      termname: termName,
                      termnumber: "",
                      programid: "",
                      programname: "",
                      campusid: "",
                      campusname: "",
                      department: "",
                      departmentname: departmentsName,
                      division: "",
                      divisionname: "",
                      courseid: "",
                      coursename: CoursesName,
                      section: sectionId,
                      sectionname: sectionName,
                      instructor: "",
                      schoolname: bookdetails[0].school,
                      cmid: "",
                      mtcid: "",
                      bookimage: "",
                      title: "",
                      edition: "",
                      author: "",
                      isbn: "",
                      materialtype: "",
                      requirementtype: "",
                      publisher: "",
                      publishercode: "",
                      publisherDate: "",
                      productcatentryid: "",
                      copyrightyear: "",
                      pricerangedisplay: "",
                      booklink: "",
                      store_url: store_url,
                      user_guid: "",
                      course_codes: "",
                      created_on: dateTime,
                      last_updated_on: dateTime,
                    });
                    console.log(
                      '"Not Found"',
                      storeName,
                      storeid,
                      termName,
                      t,
                      "Depart " + departmentsName,
                      d,
                      "Course " + CoursesName,
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
    .toDisk(`../adoption_search_data/adoption_search_${storeName}_.csv`, {
      append: true,
    })
    .then(console.log("Succesfully Data save into CSV"));
}

async function getPrice(priceId) {
  let res = "";
  let price;
  try {
    let str = await fetch(
      `https://shop.${storeName}.edu/api/items?c=${code}&country=US&currency=USD&facet.exclude=custitem_ns_sc_ext_only_pdp%2Ccustitem_ns_sc_ext_gift_cert_group_id%2Citemtype&fieldset=search&id=${priceId}&include=facets&language=en&n=2&pricelevel=5&use_pcv=F`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.json();
  } catch (error) {
    console.log("Books Details API", error);
  }
  if (res.errors == "URL not found" || res.code == 404) {
    price = "";
  } else {
    let bookPrice = res;
    let priceMin =
      bookPrice.facets[bookPrice.facets.length - 1].min == undefined
        ? " "
        : bookPrice.facets[bookPrice.facets.length - 1].min;
    let priceMax =
      bookPrice.facets[bookPrice.facets.length - 1].max == undefined
        ? " "
        : bookPrice.facets[bookPrice.facets.length - 1].max;
    price = priceMin == priceMax ? `$${priceMax}` : `$${priceMin}-${priceMax}`;
  }
  return price;
}

async function getBooksDetails(sectionId) {
  let res = "";
  try {
    let str = await fetch(
      `https://shop.${storeName}.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&ccId=${sectionId}&n=2&searchAdoptions=true`,
      {
        method: "GET",
        mode: "cors",
        headers: headers,
      }
    );
    res = await str.json();
  } catch (error) {
    console.log("Books Details API", error);
  }
  return res;
}

async function getSection(termId, departmentId, courseId) {
  let res = "";
  try {
    let str = await fetch(
      //https://shop.ncsu.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=6283135&n=2&searchAdoptionParameters=true
      `https://shop.${storeName}.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=${courseId}&department=${departmentId}&isAllowed=true&n=2&school=&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("section API", error);
  }
  return res;
}

async function getCourses(termId, departmentId) {
  let res = "";
  try {
    let str = await fetch(
      `https://shop.${storeName}.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=&department=${departmentId}&isAllowed=true&n=2&school=&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("course API", error);
  }

  return res;
}

async function getDepartments(termId) {
  let res = "";
  try {
    let str = await fetch(
      `https://shop.${storeName}.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&catalogNmbr=&department=&isAllowed=true&n=2&school=&searchAdoptionParameters=true&term=${termId}`
    );
    res = await str.json();
  } catch (error) {
    console.log("Department API", error);
  }

  return res;
}

async function getTerm(storeName) {
  let res = "";
  try {
    let str = await fetch(
      `https://shop.${storeName}.edu/sca-dev-2021-1-0/extensions/CampusStores/AdoptionSearchExtension/1.2.3/services/AdoptionSearch.Service.ss?c=${code}&n=2&searchAdoptionParameters=true`
    );
    res = await str.json();
  } catch (error) {
    console.log("Department API", error);
  }

  return res;
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
